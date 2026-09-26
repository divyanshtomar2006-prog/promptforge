import json

from backend.app.services.ai_engine import run_ai


def debug_prompt(
    prompt: str,
    user_input: str,
    expected_output: str,
    actual_output: str,
) -> dict:
    """
    Analyze a failed prompt test and suggest improvements.

    This uses Gemini as an AI debugging assistant.
    """

    debugger_prompt = """
You are PromptForge's Prompt Debugger.

Analyze the prompt and its test result.

Your job is to identify:
1. What is wrong with the prompt.
2. Why the actual output differs from the expected output.
3. What should be changed.
4. A concrete improved version of the prompt.

Return ONLY valid JSON using exactly this structure:

{
    "problem": "Short description of the problem",
    "reason": "Why the problem caused the observed result",
    "suggestion": "Specific improvement to make",
    "improved_prompt": "Complete improved prompt"
}

Do not include markdown.
Do not include code fences.
Do not add any text outside the JSON.
"""

    input_data = f"""
Original Prompt:
{prompt}

User Input:
{user_input}

Expected Output:
{expected_output}

Actual Output:
{actual_output}
"""

    raw_response = run_ai(
        debugger_prompt,
        input_data
    )

    try:
        cleaned_response = raw_response.strip()

        if cleaned_response.startswith("```"):
            cleaned_response = (
                cleaned_response
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        result = json.loads(cleaned_response)

    except (json.JSONDecodeError, TypeError):
        return {
            "problem": "The debugger returned an invalid response format.",
            "reason": "The AI response could not be parsed as JSON.",
            "suggestion": "Try running the debugger again.",
            "improved_prompt": prompt,
            "raw_response": raw_response,
        }

    return {
        "problem": result.get("problem", ""),
        "reason": result.get("reason", ""),
        "suggestion": result.get("suggestion", ""),
        "improved_prompt": result.get(
            "improved_prompt",
            prompt
        ),
    }