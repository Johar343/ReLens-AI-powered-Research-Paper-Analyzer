
import yake


CUSTOM_STOPWORDS = {
    "model",
    "models",
    "input",
    "output",
    "layer",
    "layers",
    "using",
    "used",
    "based",
    "approach",
    "method",
    "methods",
    "results",
    "work",
    "paper",
    "shown",
    "given",
    "different",
    "following"
}


def extract_keywords(
    text: str,
    max_keywords: int = 15,
    ngram_size: int = 3
) -> list[dict]:

    if not text or not text.strip():
        return []

    # Combine YAKE's default English stopwords
    # with our additional generic technical terms.
    stopwords = set(yake.KeywordExtractor(lan="en").stopword_set)
    stopwords.update(CUSTOM_STOPWORDS)

    extractor = yake.KeywordExtractor(
        lan="en",
        n=ngram_size,
        dedupLim=0.9,
        top=max_keywords,
        stopwords=stopwords
    )

    extracted_keywords = extractor.extract_keywords(text)

    return [
        {
            "keyword": keyword,
            "score": round(score, 4)
        }
        for keyword, score in extracted_keywords
    ]
