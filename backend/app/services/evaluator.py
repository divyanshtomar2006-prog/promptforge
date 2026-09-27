
import os
import json
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai import errors

load_dotenv()

DEMO_MODE = (
    os.getenv("PROMPTFORGE_DEMO_MODE", "false").lower() == "true"
)
api_key = os.getenv("GEMINI_API_KEY")

# Allow startup without an API key in Demo Mode.
client = genai.Client(api_key=api_key) if api_key else None

MODEL_NAME = "gemini-3.6-flash"
MAX_ATTEMPTS = 3
RETRY_DELAY_SECONDS = 2


def evaluate_output(
    prompt: str,
    user_input: str,
    expected_output: str,
    actual_output: str
):
    if DEMO_MODE:
        return {
            "score": None,
            "passed": None,
            "reason": (
                "Demo Mode: this is a sample AI output. "
                "No real evaluation was performed."
            ),
            "criteria": {
                "correctness": None,
                "relevance": None,
                "completeness": None
            },
            "demo_mode": True
        }

    if client is None:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Configure it or enable Demo Mode."
        )

    judge_prompt = f"""
You are a strict AI test evaluator for a prompt testing platform.

Compare the ACTUAL OUTPUT against the EXPECTED OUTPUT.
The expected output defines what this test case requires.
Do not give a high score simply because the actual answer
is generally correct.

Prompt:
{prompt}

User Input:
{user_input}

EXPECTED OUTPUT:
{expected_output}

ACTUAL OUTPUT:
{actual_output}

Evaluate these three criteria from 0 to 100:

1. correctness:
Does the actual output satisfy the factual/content requirements
of the expected output?

2. relevance:
Does the actual output address what the expected output requires?

3. completeness:
Does the actual output contain the important information required
by the expected output?

If the actual output contradicts a key claim in the expected
output, give correctness a low score.

Return ONLY valid JSON with this structure:
{{
    "correctness": 0,
    "relevance": 0,
    "completeness": 0,
    "reason": "short explanation"
}}
"""

    response = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=judge_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema={
                        "type": "OBJECT",
                        "properties": {
                            "correctness": {"type": "INTEGER"},
                            "relevance": {"type": "INTEGER"},
                            "completeness": {"type": "INTEGER"},
                            "reason": {"type": "STRING"}
                        },
                        "required": [
                            "correctness",
                            "relevance",
                            "completeness",
                            "reason"
                        ]
                    }
                )
            )
            break

        except errors.ClientError as e:
            code = getattr(e, "code", None)

            if code == 429:
                raise RuntimeError(
                    "Gemini API quota exceeded while evaluating "
                    "the output. Check your API usage and retry "
                    "after the quota resets."
                ) from e

            raise RuntimeError(
                f"Gemini evaluation API error (HTTP {code}): {e}"
            ) from e

        except errors.ServerError as e:
            code = getattr(e, "code", None)

            if code in (500, 502, 503, 504):
                if attempt < MAX_ATTEMPTS:
                    delay = RETRY_DELAY_SECONDS * attempt
                    print(
                        f"Gemini evaluation returned HTTP {code}. "
                        f"Retrying in {delay} seconds "
                        f"({attempt}/{MAX_ATTEMPTS - 1})..."
                    )
                    time.sleep(delay)
                    continue

                raise RuntimeError(
                    f"Gemini evaluation failed with HTTP {code} "
                    f"after {MAX_ATTEMPTS} attempts. "
                    "The service may be experiencing high demand. "
                    "Please try again later."
                ) from e

            raise RuntimeError(
                f"Gemini evaluation server error (HTTP {code}): {e}"
            ) from e

        except Exception as e:
            raise RuntimeError(
                f"Unexpected evaluation error: {e}"
            ) from e

    if response is None or not response.text:
        raise RuntimeError(
            "Gemini returned an empty evaluation response."
        )

    try:
        evaluation = json.loads(response.text)
    except (json.JSONDecodeError, TypeError) as e:
        raise RuntimeError(
            "Gemini returned an invalid evaluation response."
        ) from e

    required_keys = [
        "correctness",
        "relevance",
        "completeness",
        "reason"
    ]

    if not all(key in evaluation for key in required_keys):
        raise RuntimeError(
            "Gemini evaluation response is missing required fields."
        )

    scores = [
        evaluation["correctness"],
        evaluation["relevance"],
        evaluation["completeness"]
    ]

    if any(
        not isinstance(value, int) or isinstance(value, bool)
        or not 0 <= value <= 100
        for value in scores
    ):
        raise RuntimeError(
            "Gemini returned invalid evaluation scores."
        )

    score = round(sum(scores) / 3)
    passed = score >= 70

    return {
        "score": score,
        "passed": passed,
        "reason": evaluation["reason"],
        "criteria": {
            "correctness": evaluation["correctness"],
            "relevance": evaluation["relevance"],
            "completeness": evaluation["completeness"]
        }
    }