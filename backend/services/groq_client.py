import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

async def call_groq(system_prompt: str, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.1, json_mode: bool = True) -> str:
    """
    Single async function to call Groq API.
    json_mode: If True, uses response_format={"type": "json_object"}. 
    """
    if not GROQ_API_KEY or GROQ_API_KEY.startswith("gsk_your") or GROQ_API_KEY.strip() == "":
        raise RuntimeError("GROQ_API_KEY not configured or placeholder.")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Ensure 'json' is in the prompt if json_mode is active
    if json_mode and "json" not in (system_prompt + user_prompt).lower():
        user_prompt += " Respond in valid JSON format."

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": temperature
    }

    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(GROQ_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
