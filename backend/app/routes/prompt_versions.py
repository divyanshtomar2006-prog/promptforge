from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal
from backend.app.models.prompt_version import PromptVersion
from backend.app.models.test_run import TestRun


router = APIRouter(
    prefix="/api/v1/prompt-versions",
    tags=["Prompt Versions"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_prompt_version(
    prompt_name: str,
    prompt: str,
    db: Session = Depends(get_db)
):
    prompt_name = prompt_name.strip()
    prompt = prompt.strip()

    latest_version = (
        db.query(PromptVersion)
        .filter(PromptVersion.prompt_name == prompt_name)
        .order_by(PromptVersion.version.desc())
        .first()
    )

    if latest_version:
        new_version_number = latest_version.version + 1
    else:
        new_version_number = 1

    new_version = PromptVersion(
        prompt_name=prompt_name,
        prompt=prompt,
        version=new_version_number
    )

    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return {
        "message": "Prompt version created successfully",
        "prompt_version": {
            "id": new_version.id,
            "prompt_name": new_version.prompt_name,
            "prompt": new_version.prompt,
            "version": new_version.version,
            "created_at": new_version.created_at
        }
    }


@router.get("/compare/{prompt_name}")
def compare_prompt_versions(
    prompt_name: str,
    version_a: int,
    version_b: int,
    db: Session = Depends(get_db)
):
    version_a_data = (
        db.query(PromptVersion)
        .filter(
            PromptVersion.prompt_name == prompt_name,
            PromptVersion.version == version_a
        )
        .first()
    )

    version_b_data = (
        db.query(PromptVersion)
        .filter(
            PromptVersion.prompt_name == prompt_name,
            PromptVersion.version == version_b
        )
        .first()
    )

    if not version_a_data:
        raise HTTPException(
            status_code=404,
            detail=f"Version {version_a} not found"
        )

    if not version_b_data:
        raise HTTPException(
            status_code=404,
            detail=f"Version {version_b} not found"
        )

    runs_a = (
        db.query(TestRun)
        .filter(
            TestRun.prompt_version_id == version_a_data.id
        )
        .all()
    )

    runs_b = (
        db.query(TestRun)
        .filter(
            TestRun.prompt_version_id == version_b_data.id
        )
        .all()
    )

    if not runs_a:
        raise HTTPException(
            status_code=404,
            detail=f"No test runs found for version {version_a}"
        )

    if not runs_b:
        raise HTTPException(
            status_code=404,
            detail=f"No test runs found for version {version_b}"
        )

    # Calculate average scores without losing decimal precision.
    average_a = round(
        sum(run.score for run in runs_a) / len(runs_a),
        2
    )

    average_b = round(
        sum(run.score for run in runs_b) / len(runs_b),
        2
    )

    # Count passed tests.
    passed_a = sum(
        1 for run in runs_a if run.passed
    )

    passed_b = sum(
        1 for run in runs_b if run.passed
    )

    # Calculate pass rates with 2 decimal places.
    pass_rate_a = round(
        (passed_a / len(runs_a)) * 100,
        2
    )

    pass_rate_b = round(
        (passed_b / len(runs_b)) * 100,
        2
    )

    # Score difference.
    score_difference = round(
        average_b - average_a,
        2
    )

    # Pass-rate difference.
    pass_rate_difference = round(
        pass_rate_b - pass_rate_a,
        2
    )

    # Compare the measurable results.
    if average_b > average_a:
        result = "Version B performed better"
    elif average_b < average_a:
        result = "Version A performed better"
    elif pass_rate_b > pass_rate_a:
        result = "Version B performed better"
    elif pass_rate_b < pass_rate_a:
        result = "Version A performed better"
    else:
        result = "Both versions performed equally"

    return {
        "prompt_name": prompt_name,

        "version_a": {
            "version": version_a_data.version,
            "prompt_id": version_a_data.id,
            "average_score": average_a,
            "pass_rate": pass_rate_a,
            "passed_tests": passed_a,
            "total_tests": len(runs_a)
        },

        "version_b": {
            "version": version_b_data.version,
            "prompt_id": version_b_data.id,
            "average_score": average_b,
            "pass_rate": pass_rate_b,
            "passed_tests": passed_b,
            "total_tests": len(runs_b)
        },

        "score_difference": score_difference,
        "pass_rate_difference": pass_rate_difference,
        "result": result
    }


@router.get("/{prompt_name}")
def get_prompt_versions(
    prompt_name: str,
    db: Session = Depends(get_db)
):
    versions = (
        db.query(PromptVersion)
        .filter(PromptVersion.prompt_name == prompt_name)
        .order_by(PromptVersion.version.asc())
        .all()
    )

    return {
        "prompt_name": prompt_name,
        "versions": [
            {
                "id": version.id,
                "prompt": version.prompt,
                "version": version.version,
                "created_at": version.created_at
            }
            for version in versions
        ]
    }