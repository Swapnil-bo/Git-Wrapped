import os
from datetime import datetime, timezone

import httpx
from dotenv import load_dotenv

load_dotenv()


# --- Custom Errors ---

class UserNotFoundError(Exception):
    pass


class RateLimitError(Exception):
    pass


class GitHubTimeoutError(Exception):
    pass


# --- Response checking ---

def _check_response(response: httpx.Response, username: str = "") -> None:
    if response.status_code == 404:
        raise UserNotFoundError(f"GitHub user not found: {username}")
    if response.status_code in (403, 429):
        raise RateLimitError("GitHub API rate limit exceeded")
    response.raise_for_status()


# --- Client factory ---

def _get_client() -> httpx.AsyncClient:
    token = os.getenv("GITHUB_TOKEN", "")
    return httpx.AsyncClient(
        base_url="https://api.github.com",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
        },
        timeout=httpx.Timeout(10.0, connect=5.0),
    )


# --- Fetch functions ---

async def get_user(username: str) -> dict:
    try:
        async with _get_client() as client:
            response = await client.get(f"/users/{username}")
    except httpx.TimeoutException:
        raise GitHubTimeoutError(f"Timed out fetching user: {username}")
    _check_response(response, username)
    return response.json()


async def get_repos(username: str) -> list[dict]:
    try:
        async with _get_client() as client:
            response = await client.get(
                f"/users/{username}/repos",
                params={"per_page": 100, "sort": "pushed"},
            )
    except httpx.TimeoutException:
        raise GitHubTimeoutError(f"Timed out fetching repos for: {username}")
    _check_response(response, username)
    return response.json()


async def get_languages(owner: str, repo: str) -> dict:
    try:
        async with _get_client() as client:
            response = await client.get(f"/repos/{owner}/{repo}/languages")
    except httpx.TimeoutException:
        raise GitHubTimeoutError(f"Timed out fetching languages for: {owner}/{repo}")
    _check_response(response)
    return response.json()


async def get_commits(owner: str, repo: str, username: str, since: str | None = None) -> list[dict]:
    if since is None:
        since = datetime(datetime.now(timezone.utc).year, 1, 1, tzinfo=timezone.utc).isoformat()
    try:
        async with _get_client() as client:
            response = await client.get(
                f"/repos/{owner}/{repo}/commits",
                params={
                    "author": username,
                    "since": since,
                    "per_page": 100,
                },
            )
    except httpx.TimeoutException:
        raise GitHubTimeoutError(f"Timed out fetching commits for: {owner}/{repo}")
    _check_response(response)
    return response.json()


async def get_events(username: str) -> list[dict]:
    try:
        async with _get_client() as client:
            response = await client.get(
                f"/users/{username}/events/public",
                params={"per_page": 100},
            )
    except httpx.TimeoutException:
        raise GitHubTimeoutError(f"Timed out fetching events for: {username}")
    _check_response(response, username)
    return response.json()
