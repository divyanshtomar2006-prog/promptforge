from pydantic import BaseModel


class PromptRequest(BaseModel):
    prompt: str
    input: str


class PromptResponse(BaseModel):
    output: str

