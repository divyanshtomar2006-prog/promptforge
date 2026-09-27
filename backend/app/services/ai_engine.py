
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
DEMO_MODE = os.getenv("PROMPTFORGE_DEMO_MODE", "false").lower() == "true"

# Allow the application to start without a Gemini key in Demo Mode.
client = genai.Client(api_key=api_key) if api_key else None

MODEL_NAME = "gemini-3.6-flash"
MAX_ATTEMPTS = 3
RETRY_DELAY_SECONDS = 2


def run_ai(prompt: str, user_input: str) -> str:
    if DEMO_MODE:
        return (
            "[DEMO MODE — SAMPLE OUTPUT]\n\n"
            "This is a sample response, not a live Gemini result.\n\n"
            f"Prompt: {prompt}\n\n"
            f"Input:\n{user_input}"
        )

    if client is None:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Configure it to use live AI."
        )

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=f"{prompt}\n\nInput:\n{user_input}",
            )

            if not response.text:
                raise RuntimeError("Gemini returned an empty response.")

            return response.text

        except errors.ClientError as e:
            code = getattr(e, "code", None)

            if code == 429:
                raise RuntimeError(
                    "Gemini API quota or rate limit exceeded. "
                    "Check your Gemini API usage and retry "
                    "after the quota resets."
                ) from e

            raise RuntimeError(
                f"Gemini client error (HTTP {code}): {e}"
            ) from e

        except errors.ServerError as e:
            code = getattr(e, "code", None)

            if code in (500, 502, 503, 504):
                if attempt < MAX_ATTEMPTS:
                    delay = RETRY_DELAY_SECONDS * attempt
                    time.sleep(delay)
                    continue

            raise RuntimeError(
                f"Gemini server error (HTTP {code}): {e}"
            ) from e

    raise RuntimeError("Gemini request failed after retries.")