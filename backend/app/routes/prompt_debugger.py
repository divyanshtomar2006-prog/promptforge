from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.services.prompt_debugger import debug_prompt


router = APIRouter(
    prefix="/api/v1/prompts",
    tags=["Prompt Debugger"]
)


class PromptDebugRequest(BaseModel):
    prompt: str
    input: str
    expected_output: str
    actual_output: str


@router.post("/debug")
def debug_prompt_endpoint(request: PromptDebugRequest):
    """
    Analyze a prompt test failure and suggest an improved prompt.
    """

    try:
        result = debug_prompt(
            prompt=request.prompt,
            user_input=request.input,
            expected_output=request.expected_output,
            actual_output=request.actual_output,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prompt debugging failed: {str(error)}"
        )