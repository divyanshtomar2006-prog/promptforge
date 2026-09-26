
import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal
from backend.app.test_cases import TestCaseRequest
from backend.app.models.test_case import TestCase
from backend.app.models.test_run import TestRun
from backend.app.models.prompt_version import PromptVersion
from backend.app.services.test_runner import run_test_case


router = APIRouter(
    prefix="/api/v1/test-cases",
    tags=["Test Cases"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def is_demo_mode() -> bool:
    return os.getenv(
        "PROMPTFORGE_DEMO_MODE", "false"
    ).lower() in ("true", "1", "yes")


def run_demo_test(prompt: str, user_input: str, expected_output: str):
    """Return labelled sample data without calling Gemini."""

    input_lower = user_input.lower()

    if "binary search" in input_lower:
        sample = (
            "Binary search finds an element in a sorted list "
            "by repeatedly halving the search space. "
            "Its time complexity is O(log n)."
        )
    elif "recursion" in input_lower:
        sample = (
            "Recursion is a technique where a function calls "
            "itself. A base case stops the recursive calls."
        )
    elif "operating system" in input_lower:
        sample = (
            "An operating system manages hardware and software "
            "resources, including processes, memory, files, "
            "and devices."
        )
    else:
        sample = f"Sample response for: {user_input}"

    return {
        "input": user_input,
        "expected_output": expected_output,
        "actual_output": (
            "[DEMO MODE — SAMPLE OUTPUT]\n\n" + sample
        ),
        "evaluation": {
            "score": None,
            "passed": None,
            "reason": (
                "Demo output only. No real AI evaluation "
                "was performed."
            )
        },
        "demo_mode": True
    }


def handle_runtime_error(error: RuntimeError):
    error_message = str(error)
    lower_message = error_message.lower()

    if "quota" in lower_message or "rate limit" in lower_message:
        raise HTTPException(
            status_code=429,
            detail=error_message
        )

    if "temporarily unavailable" in lower_message:
        raise HTTPException(
            status_code=503,
            detail=error_message
        )

    raise HTTPException(
        status_code=500,
        detail=error_message
    )


# ============================================================
# CREATE AND LIST TEST CASES
# ============================================================

@router.post("/")
def create_test_case(
    test_case: TestCaseRequest,
    db: Session = Depends(get_db)
):
    new_test_case = TestCase(
        prompt=test_case.prompt,
        input=test_case.input,
        expected_output=test_case.expected_output
    )

    db.add(new_test_case)
    db.commit()
    db.refresh(new_test_case)

    return {
        "message": "Test case created successfully",
        "test_case": {
            "id": new_test_case.id,
            "prompt": new_test_case.prompt,
            "input": new_test_case.input,
            "expected_output": new_test_case.expected_output
        }
    }


@router.get("/")
def get_test_cases(db: Session = Depends(get_db)):
    test_cases = db.query(TestCase).all()

    return {
        "test_cases": [
            {
                "id": case.id,
                "prompt": case.prompt,
                "input": case.input,
                "expected_output": case.expected_output
            }
            for case in test_cases
        ]
    }


# ============================================================
# RUN HISTORY
# ============================================================

@router.get("/runs")
def get_all_test_runs(db: Session = Depends(get_db)):
    runs = (
        db.query(TestRun)
        .order_by(TestRun.id.desc())
        .all()
    )

    history = []

    for run in runs:
        test_case = (
            db.query(TestCase)
            .filter(TestCase.id == run.test_case_id)
            .first()
        )

        prompt_version = None

        if run.prompt_version_id is not None:
            prompt_version = (
                db.query(PromptVersion)
                .filter(
                    PromptVersion.id == run.prompt_version_id
                )
                .first()
            )

        history.append({
            "run_id": run.id,
            "test_case_id": run.test_case_id,
            "prompt_version_id": run.prompt_version_id,
            "prompt_name": (
                prompt_version.prompt_name
                if prompt_version else None
            ),
            "version": (
                prompt_version.version
                if prompt_version else None
            ),
            "input": test_case.input if test_case else None,
            "expected_output": (
                test_case.expected_output if test_case else None
            ),
            "actual_output": run.actual_output,
            "score": run.score,
            "passed": run.passed,
            "reason": run.reason,
            "created_at": run.created_at
        })

    total_runs = len(history)
    passed_runs = sum(1 for run in history if run["passed"])
    failed_runs = total_runs - passed_runs

    average_score = (
        round(sum(run["score"] for run in history) / total_runs, 2)
        if total_runs else 0
    )

    pass_rate = (
        round((passed_runs / total_runs) * 100, 2)
        if total_runs else 0
    )

    return {
        "total_runs": total_runs,
        "analytics": {
            "total_runs": total_runs,
            "passed_runs": passed_runs,
            "failed_runs": failed_runs,
            "average_score": average_score,
            "pass_rate": pass_rate
        },
        "runs": history
    }


# ============================================================
# REGRESSION COMPARISON
# These endpoints analyze stored runs; they do not call Gemini.
# ============================================================

def get_version_or_404(db: Session, version_id: int):
    version = (
        db.query(PromptVersion)
        .filter(PromptVersion.id == version_id)
        .first()
    )

    if not version:
        raise HTTPException(
            status_code=404,
            detail=f"Prompt version {version_id} not found"
        )

    return version


def get_version_runs(db: Session, version_id: int):
    return (
        db.query(TestRun)
        .filter(TestRun.prompt_version_id == version_id)
        .all()
    )


def compare_version_runs(
    db: Session,
    old_version_id: int,
    new_version_id: int
):
    old_version = get_version_or_404(db, old_version_id)
    new_version = get_version_or_404(db, new_version_id)

    old_runs = get_version_runs(db, old_version_id)
    new_runs = get_version_runs(db, new_version_id)

    if not old_runs:
        raise HTTPException(
            status_code=404,
            detail=f"No test runs found for old version {old_version.version}"
        )

    if not new_runs:
        raise HTTPException(
            status_code=404,
            detail=f"No test runs found for new version {new_version.version}"
        )

    # If multiple runs exist for one test, compare the latest run.
    old_by_test = {}
    new_by_test = {}

    for run in sorted(old_runs, key=lambda item: item.id):
        old_by_test[run.test_case_id] = run

    for run in sorted(new_runs, key=lambda item: item.id):
        new_by_test[run.test_case_id] = run

    common_ids = sorted(set(old_by_test) & set(new_by_test))

    if not common_ids:
        raise HTTPException(
            status_code=400,
            detail="The two prompt versions have no common test results"
        )

    regressions = []
    improvements = []
    unchanged = []

    for test_id in common_ids:
        old_run = old_by_test[test_id]
        new_run = new_by_test[test_id]

        difference = round(new_run.score - old_run.score, 2)
        passed_to_failed = old_run.passed and not new_run.passed
        failed_to_passed = not old_run.passed and new_run.passed

        case = (
            db.query(TestCase)
            .filter(TestCase.id == test_id)
            .first()
        )

        item = {
            "test_case_id": test_id,
            "input": case.input if case else None,
            "old_score": old_run.score,
            "new_score": new_run.score,
            "score_difference": difference,
            "old_passed": old_run.passed,
            "new_passed": new_run.passed
        }

        if difference < 0 or passed_to_failed:
            item["change"] = "regression"
            item["reason"] = (
                "PASS → FAIL"
                if passed_to_failed else "Score decreased"
            )
            regressions.append(item)
        elif difference > 0 or failed_to_passed:
            item["change"] = "improvement"
            item["reason"] = (
                "FAIL → PASS"
                if failed_to_passed else "Score increased"
            )
            improvements.append(item)
        else:
            item["change"] = "unchanged"
            item["reason"] = "No change"
            unchanged.append(item)

    count = len(common_ids)

    old_average = round(
        sum(old_by_test[test_id].score for test_id in common_ids) / count,
        2
    )
    new_average = round(
        sum(new_by_test[test_id].score for test_id in common_ids) / count,
        2
    )

    old_passed = sum(
        1 for test_id in common_ids
        if old_by_test[test_id].passed
    )
    new_passed = sum(
        1 for test_id in common_ids
        if new_by_test[test_id].passed
    )

    old_pass_rate = round(old_passed / count * 100, 2)
    new_pass_rate = round(new_passed / count * 100, 2)

    return {
        "old_version": {
            "id": old_version.id,
            "version": old_version.version,
            "average_score": old_average,
            "pass_rate": old_pass_rate,
            "passed_tests": old_passed,
            "total_tests": count
        },
        "new_version": {
            "id": new_version.id,
            "version": new_version.version,
            "average_score": new_average,
            "pass_rate": new_pass_rate,
            "passed_tests": new_passed,
            "total_tests": count
        },
        "comparison": {
            "score_difference": round(new_average - old_average, 2),
            "pass_rate_difference": round(
                new_pass_rate - old_pass_rate, 2
            ),
            "regression_detected": len(regressions) > 0,
            "regression_count": len(regressions),
            "improvement_count": len(improvements),
            "unchanged_count": len(unchanged)
        },
        "regressions": regressions,
        "improvements": improvements,
        "unchanged": unchanged
    }


@router.get("/regression/{old_version_id}/{new_version_id}")
def compare_regression(
    old_version_id: int,
    new_version_id: int,
    db: Session = Depends(get_db)
):
    old_version = get_version_or_404(db, old_version_id)
    new_version = get_version_or_404(db, new_version_id)

    comparison = compare_version_runs(
        db, old_version_id, new_version_id
    )

    return {
        "prompt_name": new_version.prompt_name,
        "old_version": comparison["old_version"],
        "new_version": comparison["new_version"],
        "comparison": comparison["comparison"],
        "regressions": comparison["regressions"],
        "improvements": comparison["improvements"],
        "unchanged": comparison["unchanged"]
    }


@router.get("/regression-gate/{old_version_id}/{new_version_id}")
def regression_gate(
    old_version_id: int,
    new_version_id: int,
    db: Session = Depends(get_db)
):
    comparison = compare_version_runs(
        db, old_version_id, new_version_id
    )

    regressions = comparison["regressions"]

    return {
        "status": "FAIL" if regressions else "PASS",
        "regression_detected": bool(regressions),
        "old_version": comparison["old_version"],
        "new_version": comparison["new_version"],
        "regression_count": len(regressions),
        "regressions": regressions
    }


# ============================================================
# GET A SINGLE TEST CASE
# ============================================================

@router.get("/{test_case_id}")
def get_test_case(
    test_case_id: int,
    db: Session = Depends(get_db)
):
    case = (
        db.query(TestCase)
        .filter(TestCase.id == test_case_id)
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Test case not found"
        )

    return {
        "id": case.id,
        "prompt": case.prompt,
        "input": case.input,
        "expected_output": case.expected_output
    }


# ============================================================
# RUN A ONE-OFF TEST
# ============================================================

@router.post("/run")
def run_test(test_case: TestCaseRequest):
    if is_demo_mode():
        return run_demo_test(
            test_case.prompt,
            test_case.input,
            test_case.expected_output
        )

    try:
        return run_test_case(
            test_case.prompt,
            test_case.input,
            test_case.expected_output
        )
    except RuntimeError as e:
        handle_runtime_error(e)


# ============================================================
# RUN A SAVED TEST
# Demo runs are not stored as genuine evaluation records.
# ============================================================

@router.post("/{test_case_id}/run")
def run_saved_test(
    test_case_id: int,
    prompt_version_id: int | None = None,
    db: Session = Depends(get_db)
):
    case = (
        db.query(TestCase)
        .filter(TestCase.id == test_case_id)
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Test case not found"
        )

    prompt_text = case.prompt

    if prompt_version_id is not None:
        version = get_version_or_404(db, prompt_version_id)
        prompt_text = version.prompt

    if is_demo_mode():
        result = run_demo_test(
            prompt_text,
            case.input,
            case.expected_output
        )
        result["test_case_id"] = case.id
        result["prompt_version_id"] = prompt_version_id
        result["message"] = (
            "Demo result was not saved to run history."
        )
        return result

    try:
        result = run_test_case(
            prompt_text,
            case.input,
            case.expected_output
        )
    except RuntimeError as e:
        handle_runtime_error(e)

    evaluation = result["evaluation"]

    new_run = TestRun(
        test_case_id=case.id,
        prompt_version_id=prompt_version_id,
        actual_output=result["actual_output"],
        score=evaluation["score"],
        passed=evaluation["passed"],
        reason=evaluation["reason"]
    )

    db.add(new_run)
    db.commit()
    db.refresh(new_run)

    return {
        "run_id": new_run.id,
        "test_case_id": case.id,
        "prompt_version_id": prompt_version_id,
        "input": result["input"],
        "expected_output": result["expected_output"],
        "actual_output": result["actual_output"],
        "evaluation": evaluation,
        "demo_mode": False
    }


# ============================================================
# RUN ALL TESTS FOR A PROMPT VERSION
# ============================================================

@router.post("/run-all/{prompt_version_id}")
def run_all_tests(
    prompt_version_id: int,
    db: Session = Depends(get_db)
):
    version = get_version_or_404(db, prompt_version_id)

    test_cases = (
        db.query(TestCase)
        .order_by(TestCase.id.asc())
        .all()
    )

    if not test_cases:
        raise HTTPException(
            status_code=404,
            detail="No test cases found"
        )

    # Demo results are returned but never inserted into TestRun.
    if is_demo_mode():
        results = []

        for case in test_cases:
            demo_result = run_demo_test(
                version.prompt,
                case.input,
                case.expected_output
            )

            results.append({
                "test_case_id": case.id,
                "actual_output": demo_result["actual_output"],
                "score": None,
                "passed": None,
                "reason": demo_result["evaluation"]["reason"],
                "demo_mode": True
            })

        return {
            "demo_mode": True,
            "message": (
                "Demo test suite completed. Results were not "
                "saved and no real evaluation was performed."
            ),
            "prompt_version_id": version.id,
            "prompt_name": version.prompt_name,
            "version": version.version,
            "summary": {
                "total_tests": len(results),
                "evaluated_tests": 0,
                "passed_tests": None,
                "failed_tests": None,
                "average_score": None,
                "pass_rate": None
            },
            "results": results
        }

    results = []

    for case in test_cases:
        try:
            result = run_test_case(
                version.prompt,
                case.input,
                case.expected_output
            )
        except RuntimeError as e:
            handle_runtime_error(e)

        evaluation = result["evaluation"]

        new_run = TestRun(
            test_case_id=case.id,
            prompt_version_id=version.id,
            actual_output=result["actual_output"],
            score=evaluation["score"],
            passed=evaluation["passed"],
            reason=evaluation["reason"]
        )

        db.add(new_run)
        db.commit()
        db.refresh(new_run)

        results.append({
            "run_id": new_run.id,
            "test_case_id": case.id,
            "score": evaluation["score"],
            "passed": evaluation["passed"],
            "reason": evaluation["reason"],
            "actual_output": result["actual_output"]
        })

    total = len(results)
    passed = sum(1 for item in results if item["passed"])
    failed = total - passed

    average_score = round(
        sum(item["score"] for item in results) / total, 2
    )
    pass_rate = round(passed / total * 100, 2)

    return {
        "demo_mode": False,
        "prompt_version_id": version.id,
        "prompt_name": version.prompt_name,
        "version": version.version,
        "summary": {
            "total_tests": total,
            "evaluated_tests": total,
            "passed_tests": passed,
            "failed_tests": failed,
            "average_score": average_score,
            "pass_rate": pass_rate
        },
        "results": results
    }


# ============================================================
# TEST ANALYTICS
# ============================================================

@router.get("/analytics/{prompt_version_id}")
def get_test_analytics(
    prompt_version_id: int,
    db: Session = Depends(get_db)
):
    version = get_version_or_404(db, prompt_version_id)

    runs = get_version_runs(db, prompt_version_id)

    if not runs:
        raise HTTPException(
            status_code=404,
            detail="No test runs found for this prompt version"
        )

    total = len(runs)
    passed = sum(1 for run in runs if run.passed)
    scores = [run.score for run in runs]

    return {
        "prompt_name": version.prompt_name,
        "prompt_version_id": version.id,
        "version": version.version,
        "analytics": {
            "total_runs": total,
            "passed_runs": passed,
            "failed_runs": total - passed,
            "pass_rate": round(passed / total * 100, 2),
            "average_score": round(sum(scores) / total, 2),
            "minimum_score": min(scores),
            "maximum_score": max(scores)
        }
    }


# ============================================================
# RUN HISTORY FOR ONE TEST CASE
# ============================================================

@router.get("/{test_case_id}/runs")
def get_test_runs(
    test_case_id: int,
    db: Session = Depends(get_db)
):
    case = (
        db.query(TestCase)
        .filter(TestCase.id == test_case_id)
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Test case not found"
        )

    runs = (
        db.query(TestRun)
        .filter(TestRun.test_case_id == test_case_id)
        .order_by(TestRun.id.desc())
        .all()
    )

    return {
        "test_case_id": test_case_id,
        "runs": [
            {
                "run_id": run.id,
                "prompt_version_id": run.prompt_version_id,
                "score": run.score,
                "passed": run.passed,
                "reason": run.reason,
                "actual_output": run.actual_output,
                "created_at": run.created_at
            }
            for run in runs
        ]
    }


# ============================================================
# DELETE A TEST CASE
# ============================================================

@router.delete("/{test_case_id}")
def delete_test_case(
    test_case_id: int,
    db: Session = Depends(get_db)
):
    case = (
        db.query(TestCase)
        .filter(TestCase.id == test_case_id)
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Test case not found"
        )

    db.delete(case)
    db.commit()

    return {
        "message": "Test case deleted successfully",
        "test_case_id": test_case_id
    }