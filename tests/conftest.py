"""Optional dependency stubs for offline, lightweight pytest collection."""

import sys
import types
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))


def install(name, module):
    if name not in sys.modules:
        sys.modules[name] = module


# FastAPI/Pydantic are optional in a shell that only runs lightweight tests.
try:
    import fastapi  # noqa: F401
    import pydantic  # noqa: F401
except Exception:
    fastapi = types.ModuleType("fastapi")

    class FastAPI:
        def __init__(self, *args, **kwargs):
            pass

        def add_middleware(self, *args, **kwargs):
            pass

        def get(self, *args, **kwargs):
            return lambda function: function

        def post(self, *args, **kwargs):
            return lambda function: function

        def delete(self, *args, **kwargs):
            return lambda function: function

    class HTTPException(Exception):
        def __init__(self, status_code=None, detail=None, **kwargs):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail

    class UploadFile:
        pass

    fastapi.FastAPI = FastAPI
    fastapi.HTTPException = HTTPException
    fastapi.UploadFile = UploadFile
    fastapi.File = lambda *args, **kwargs: None
    install("fastapi", fastapi)

    fastapi_middleware = types.ModuleType("fastapi.middleware")
    fastapi_middleware.__path__ = []
    fastapi_cors = types.ModuleType("fastapi.middleware.cors")

    class CORSMiddleware:
        pass

    fastapi_cors.CORSMiddleware = CORSMiddleware
    install("fastapi.middleware", fastapi_middleware)
    install("fastapi.middleware.cors", fastapi_cors)

    pydantic = types.ModuleType("pydantic")

    class BaseModel:
        def __init__(self, **kwargs):
            for key, value in kwargs.items():
                setattr(self, key, value)

        def model_dump(self):
            return {
                key: value
                for key, value in self.__dict__.items()
            }

    pydantic.BaseModel = BaseModel
    pydantic.Field = lambda default=None, *args, **kwargs: default
    install("pydantic", pydantic)


def install(name, module):
    if name not in sys.modules:
        sys.modules[name] = module


# NLTK is unavailable in some local shells.
try:
    import nltk  # noqa: F401
except Exception:
    nltk = types.ModuleType("nltk")
    nltk.sent_tokenize = lambda text: [
        sentence.strip()
        for sentence in str(text).replace("\n", " ").split(". ")
        if sentence.strip()
    ]
    install("nltk", nltk)


# PyMuPDF is optional for pure unit tests.
try:
    import pymupdf  # noqa: F401
except Exception:
    pymupdf = types.ModuleType("pymupdf")

    class _FakeDocument:
        needs_pass = False
        metadata = {}

        def __iter__(self):
            return iter([])

        def close(self):
            pass

    pymupdf.open = lambda *args, **kwargs: _FakeDocument()
    install("pymupdf", pymupdf)


# Torch/transformers are not used by unit tests and must not trigger downloads.
try:
    import torch  # noqa: F401
except Exception:
    torch = types.ModuleType("torch")

    class _Cuda:
        @staticmethod
        def is_available():
            return False

        @staticmethod
        def synchronize():
            pass

    torch.cuda = _Cuda()
    torch.inference_mode = lambda: _nullcontext()
    install("torch", torch)


def _nullcontext():
    class Ctx:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

    return Ctx()


try:
    import transformers  # noqa: F401
except Exception:
    transformers = types.ModuleType("transformers")

    class _FakeTokenizer:
        def encode(self, text, add_special_tokens=True):
            return str(text).split()

        def decode(self, ids, skip_special_tokens=True):
            return " ".join(str(value) for value in ids)

        def __call__(self, text, **kwargs):
            import torch

            class Batch:
                input_ids = types.SimpleNamespace(shape=(1, len(str(text).split())))
                attention_mask = object()

            return Batch()

    class _FakeModel:
        @classmethod
        def from_pretrained(cls, name):
            return cls()

        def to(self, device):
            return self

        def eval(self):
            return self

        def generate(self, **kwargs):
            return [[1, 2, 3]]

    transformers.AutoTokenizer = types.SimpleNamespace(
        from_pretrained=lambda name: _FakeTokenizer()
    )
    transformers.AutoModelForSeq2SeqLM = _FakeModel
    install("transformers", transformers)


# YAKE and Google services are mocked out so tests remain offline.
try:
    import yake  # noqa: F401
except Exception:
    yake = types.ModuleType("yake")

    class _KeywordExtractor:
        def __init__(self, **kwargs):
            self.stopword_set = set()

        def extract_keywords(self, text):
            return []

    yake.KeywordExtractor = _KeywordExtractor
    install("yake", yake)


# API imports Gemini configuration but tests never call the network.
try:
    import dotenv  # noqa: F401
except Exception:
    dotenv = types.ModuleType("dotenv")
    dotenv.load_dotenv = lambda *args, **kwargs: False
    install("dotenv", dotenv)


try:
    from google import genai  # noqa: F401
except Exception:
    google = sys.modules.setdefault("google", types.ModuleType("google"))
    google.__path__ = []
    genai = types.ModuleType("google.genai")

    class _Client:
        def __init__(self, *args, **kwargs):
            pass

    genai.Client = _Client
    genai_errors = types.ModuleType("google.genai.errors")
    genai_errors.ServerError = type("ServerError", (Exception,), {})
    genai_types = types.ModuleType("google.genai.types")
    genai_types.Content = type("Content", (), {})
    genai_types.Part = type("Part", (), {})
    genai_types.GenerateContentConfig = type("GenerateContentConfig", (), {})
    genai.errors = genai_errors
    genai.types = genai_types
    install("google.genai", genai)
    install("google.genai.errors", genai_errors)
    install("google.genai.types", genai_types)
