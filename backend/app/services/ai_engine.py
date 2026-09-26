
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Check your .env file."
    )

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-3.6-flash"
MAX_ATTEMPTS = 3
RETRY_DELAY_SECONDS = 2


def run_ai(prompt: str, user_input: str) -> str:
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=f"{prompt}\n\nInput:\n{user_input}",
            )

            if not response.text:
                raise RuntimeError(
                    "Gemini returned an empty response."
                )

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

            # Retry only temporary server errors.
            if code in (500, 502, 503, 504):
                if attempt < MAX_ATTEMPTS:
                    delay = RETRY_DELAY_SECONDS * attempt
                    print(
                        f"Gemini returned HTTP {code}. "
                        f"Retrying in {delay} seconds "
                        f"({attempt}/{MAX_ATTEMPTS - 1})..."
                    )
                    time.sleep(delay)
                    continue

                raise RuntimeError(
                    f"Gemini server error (HTTP {code}) "
                    f"after {MAX_ATTEMPTS} attempts. "
                    "The service may be experiencing high "
                    "demand. Please try again later."
                ) from e

            raise RuntimeError(
                f"Gemini server error (HTTP {code}): {e}"
            ) from e

        except RuntimeError:
            raise

        except Exception as e:
            raise RuntimeError(
                f"Unexpected AI error: {e}"
            ) from e

    raise RuntimeError("Gemini request failed unexpectedly.")