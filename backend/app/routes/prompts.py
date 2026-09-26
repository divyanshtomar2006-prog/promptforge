
import os

from fastapi import APIRouter, HTTPException

from backend.app.schemas import PromptRequest, PromptResponse
from backend.app.services.ai_engine import run_ai


router = APIRouter(
    prefix="/api/v1/prompts",
    tags=["Prompts"]
)


def generate_demo_output(prompt: str, user_input: str) -> str:
    """Return a clearly labelled sample response without calling Gemini."""

    prompt_lower = prompt.lower()
    input_lower = user_input.lower()

    if "binary search" in input_lower:
        sample = (
            "Binary search is an algorithm used to find an element "
            "in a sorted list. It repeatedly checks the middle element "
            "and eliminates half of the remaining search space. "
            "Its time complexity is O(log n)."
        )
    elif "recursion" in input_lower:
        sample = (
            "Recursion is a programming technique in which a function "
            "calls itself to solve smaller versions of a problem. "
            "A base case stops the recursive calls."
        )
    elif "operating system" in input_lower:
        sample = (
            "An operating system manages computer hardware and software "
            "resources. It handles processes, memory, files, and devices."
        )
    elif "short" in prompt_lower or "brief" in prompt_lower:
        sample = (
            f"Demo response: {user_input}. "
            "This is a short sample answer for testing PromptForge."
        )
    else:
        sample = (
            f"Demo response for your input: {user_input}\n\n"
            "This sample demonstrates how PromptForge displays AI output. "
            "It is not a real Gemini response."
        )

    return "[DEMO MODE — SAMPLE OUTPUT]\n\n" + sample


@router.post("/run", response_model=PromptResponse)
def run_prompt(request: PromptRequest):
    demo_mode = (
        os.getenv("PROMPTFORGE_DEMO_MODE", "false").lower()
        in ("true", "1", "yes")
    )

    if demo_mode:
        return {
            "output": generate_demo_output(
                request.prompt,
                request.input
            )
        }

    try:
        output = run_ai(
            request.prompt,
            request.input
        )

        return {
            "output": output
        }

    except RuntimeError as e:
        error_message = str(e)

        if "quota" in error_message.lower() or "rate limit" in error_message.lower():
            raise HTTPException(
                status_code=429,
                detail=error_message
            )

        if "temporarily unavailable" in error_message.lower():
            raise HTTPException(
                status_code=503,
                detail=error_message
            )

        raise HTTPException(
            status_code=500,
            detail=error_message
        )