import re

from pydantic import BaseModel, field_validator


class LanguageItem(BaseModel):
    name: str
    percent: float
    color: str


class CardCopy(BaseModel):
    headline: str
    subtext: str


class FinalCardCopy(BaseModel):
    headline: str
    subtext: str
    sign_off: str


class CardDeck(BaseModel):
    dna: CardCopy
    hours: CardCopy
    streak: CardCopy
    vibe: CardCopy
    final: FinalCardCopy


class WrappedData(BaseModel):
    username: str
    avatar_url: str
    display_name: str
    total_commits: int
    total_repos: int
    top_languages: list[LanguageItem]
    peak_hour: int
    peak_period_label: str
    recent_streak_days: int
    most_active_repo: str
    archetype_title: str
    archetype_subtitle: str
    cards: CardDeck
    commit_messages_sample: list[str]
    hour_histogram: list[int]


class AnalyzeRequest(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Username cannot be empty.")
        if len(v) > 39:
            raise ValueError("Username too long. GitHub usernames are max 39 characters.")
        if not re.match(r"^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$", v):
            raise ValueError("Invalid GitHub username format.")
        return v
