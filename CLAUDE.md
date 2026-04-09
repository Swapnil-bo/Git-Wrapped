# CLAUDE.md — Git Wrapped 🎁
> Like Spotify Wrapped, but for your GitHub. Shareable. Roastable. Viral.

---

## ⚠️ ABSOLUTE RULES — ENGRAVE THESE INTO YOUR CONTEXT

1. **DO NOT touch git.** No `git add`, `git commit`, `git push`, `git init`. Nothing. The developer handles all version control manually. Your only job is to write code.
2. **DO NOT auto-format or auto-lint** unless explicitly asked.
3. **DO NOT install any package not listed in the deps section below.** Ask first.
4. **DO NOT use any UI component library** (no shadcn, no MUI, no Radix, no Chakra). Every component is hand-built.
5. **DO NOT generate placeholder comments** like `// TODO` or `// Add logic here`. Either write the logic or flag it explicitly.
6. **Follow the Build Order exactly.** Do not skip ahead. Do not build frontend before backend is curl-tested.

---

## 🧠 Project Overview

**Git Wrapped** is a stateless web app. User enters any GitHub username → backend fetches and aggregates their GitHub data → calls Groq once → returns a structured JSON payload → frontend renders a Spotify Wrapped-style animated card deck with 5 story cards.

The final card has a **Share on X** button and a **Download PNG** button. This is designed to go viral. Every design and copy decision must serve that goal.

**North star:** Someone sees a screenshot of Card 5 on X and immediately wants to generate their own.

---

## 🏗️ Architecture

### Monorepo Structure
```
git-wrapped/
├── backend/
│   ├── main.py
│   ├── github_client.py
│   ├── stats.py
│   ├── groq_client.py
│   ├── models.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
└── CLAUDE.md
```

### Backend — FastAPI (`/backend`)
- Python 3.11+, FastAPI, httpx (async), python-dotenv, groq SDK, pydantic v2
- Responsibilities: fetch GitHub data → aggregate stats → call Groq → return `WrappedData`
- Stateless. No database. No Redis. No file persistence.
- CORS enabled for `http://localhost:5173` (dev) and the production frontend URL

### Frontend — React + Vite (`/frontend`)
- React 18, Vite 5, TailwindCSS v3, Framer Motion, react-countup, react-swipeable, html2canvas
- Card deck is the entire UI. No nav bars, no dashboards, no sidebars.
- Mobile-first. Swipeable on touch. Arrow keys on desktop.

---

## 🔌 Environment Variables

### Backend `.env`
```
GITHUB_TOKEN=your_github_pat_here
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📡 Backend — Full Spec

### `models.py` — Define All Pydantic Models Here First

All models use **Pydantic v2 syntax** (`model_config`, `model_dump()`, not `dict()`).

```
LanguageItem:     name: str, percent: float, color: str
CardCopy:         headline: str, subtext: str
CardDeck:         dna: CardCopy, hours: CardCopy, streak: CardCopy, vibe: CardCopy, final: FinalCardCopy
FinalCardCopy:    headline: str, subtext: str, sign_off: str
WrappedData:      (full schema — see Response Schema section below)
AnalyzeRequest:   username: str
```

Build `models.py` first. Every other file imports from it.

---

### `github_client.py` — GitHub API Layer

**Base URL:** `https://api.github.com`

**Auth:** All requests use `Authorization: Bearer {GITHUB_TOKEN}` header.

**Client config:**
```python
httpx.AsyncClient(
    base_url="https://api.github.com",
    headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json"},
    timeout=httpx.Timeout(10.0, connect=5.0)   # MANDATORY — never omit timeouts
)
```

**Functions to implement:**

| Function | Endpoint | Notes |
|---|---|---|
| `get_user(username)` | `GET /users/{username}` | Returns avatar_url, name, login |
| `get_repos(username)` | `GET /users/{username}/repos?per_page=100&sort=pushed` | Public repos only |
| `get_languages(owner, repo)` | `GET /repos/{owner}/{repo}/languages` | Returns `{Language: bytes}` dict |
| `get_commits(owner, repo, username, since)` | `GET /repos/{owner}/{repo}/commits?author={username}&since={since}&per_page=100` | since = Jan 1 current year ISO8601 |
| `get_events(username)` | `GET /users/{username}/events/public?per_page=100` | Hard ceiling: 90 events max from GitHub — do not attempt pagination, this is a GitHub API restriction |

**Parallelism strategy:**
- Fetch user profile first (needed for display name + avatar).
- Then fetch repos.
- Then fire language + commit requests **in parallel** using `asyncio.gather()` across top 10 repos sorted by `pushed_at`.
- Get events in parallel with the repo fetching batch.

**Error handling in this layer:**
- 404 → raise a custom `UserNotFoundError`
- 403 / 429 → raise a custom `RateLimitError`
- Any `httpx.TimeoutException` → raise a custom `GitHubTimeoutError`
- All custom errors are caught in `main.py` and mapped to HTTP responses

---

### `stats.py` — Data Aggregation Layer

**Input:** Raw data from `github_client.py`
**Output:** Aggregated stats dict that feeds directly into Groq and `WrappedData`

**1. Language Aggregation**
- Sum bytes per language across all repos
- Compute percentage of total bytes
- Take top 5
- Map each language name to its color hex using `languageColors.js` equivalent in Python (`LANGUAGE_COLORS` dict in `stats.py`)
- Source of truth for language colors: `https://github.com/ozh/github-colors` — hardcode the top 30 most common languages, default to `#858585` for unknown

**2. Commit Timestamps → Peak Hour**
- Extract `commit.commit.author.date` from every commit object
- Parse ISO8601 → extract `hour` (0–23) in UTC (keep consistent, don't localize)
- Build a 24-bucket histogram
- `peak_hour` = bucket with max count
- Derive `peak_period_label` using this exact mapping:
  ```
  0–5   → "🦇 Vampire Mode"
  6–9   → "🌅 Early Bird"
  10–13 → "☀️ Morning Grinder"
  14–17 → "🏙️ 9-to-5er"
  18–21 → "🌆 Evening Hacker"
  22–23 → "🌙 Night Owl"
  ```

**3. Total Commits**
- Sum of all commits fetched across top 10 repos for current year
- This is an approximation (capped at 100/repo). State it in the UI as "~{n} commits this year"

**4. Commit Message Cleaning**
- Collect first line of each commit message (split on `\n`, take index 0)
- Filter out: messages starting with `Merge`, messages starting with `Bump`, bot-authored commits (author name contains `[bot]`), messages under 3 characters
- Deduplicate exact matches
- Take up to 50, shuffled (so Groq sees variety, not just oldest/newest)

**5. Longest Streak — IMPORTANT CAVEAT**
- Source: `/users/{username}/events/public` — GitHub hard-caps this at **90 events max**. This means streak calculation is only accurate for the last ~3–4 weeks of activity, not the full year.
- Implementation: Extract dates from `PushEvent` and `CreateEvent` types only → convert to `date` objects → deduplicate → sort → walk forward counting consecutive days
- In the response and UI, label this as "Recent Streak" not "Longest Streak of the Year" — do not misrepresent the data ceiling

**6. Most Active Repo**
- Repo name (not full `owner/repo`) with the highest commit count in the fetched dataset

---

### `groq_client.py` — Groq Integration

**One call. One JSON response. This is the soul of the product.**

**Model:** `llama-3.3-70b-versatile`

**Input payload (build this dict in `groq_client.py` from the aggregated stats):**
```json
{
  "username": "SwapnilHazra4",
  "total_commits": 312,
  "top_languages": [
    {"name": "Python", "percent": 62.4},
    {"name": "TypeScript", "percent": 21.1}
  ],
  "peak_hour": 2,
  "peak_period_label": "🦇 Vampire Mode",
  "recent_streak_days": 14,
  "total_repos": 23,
  "most_active_repo": "SynthBoard",
  "commit_messages_sample": ["fix: finally", "why does this work", "feat: add thing"]
}
```

**System prompt — copy this exactly:**
```
You are a witty, slightly savage tech personality analyst. You analyze GitHub stats and generate 
Spotify Wrapped-style card content for developers. Be specific — always reference the actual 
numbers from the stats. Roast gently but pointedly. Think: developer Twitter humor. Sharp. Punchy. Relatable. 
Avoid generic phrases like "you're a rockstar" or "amazing work". Be specific. Be funny. Be real.

Return ONLY valid JSON. No markdown fences. No explanation text. No preamble. Start your response 
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
}
```

**Parse + retry logic:**
1. Call Groq, attempt `json.loads()` on response content
2. If parse fails: retry **once** with an appended user message: `"Your previous response was not valid JSON. Return only the JSON object, nothing else."`
3. If second attempt fails: return the hardcoded `FALLBACK_COPY` dict defined at the top of `groq_client.py`
4. Never crash the entire request because Groq returned bad JSON

---

### `main.py` — FastAPI App

**Endpoints:**

```
GET  /health      →  { "status": "ok", "model": GROQ_MODEL }
POST /analyze     →  WrappedData
```

**CORS config:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("FRONTEND_URL", "")],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**`/analyze` flow:**
1. Validate request body is `AnalyzeRequest`
2. Call `github_client.get_user()` → catch `UserNotFoundError` → return 404 immediately
3. Fire all remaining GitHub fetches
4. Call `stats.aggregate()` → returns the stats dict
5. Call `groq_client.get_card_copy(stats_dict)` → returns card copy or fallback
6. Assemble and return `WrappedData`

**Error → HTTP mapping:**
```
UserNotFoundError     → 404  { "error": "GitHub user not found." }
RateLimitError        → 429  { "error": "GitHub rate limit hit. The token needs a break." }
GitHubTimeoutError    → 504  { "error": "GitHub took too long. Try again." }
Exception (catch-all) → 500  { "error": "Something broke. Very on-brand." }
```

---

### Response Schema (`WrappedData`)

```python
class WrappedData(BaseModel):
    username: str
    avatar_url: str
    display_name: str
    total_commits: int          # approximate, based on top 10 repos
    total_repos: int
    top_languages: list[LanguageItem]   # max 5, sorted by percent desc
    peak_hour: int              # 0–23
    peak_period_label: str
    recent_streak_days: int     # based on last ~90 events only
    most_active_repo: str
    archetype_title: str        # from Groq, e.g. "THE MIDNIGHT GOBLIN"
    archetype_subtitle: str     # from Groq, e.g. "Ships at 2AM..."
    cards: CardDeck
```

---

## 🎨 Frontend — Full Spec

### Aesthetic: **Dark Cyberpunk Zine**

This is not a dashboard. This is an experience. A poster. A flex.

**Colors — hardcode these as CSS variables in `index.css`:**
```css
:root {
  --bg-base:        #0A0A0F;
  --bg-card:        rgba(255, 255, 255, 0.03);
  --border-glow:    rgba(0, 245, 255, 0.2);
  --accent-cyan:    #00F5FF;
  --accent-magenta: #FF006E;
  --accent-green:   #39FF14;
  --text-primary:   #F0F0F0;
  --text-secondary: #888899;
  --font-display:   'Space Grotesk', sans-serif;
  --font-mono:      'JetBrains Mono', monospace;
}
```

**Fonts — load both from Google Fonts in `index.html`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```
> ⚠️ `html2canvas` has known issues with Google Fonts. When calling `html2canvas`, use `{ useCORS: true, scale: 2, logging: false }` and render the card at 800×500px (fixed dimensions, not viewport-relative) to ensure font rendering works.

**NO:** Generic gradients, purple-on-white, any Bootstrap, any shadows that don't glow, any border-radius over 16px.

**YES:** Grain texture overlay (CSS noise SVG as background-image), glowing borders (`box-shadow: 0 0 20px var(--accent-cyan)`), full-bleed card panels, large confident typography.

**Grain texture (add to `.noise-overlay` class):**
```css
.noise-overlay::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,...");  /* generate an SVG noise pattern */
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}
```

---

### App Flow

```
[Landing]       → username input, "Unwrap" button, subtle animated background
      ↓ submit
[Loading]       → rotating quips every 1.5s, animated pulse
      ↓ success
[Card Deck]     → Cards 1–5, swipeable/arrow-navigable, dot indicators
      ↓ Card 5
[Share/Download]→ two CTA buttons at the bottom of Card 5
```

---

### Component Structure

```
src/
├── App.jsx
├── index.css                        # CSS variables, global reset, font imports
├── components/
│   ├── LandingInput.jsx             # username input + Unwrap button
│   ├── LoadingScreen.jsx            # rotating quips + animated indicator
│   ├── CardDeck.jsx                 # card state, keyboard nav, swipe, dot indicators
│   ├── cards/
│   │   ├── CardDNA.jsx              # language bars, animated on enter
│   │   ├── CardHours.jsx            # 24-bar histogram, peak bar highlighted
│   │   ├── CardStreak.jsx           # hero number, count-up animation
│   │   ├── CardVibe.jsx             # commit message quote card
│   │   └── CardFinal.jsx           # archetype reveal, stats, share/download
│   └── ShareButton.jsx              # html2canvas + X share + PNG download
├── hooks/
│   └── useWrapped.js                # fetch logic, status machine, error handling
└── utils/
    └── languageColors.js            # { "Python": "#3572A5", "JavaScript": "#f1e05a", ... }
                                     # Source: https://github.com/ozh/github-colors
                                     # Include top 40 languages minimum
```

---

### `useWrapped.js` — State Machine

```
status: 'idle' | 'loading' | 'success' | 'error'
data:   WrappedData | null
error:  string | null
```

- On submit: set `loading`, POST to `${VITE_API_BASE_URL}/analyze`, handle all status codes explicitly
- 404 → `error: "That GitHub username doesn't exist."`
- 429 → `error: "GitHub rate limit hit. Try again in a minute."`
- 504 → `error: "GitHub is being slow. Try again."`
- Network failure → `error: "Can't reach the server. Is the backend running?"`
- Success → set `data`, set `success`

---

### Card Specs

Every card is: `width: 100%, max-width: 480px, height: 640px` on mobile.
Cards center themselves vertically and horizontally in the viewport.
Each card gets an `id="card-{n}"` for html2canvas targeting.

#### Card 1 — Coder DNA 🧬
- Groq `card_dna.headline` at top, large, `Space Grotesk Bold`
- Animated language bars (Framer Motion, staggered entrance, 0.1s delay between bars)
- Each bar: language name left, percentage right, filled bar using the language's actual color
- Groq `card_dna.subtext` at bottom in `JetBrains Mono`, muted color
- Bar fill animates from 0% to actual % on card entrance (not on mount — only when this card is active)

#### Card 2 — Peak Hours 🕐
- 24 vertical bars (one per hour, 0–23), evenly spaced
- Bar heights proportional to commit count in that hour
- Peak hour bar: `var(--accent-cyan)`, glowing; all others: `rgba(255,255,255,0.15)`
- Bars animate up from 0 height using Framer Motion on card entrance
- Big label below chart: `peak_period_label` in large Space Grotesk
- Groq `card_hours.headline` + `subtext`

#### Card 3 — Streak 🔥
- Hero card. One giant number: `recent_streak_days`
- Use `react-countup`: count from 0 to the number over 1.5s, delay starts when card becomes active
- "RECENT STREAK" label beneath in `JetBrains Mono` caps, letter-spacing: 0.2em
- Small note: `(based on last ~90 events)` in tiny muted text — **do not hide this caveat**
- Groq `card_streak.headline` + `subtext`
- If streak is 0 or 1: Groq will handle the roast. Don't add any frontend logic to hide low numbers.

#### Card 4 — Commit Vibe 💬
- Quote-card layout — Groq `card_vibe.headline` as a massive pull-quote in center
- Opening `"` in `var(--accent-magenta)`, large decorative character
- `card_vibe.subtext` beneath
- Show 3–5 actual commit messages from the data as small pill/tag elements (`JetBrains Mono`, dark background, subtle border)
- Pass `data.commit_messages_sample` (first 5) from the API response for this — add `commit_messages_sample: string[]` (5 items) to `WrappedData`

#### Card 5 — Final Wrap 🏆
- GitHub avatar: circular, `border: 2px solid var(--accent-cyan)`, `box-shadow: 0 0 20px var(--accent-cyan)`, 80px diameter
- `archetype_title` in massive uppercase Space Grotesk (this is the headline — make it HUGE)
- `archetype_subtitle` beneath in mono, muted
- Stats row: `{total_commits} commits · {total_repos} repos · {recent_streak_days} day streak`
- `card_final.sign_off` in italic mono
- Two buttons: **Share on X** | **Download PNG**
- This card has `id="final-card"` for html2canvas

---

### `ShareButton.jsx` — Share + Download Logic

**Download PNG:**
```javascript
const canvas = await html2canvas(document.getElementById('final-card'), {
  useCORS: true,
  scale: 2,
  logging: false,
  backgroundColor: '#0A0A0F'
})
const link = document.createElement('a')
link.download = `git-wrapped-${username}.png`
link.href = canvas.toDataURL('image/png')
link.click()
```

**Share on X:**
> ⚠️ Twitter Web Intent cannot attach images. The image is NOT shareable directly via URL intent. The copy must be compelling enough to stand alone. Users download the PNG separately and attach it manually. Make this clear in the UI with a tooltip or small note: "Download the card and attach it to your tweet for full effect."

Pre-fill tweet text:
```
My GitHub Wrapped just dropped 👀

"{archetype_title}" — {archetype_subtitle}

~{total_commits} commits · {recent_streak_days} day streak · mostly {top_language}

Try yours → gitwrapped.app
#GitWrapped #100DaysOfCode
```

Open: `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

---

### `CardDeck.jsx` — Navigation

- State: `activeIndex` (0–4)
- Desktop: left/right arrow keys via `useEffect` + `keydown` listener
- Mobile: `useSwipeable` from `react-swipeable` — swipe left advances, swipe right goes back
- Dot indicators at the bottom: 5 dots, active dot uses `var(--accent-cyan)`, inactive are muted
- Card transition: Framer Motion `AnimatePresence` with slide + fade — slide direction depends on advance vs back
- Only the active card is rendered at full opacity. Adjacent cards are not pre-rendered (avoids html2canvas capturing wrong card).

---

### Loading Screen Quips

Rotate every 1.5s using `setInterval`, array:
```
"Judging your commit frequency..."
"Counting your 2AM regrets..."
"Analyzing commit messages for trauma..."
"Asking Groq what kind of developer you are..."
"Calculating your main character arc..."
"Reading between the git diffs..."
"Summoning your coder archetype..."
"Checking if your streak is real or coping..."
"Parsing the vibes. The vibes are chaotic."
```

---

## 📦 Dependencies

### Backend `requirements.txt`
```
fastapi
uvicorn[standard]
httpx
python-dotenv
groq
pydantic>=2.0
```

### Frontend `package.json` dependencies
```
react
react-dom
framer-motion
react-countup
react-swipeable
html2canvas
```

### Frontend devDependencies
```
vite
@vitejs/plugin-react
tailwindcss
postcss
autoprefixer
```

---

## 🚀 Dev Run Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# runs on http://localhost:5173
```

### Test backend before touching frontend (Step 6 of build order)
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}' | python3 -m json.tool
```
Expected: Full `WrappedData` JSON with all fields populated and no nulls.

---

## 📋 Build Order — Follow This Exactly

| Step | Task | Done When |
|---|---|---|
| 1 | Scaffold full folder structure (both backend and frontend dirs, all empty files) | All paths exist |
| 2 | `models.py` — all Pydantic v2 models | Imports without error |
| 3 | `github_client.py` — all 5 fetch functions + error classes + timeout config | Unit-testable in isolation |
| 4 | `stats.py` — language map, peak hour, commit cleaning, streak, most active repo | Returns correct dict for mocked input |
| 5 | `groq_client.py` — system prompt, call, parse, retry, fallback | Returns valid card copy dict always |
| 6 | `main.py` — wire everything, CORS, error handlers | curl test passes with real username |
| 7 | **STOP. Curl test backend with 3 real usernames before writing a single line of frontend.** | All 3 return valid JSON |
| 8 | Vite + Tailwind setup, CSS variables in `index.css`, font imports in `index.html` | Blank page loads with correct background color |
| 9 | `languageColors.js` utility — 40+ languages | Python, JS, TS, Go, Rust all have correct hex |
| 10 | `useWrapped.js` hook | All 5 status states reachable |
| 11 | `LandingInput.jsx` + `LoadingScreen.jsx` | Submit → loading → (mock success) works |
| 12 | `CardDNA.jsx` → `CardHours.jsx` → `CardStreak.jsx` → `CardVibe.jsx` (in order) | Each card renders with mock data |
| 13 | `CardFinal.jsx` + `ShareButton.jsx` | PNG downloads correctly |
| 14 | `CardDeck.jsx` — navigation, swipe, dots, AnimatePresence transitions | All navigation methods work |
| 15 | Wire full flow end-to-end with real API | Real username → real cards → real share |
| 16 | Edge cases: new account (0 commits), all-private repos, very long username | No crashes, graceful empty states |
| 17 | `README.md` with setup instructions, env var table, demo screenshot placeholder | Complete |

---

## 🛡️ Edge Cases — Handle All of These

| Scenario | Expected Behavior |
|---|---|
| User has 0 public repos | Show cards with zero stats, Groq gets zeros, copy handles it |
| User has 0 commits this year | `total_commits: 0`, streak `0`, Groq roasts appropriately |
| User has only 1 language | DNA card shows 1 bar at 100% |
| `display_name` is null on GitHub | Fall back to `username` |
| Groq returns non-JSON | Use fallback copy, do not surface error to user |
| GitHub returns empty commit list | Don't crash stats aggregation, return 0s |
| Username has special characters | FastAPI URL-encodes correctly, no injection |
| API call takes > 8 seconds | httpx timeout fires → 504 response → user sees timeout message |

---

## 🎯 Success Criteria

- Any valid GitHub username → 5 fully rendered cards in under 8 seconds on a standard connection
- Card 5 is visually screenshot-worthy — someone would post it unprompted
- Groq copy references the user's actual numbers, not generic filler
- Download PNG produces a clean 2x resolution card at `#0A0A0F` background
- No console errors on the happy path
- No crashes on any of the edge cases listed above
- Mobile swipe works on iOS Safari and Android Chrome

---

## 🧱 Known Constraints (Architectural Decisions Already Made)

- **GitHub events ceiling:** The events API returns max 90 events. Streak is therefore a "recent streak" approximation. This is labeled honestly in the UI. Do not attempt to work around this with scraping.
- **Twitter image sharing:** Web Intent cannot attach images. Users download PNG and attach manually. This is a known limitation and is documented in the UI.
- **Font rendering in html2canvas:** Google Fonts via CDN can fail to render in html2canvas captures. Mitigate with `{ useCORS: true, scale: 2 }`. If fonts still fail, the card must still look acceptable in fallback sans-serif — do not use fonts that completely break layout if they fail to load.
- **Commit count is approximate:** We cap at 100 commits per repo across top 10 repos. Display as `~{n}` commits, never as an exact number.
- **No backend image hosting:** Sharing is tweet-text only. PNG is local download only. Adding a backend image store is out of scope for v1.
- **Pydantic v2:** All models use v2 API. Never use `.dict()` — use `.model_dump()`.

---

*Built by Swapnil Hazra — 100 Days of Vibe Coding*