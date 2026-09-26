
import os

from backend.app.services.prompt_debugger import debug_prompt


def optimize_prompt(
    prompt: str,
    user_input: str,
    expected_output: str,
    actual_output: str,
) -> dict:
    """
    Optimize a prompt using Demo Mode or the existing Prompt Debugger.
    """

    demo_mode = (
        os.getenv("PROMPTFORGE_DEMO_MODE", "false").strip().lower()
        in ("true", "1", "yes", "on")
    )

    if demo_mode:
        combined_text = f"{prompt} {user_input} {actual_output}".lower()

        if "binary search" in combined_text:
            problem = (
                "DEMO MODE — SAMPLE ANALYSIS: "
                "The prompt may not explicitly require the key properties "
                "of binary search."
            )

            reason = (
                "This sample analysis illustrates how vague instructions "
                "can lead to incomplete or inaccurate explanations. "
                "No real AI analysis was performed."
            )

            suggestion = (
                "Explicitly require a sorted array, repeated halving of "
                "the search space, and O(log n) time complexity."
            )

            optimized_prompt = (
                "Explain the following algorithm to a beginner in 1–2 "
                "sentences. State whether it requires a sorted array, "
                "explain how it repeatedly halves the search space, and "
                "include its time complexity. Avoid unsupported claims. "
                "Algorithm: {{user_input}}"
            )
        else:
            problem = (
                "DEMO MODE — SAMPLE ANALYSIS: "
                "The prompt may need clearer instructions and constraints."
            )

            reason = (
                "Clear requirements and expected-output criteria can help "
                "make responses more consistent. This is sample guidance, "
                "not a real AI evaluation."
            )

            suggestion = (
                "Specify the intended audience, required facts, output "
                "format, and any constraints the answer must follow."
            )

            optimized_prompt = (
                "Answer the following request clearly and accurately. "
                "Follow the stated requirements, include the necessary "
                "information, and avoid unsupported claims. "
                "Request: {{user_input}}"
            )

        return {
            "original_prompt": prompt,
            "problem": problem,
            "reason": reason,
            "suggestion": suggestion,
            "optimized_prompt": optimized_prompt,
            "demo_mode": True,
        }

    # Preserve the existing real Gemini-backed optimization path.
    debug_result = debug_prompt(
        prompt=prompt,
        user_input=user_input,
        expected_output=expected_output,
        actual_output=actual_output,
    )

    return {
        "original_prompt": prompt,
        "problem": debug_result.get("problem", ""),
        "reason": debug_result.get("reason", ""),
        "suggestion": debug_result.get("suggestion", ""),
        "optimized_prompt": debug_result.get("improved_prompt", prompt),
        "demo_mode": False,
    }