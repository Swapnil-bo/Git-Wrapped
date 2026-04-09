import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# --- Fallback copy — used when Groq fails twice ---

FALLBACK_COPY: dict = {
    "archetype_title": "THE SILENT SHIPPER",
    "archetype_subtitle": "Lets the commits do the talking",
    "card_dna": {
        "headline": "Your codebase speaks volumes.",
        "subtext": "A polyglot or a purist — either way, the bytes don't lie.",
    },
    "card_hours": {
        "headline": "You code when the mood strikes.",
        "subtext": "The clock is just a suggestion. Your git log is the truth.",
    },
    "card_streak": {
        "headline": "Consistency is a spectrum.",
        "subtext": "Some days you ship. Some days you stare at a diff. Both count.",
    },
    "card_vibe": {
        "headline": "Your commit messages are... a journey.",
        "subtext": "From hopeful feature flags to mass renames at midnight.",
    },
    "card_final": {
        "headline": "This was your year in code.",
        "subtext": "Not every commit was pretty. But you showed up and pushed.",
        "sign_off": "Keep shipping, you magnificent gremlin.",
    },
}

# --- System prompt (copied exactly from spec) ---

SYSTEM_PROMPT = """You are a witty, slightly savage tech personality analyst. You analyze GitHub stats and generate \
Spotify Wrapped-style card content for developers. Be specific — always reference the actual \
numbers from the stats. Roast gently but pointedly. Think: developer Twitter humor. Sharp. Punchy. Relatable. \
Avoid generic phrases like "you're a rockstar" or "amazing work". Be specific. Be funny. Be real.

Return ONLY valid JSON. No markdown fences. No explanation text. No preamble. Start your response \
with { and end with }. Use exactly this schema:

{
  "archetype_title": "THE MIDNIGHT GOBLIN",
  "archetype_subtitle": "Ships at 2AM, repents at standup",
  "card_dna": {
    "headline": "You speak 5 languages. Python is your mother tongue.",
    "subtext": "62% of your soul is Python. The rest is existential dread."
  },
  "card_hours": {
    "headline": "You coded at 2AM more than most people code at all.",
    "subtext": "Your git log reads like a sleep disorder diary."
  },
  "card_streak": {
    "headline": "14 days straight. No breaks. No mercy.",
    "subtext": "Your keyboard filed a formal complaint with HR."
  },
  "card_vibe": {
    "headline": "Your commit messages tell a story.",
    "subtext": "A story of someone who stopped caring about naming conventions in week 2."
  },
  "card_final": {
    "headline": "This was your year in code.",
    "subtext": "The terminal never lied. The PRs never merged themselves. But you showed up.",
    "sign_off": "Keep building, you beautiful disaster."
  }
}"""


def _build_user_payload(username: str, stats: dict) -> str:
    payload = {
        "username": username,
        "total_commits": stats["total_commits"],
        "top_languages": [
            {"name": lang.name, "percent": lang.percent}
            for lang in stats["top_languages"]
        ],
        "peak_hour": stats["peak_hour"],
        "peak_period_label": stats["peak_period_label"],
        "recent_streak_days": stats["recent_streak_days"],
        "total_repos": stats["total_repos"],
        "most_active_repo": stats["most_active_repo"],
        "commit_messages_sample": stats["commit_messages"][:20],
    }
    return json.dumps(payload)


def _parse_response(content: str) -> dict | None:
    try:
        return json.loads(content)
    except (json.JSONDecodeError, TypeError):
        return None


async def get_card_copy(username: str, stats: dict) -> dict:
    api_key = os.getenv("GROQ_API_KEY", "")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    if not api_key:
        return FALLBACK_COPY

    client = Groq(api_key=api_key)
    user_message = _build_user_payload(username, stats)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    # First attempt
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.9,
            max_tokens=1024,
        )
        content = response.choices[0].message.content
        parsed = _parse_response(content)
        if parsed is not None:
            return parsed
    except Exception:
        return FALLBACK_COPY

    # Retry once with corrective message
    messages.append({"role": "assistant", "content": content})
    messages.append({
        "role": "user",
        "content": "Your previous response was not valid JSON. Return only the JSON object, nothing else.",
    })

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        content = response.choices[0].message.content
        parsed = _parse_response(content)
        if parsed is not None:
            return parsed
    except Exception:
        pass

    return FALLBACK_COPY
