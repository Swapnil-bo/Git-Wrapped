import random
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from models import LanguageItem

# --- Language Colors (top 40, source: github.com/ozh/github-colors) ---

LANGUAGE_COLORS: dict[str, str] = {
    "JavaScript": "#f1e05a",
    "Python": "#3572A5",
    "TypeScript": "#3178c6",
    "Java": "#b07219",
    "C#": "#178600",
    "C++": "#f34b7d",
    "C": "#555555",
    "PHP": "#4F5D95",
    "Ruby": "#701516",
    "Go": "#00ADD8",
    "Swift": "#F05138",
    "Kotlin": "#A97BFF",
    "Rust": "#dea584",
    "Scala": "#c22d40",
    "Dart": "#00B4AB",
    "Shell": "#89e051",
    "Lua": "#000080",
    "R": "#198CE7",
    "Perl": "#0298c3",
    "Haskell": "#5e5086",
    "Objective-C": "#438eff",
    "Elixir": "#6e4a7e",
    "Clojure": "#db5855",
    "Julia": "#a270ba",
    "MATLAB": "#e16737",
    "Groovy": "#4298b8",
    "PowerShell": "#012456",
    "Vim Script": "#199f4b",
    "Emacs Lisp": "#c065db",
    "CoffeeScript": "#244776",
    "Erlang": "#B83998",
    "Assembly": "#6E4C13",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "SCSS": "#c6538c",
    "Vue": "#41b883",
    "Svelte": "#ff3e00",
    "Jupyter Notebook": "#DA5B0B",
    "Dockerfile": "#384d54",
    "Makefile": "#427819",
    "Zig": "#ec915c",
    "Nim": "#ffc200",
    "OCaml": "#3be133",
    "F#": "#b845fc",
    "Nix": "#7e7eff",
    "HCL": "#844FBA",
}

DEFAULT_LANGUAGE_COLOR = "#858585"


def _get_language_color(name: str) -> str:
    return LANGUAGE_COLORS.get(name, DEFAULT_LANGUAGE_COLOR)


# --- 1. Language Aggregation ---

def aggregate_languages(all_language_dicts: list[dict]) -> list[LanguageItem]:
    totals: dict[str, int] = defaultdict(int)
    for lang_dict in all_language_dicts:
        for lang, byte_count in lang_dict.items():
            totals[lang] += byte_count

    total_bytes = sum(totals.values())
    if total_bytes == 0:
        return []

    sorted_langs = sorted(totals.items(), key=lambda x: x[1], reverse=True)[:5]
    return [
        LanguageItem(
            name=name,
            percent=round((byte_count / total_bytes) * 100, 1),
            color=_get_language_color(name),
        )
        for name, byte_count in sorted_langs
        if round((byte_count / total_bytes) * 100, 1) > 0.0
    ]


# --- 2. Peak Hour ---

def compute_peak_hour(all_commits: list[list[dict]]) -> tuple[int, str, list[int]]:
    histogram = [0] * 24

    for repo_commits in all_commits:
        for commit_obj in repo_commits:
            try:
                date_str = commit_obj["commit"]["author"]["date"]
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                histogram[dt.hour] += 1
            except (KeyError, ValueError, IndexError):
                continue

    peak_hour = histogram.index(max(histogram)) if max(histogram) > 0 else 12
    peak_period_label = _get_period_label(peak_hour)

    return peak_hour, peak_period_label, histogram


def _get_period_label(hour: int) -> str:
    if hour <= 5:
        return "\U0001f987 Vampire Mode"
    if hour <= 9:
        return "\U0001f305 Early Bird"
    if hour <= 13:
        return "\u2600\ufe0f Morning Grinder"
    if hour <= 17:
        return "\U0001f3d9\ufe0f 9-to-5er"
    if hour <= 21:
        return "\U0001f306 Evening Hacker"
    return "\U0001f319 Night Owl"


# --- 3. Total Commits ---

def count_total_commits(all_commits: list[list[dict]]) -> int:
    return sum(len(repo_commits) for repo_commits in all_commits)


# --- 4. Commit Message Cleaning ---

def clean_commit_messages(all_commits: list[list[dict]]) -> list[str]:
    messages: list[str] = []

    for repo_commits in all_commits:
        for commit_obj in repo_commits:
            try:
                author_name = commit_obj.get("commit", {}).get("author", {}).get("name", "")
                if "[bot]" in author_name:
                    continue
                raw_msg = commit_obj["commit"]["message"]
                first_line = raw_msg.split("\n")[0].strip()
                if len(first_line) < 3:
                    continue
                if first_line.startswith("Merge"):
                    continue
                if first_line.startswith("Bump"):
                    continue
                messages.append(first_line)
            except (KeyError, TypeError):
                continue

    deduplicated = list(dict.fromkeys(messages))
    random.shuffle(deduplicated)
    return deduplicated[:50]


# --- 5. Recent Streak ---

def compute_recent_streak(events: list[dict]) -> int:
    dates: set[datetime] = set()

    for event in events:
        if event.get("type") not in ("PushEvent", "CreateEvent"):
            continue
        try:
            created = event["created_at"]
            dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
            dates.add(dt.date())
        except (KeyError, ValueError):
            continue

    if not dates:
        return 0

    sorted_dates = sorted(dates, reverse=True)

    streak = 1
    for i in range(1, len(sorted_dates)):
        if sorted_dates[i - 1] - sorted_dates[i] == timedelta(days=1):
            streak += 1
        else:
            break

    return streak


# --- 6. Most Active Repo ---

def find_most_active_repo(repos_with_commits: dict[str, int]) -> str:
    if not repos_with_commits:
        return "N/A"
    return max(repos_with_commits, key=repos_with_commits.get)


# --- Main aggregation entry point ---

def aggregate(
    all_language_dicts: list[dict],
    all_commits: list[list[dict]],
    events: list[dict],
    repos_with_commits: dict[str, int],
    total_repos: int,
) -> dict:
    top_languages = aggregate_languages(all_language_dicts)
    peak_hour, peak_period_label, hour_histogram = compute_peak_hour(all_commits)
    total_commits = count_total_commits(all_commits)
    commit_messages = clean_commit_messages(all_commits)
    recent_streak_days = compute_recent_streak(events)
    most_active_repo = find_most_active_repo(repos_with_commits)

    return {
        "top_languages": top_languages,
        "peak_hour": peak_hour,
        "peak_period_label": peak_period_label,
        "hour_histogram": hour_histogram,
        "total_commits": total_commits,
        "commit_messages": commit_messages,
        "recent_streak_days": recent_streak_days,
        "most_active_repo": most_active_repo,
        "total_repos": total_repos,
    }
