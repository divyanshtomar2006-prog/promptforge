from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.services.prompt_optimizer import optimize_prompt


router = APIRouter(
    prefix="/api/v1/prompts",
    tags=["Prompt Optimizer"],
)


class PromptOptimizeRequest(BaseModel):
    prompt: str
    input: str
    expected_output: str
    actual_output: str


@router.post("/optimize")
def optimize_prompt_endpoint(request: PromptOptimizeRequest):
    try:
        return optimize_prompt(
            prompt=request.prompt,
            user_input=request.input,
            expected_output=request.expected_output,
            actual_output=request.actual_output,
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prompt optimization failed: {str(error)}",
        )