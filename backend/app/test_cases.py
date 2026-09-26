from pydantic import BaseModel


class TestCaseRequest(BaseModel):
    prompt: str
    input: str
    expected_output: str
    prompt_version_id: int | None = None