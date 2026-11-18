
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types


load_dotenv()

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
MAX_INPUT_TOKENS = 200_000


SYSTEM_INSTRUCTION = """
You are ReLens, a friendly and knowledgeable academic research assistant.

Your job is to help users understand research papers through
natural, conversational explanations.

SOURCE RULES:
1. Answer using only the research paper provided.
2. Never invent information or introduce unsupported claims.
3. If the paper does not contain enough information,
   clearly say so.
4. Include relevant page numbers when available.
5. Distinguish the authors' claims from your own explanations.

COMMUNICATION STYLE:
1. Use natural, fluent, conversational English.
2. Sound like a knowledgeable person explaining research
   to a curious student.
3. Prefer a relaxed, friendly US/UK conversational tone.
4. Avoid unnecessarily formal or robotic language.
5. Do not copy entire technical sentences from the paper
   unless quoting them is useful.

TECHNICAL ACCURACY:
1. Preserve important technical terminology.
2. Never replace a technical concept with an inaccurate
   oversimplification.
3. When introducing a difficult technical term, explain
   what it means in simpler language.
4. Keep mathematical expressions, model names and
   technical definitions accurate.

ANSWER STRUCTURE:
1. Start with a direct answer.
2. Explain the reasoning in conversational language.
3. Use bullet points when they improve readability.
4. Include page references alongside relevant claims.
5. Keep answers focused on what the user actually asked.

If a question is unrelated to the uploaded paper,
politely explain that you specialise in answering
questions about the uploaded research paper.
"""


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing.")

    return genai.Client(api_key=api_key)


def format_paper_context(pages: list[dict]) -> str:
    formatted_pages = []

    for page in pages:
        page_number = page["page_number"]
        page_text = page["text"].strip()

        if page_text:
            formatted_pages.append(
                f"[PAGE {page_number}]\n{page_text}"
            )

    return "\n\n".join(formatted_pages)


def ask_gemini(
    pages: list[dict],
    question: str,
    chat_history: list[dict] | None = None
) -> str:

    if not question.strip():
        raise ValueError("Question cannot be empty.")

    if not pages:
        raise ValueError("Paper content is missing.")

    client = get_gemini_client()
    paper_context = format_paper_context(pages)

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(
                    text=(
                        "The following is the uploaded research paper. "
                        "Use it as the source for all answers.\n\n"
                        + paper_context
                    )
                )
            ]
        )
    ]

    # Include temporary conversation history.
    for message in chat_history or []:
        role = message.get("role")
        text = message.get("text", "").strip()

        if role not in {"user", "model"} or not text:
            continue

        contents.append(
            types.Content(
                role=role,
                parts=[types.Part(text=text)]
            )
        )

    contents.append(
        types.Content(
            role="user",
            parts=[types.Part(text=question)]
        )
    )

    # Check input size before sending the request.
    token_result = client.models.count_tokens(
        model=GEMINI_MODEL,
        contents=contents
    )

    if token_result.total_tokens > MAX_INPUT_TOKENS:
        raise ValueError(
            "This paper and conversation exceed ReLens's "
            "current context limit. Please use a shorter paper."
        )

    response = None

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.2,
                    max_output_tokens=1500
                )
            )
            break

        except errors.ServerError as error:
            if attempt == 2:
                raise RuntimeError(
                    "Gemini is temporarily unavailable. Please try again later."
                ) from error

            time.sleep(2 ** (attempt + 1))

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text.strip()
