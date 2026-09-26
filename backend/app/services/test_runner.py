from backend.app.services.ai_engine import run_ai
from backend.app.services.evaluator import evaluate_output


def run_test_case(
    prompt: str,
    user_input: str,
    expected_output: str
):
    # Step 1: Generate AI response
    actual_output = run_ai(prompt, user_input)

    # Step 2: Evaluate the AI response
    evaluation = evaluate_output(
        prompt,
        user_input,
        expected_output,
        actual_output
    )

    # Step 3: Return complete test result
    return {
        "input": user_input,
        "expected_output": expected_output,
        "actual_output": actual_output,
        "evaluation": evaluation
    }