import asyncio
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import github_client
import groq_client
import stats
from github_client import GitHubTimeoutError, RateLimitError, UserNotFoundError
from models import (
    AnalyzeRequest,
    CardCopy,
    CardDeck,
    FinalCardCopy,
    LanguageItem,
    WrappedData,
)

load_dotenv()

app = FastAPI(title="Git Wrapped API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("FRONTEND_URL", "")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    for error in exc.errors():
        if "username" in (error.get("loc", ())):
            msg = error.get("msg", "").replace("Value error, ", "")
            return JSONResponse(status_code=422, content={"error": msg})
    return JSONResponse(status_code=422, content={"error": "Invalid request."})


@app.get("/health")
async def health():
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    return {"status": "ok", "model": model}


@app.post("/analyze", response_model=WrappedData)
async def analyze(request: AnalyzeRequest):
    username = request.username

    try:
        # 1. Fetch user profile first (needed for display name + avatar)
        user = await github_client.get_user(username)

        # 2. Fetch repos and events in parallel
        repos, events = await asyncio.gather(
            github_client.get_repos(username),
            github_client.get_events(username),
        )

        # 3. Take top 10 repos sorted by pushed_at, fire language + commit requests in parallel
        top_repos = sorted(
            repos,
            key=lambda r: r.get("pushed_at") or "",
            reverse=True,
        )[:10]

        language_tasks = []
        commit_tasks = []
        repo_names = []

        for repo in top_repos:
            owner = repo["owner"]["login"]
            repo_name = repo["name"]
            repo_names.append(repo_name)
            language_tasks.append(github_client.get_languages(owner, repo_name))
            commit_tasks.append(github_client.get_commits(owner, repo_name, username))

        all_results = await asyncio.gather(
            *language_tasks, *commit_tasks, return_exceptions=True
        )

        num_repos = len(top_repos)
        all_language_dicts = []
        all_commits = []
        repos_with_commits: dict[str, int] = {}

        for i in range(num_repos):
            lang_result = all_results[i]
            commit_result = all_results[num_repos + i]

            if isinstance(lang_result, Exception):
                lang_result = {}
            if isinstance(commit_result, Exception):
                commit_result = []

            all_language_dicts.append(lang_result)
            all_commits.append(commit_result)
            repos_with_commits[repo_names[i]] = len(commit_result)

        # 4. Aggregate stats
        aggregated = stats.aggregate(
            all_language_dicts=all_language_dicts,
            all_commits=all_commits,
            events=events,
            repos_with_commits=repos_with_commits,
            total_repos=len(repos),
        )

        # 5. Get card copy from Groq
        card_copy = await groq_client.get_card_copy(username, aggregated)

        # 6. Assemble and return WrappedData
        return WrappedData(
            username=user["login"],
            avatar_url=user.get("avatar_url", ""),
            display_name=user.get("name") or user["login"],
            total_commits=aggregated["total_commits"],
            total_repos=aggregated["total_repos"],
            top_languages=aggregated["top_languages"],
            peak_hour=aggregated["peak_hour"],
            peak_period_label=aggregated["peak_period_label"],
            recent_streak_days=aggregated["recent_streak_days"],
            most_active_repo=aggregated["most_active_repo"],
            archetype_title=card_copy.get("archetype_title", "THE CODER"),
            archetype_subtitle=card_copy.get("archetype_subtitle", "Writes code, apparently"),
            cards=CardDeck(
                dna=CardCopy(**card_copy.get("card_dna", {"headline": "", "subtext": ""})),
                hours=CardCopy(**card_copy.get("card_hours", {"headline": "", "subtext": ""})),
                streak=CardCopy(**card_copy.get("card_streak", {"headline": "", "subtext": ""})),
                vibe=CardCopy(**card_copy.get("card_vibe", {"headline": "", "subtext": ""})),
                final=FinalCardCopy(**card_copy.get("card_final", {"headline": "", "subtext": "", "sign_off": ""})),
            ),
            commit_messages_sample=aggregated["commit_messages"][:5],
            hour_histogram=aggregated["hour_histogram"],
        )

    except UserNotFoundError:
        return JSONResponse(status_code=404, content={"error": "GitHub user not found."})
    except RateLimitError:
        return JSONResponse(status_code=429, content={"error": "GitHub rate limit hit. The token needs a break."})
    except GitHubTimeoutError:
        return JSONResponse(status_code=504, content={"error": "GitHub took too long. Try again."})
    except Exception:
        return JSONResponse(status_code=500, content={"error": "Something broke. Very on-brand."})


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
