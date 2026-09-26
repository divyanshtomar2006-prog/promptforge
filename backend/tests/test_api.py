
from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to PromptForge!",
        "status": "running",
    }


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_openapi_documentation_available():
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert response.json()["info"]["title"] == "PromptForge"


def test_prompt_runner_demo_mode(monkeypatch):
    monkeypatch.setenv("PROMPTFORGE_DEMO_MODE", "true")

    response = client.post(
        "/api/v1/prompts/run",
        json={
            "prompt": "Explain this concept briefly.",
            "input": "Binary Search",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert "DEMO MODE" in data["output"]
    assert "Binary search" in data["output"]
    

def test_test_case_runner_demo_mode(monkeypatch):
    monkeypatch.setenv("PROMPTFORGE_DEMO_MODE", "true")

    response = client.post(
        "/api/v1/test-cases/run",
        json={
            "prompt": "Explain the concept.",
            "input": "Binary Search",
            "expected_output": (
                "Find an element in a sorted list "
                "using O(log n) time."
            ),
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["demo_mode"] is True
    assert data["evaluation"]["score"] is None
    assert data["evaluation"]["passed"] is None
    assert "DEMO MODE" in data["actual_output"]
    assert "No real AI evaluation" in data["evaluation"]["reason"]


def test_prompt_optimizer_demo_mode(monkeypatch):
    monkeypatch.setenv("PROMPTFORGE_DEMO_MODE", "true")

    response = client.post(
        "/api/v1/prompts/optimize",
        json={
            "prompt": "Explain the concept.",
            "input": "Binary Search",
            "expected_output": (
                "Explain binary search and its O(log n) "
                "time complexity."
            ),
            "actual_output": "Binary search finds items in a sorted list.",
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["demo_mode"] is True
    assert isinstance(data["optimized_prompt"], str)
    assert data["optimized_prompt"].strip()
    assert "reason" in data
    assert "suggestion" in data


def test_version_comparison_missing_version():
    response = client.get(
        "/api/v1/prompt-versions/compare/pytest-missing-promptforge",
        params={
            "version_a": 1,
            "version_b": 2,
        },
    )

    assert response.status_code == 404
    assert "Version 1 not found" in response.json()["detail"]