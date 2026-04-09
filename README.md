# Git Wrapped

Like Spotify Wrapped, but for your GitHub. Shareable. Roastable. Viral.

Enter any GitHub username → get a 5-card animated story deck with AI-generated roasts about your coding habits.

---

## How It Works

1. Enter a GitHub username
2. Backend fetches repos, commits, languages, and events from the GitHub API
3. Stats are aggregated (top languages, peak coding hours, recent streak, commit vibe)
4. Groq LLM generates witty, personalized card copy
5. Frontend renders a Spotify Wrapped-style card deck with animations
6. Download the final card as PNG or share on X

## Tech Stack

| Layer    | Tech                                           |
|----------|-------------------------------------------------|
| Backend  | Python 3.11+, FastAPI, httpx, Groq SDK, Pydantic v2 |
| Frontend | React 18, Vite 5, TailwindCSS v3, Framer Motion    |
| AI       | Groq (llama-3.3-70b-versatile)                      |
| Sharing  | html2canvas (PNG export), Twitter Web Intent         |

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (classic, `public_repo` scope)
- A [Groq API Key](https://console.groq.com/keys)

### Environment Variables

#### Backend (`backend/.env`)

| Variable       | Description                  | Required |
|----------------|------------------------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | Yes      |
| `GROQ_API_KEY` | Groq API key                 | Yes      |
| `GROQ_MODEL`   | Groq model ID                | No (defaults to `llama-3.3-70b-versatile`) |
| `FRONTEND_URL` | Production frontend URL (CORS) | No (defaults to localhost) |

#### Frontend (`frontend/.env`)

| Variable            | Description        | Required |
|---------------------|--------------------|----------|
| `VITE_API_BASE_URL` | Backend API URL    | Yes (defaults to `http://localhost:8000`) |

### Run Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
# Create backend/.env with GITHUB_TOKEN and GROQ_API_KEY
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
# Create frontend/.env with VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

Open `http://localhost:5173` and enter a GitHub username.

## Deployment

### Backend → Render

1. Connect this repo on [Render](https://render.com)
2. Render reads `render.yaml` automatically (Blueprint)
3. Set environment variables: `GITHUB_TOKEN`, `GROQ_API_KEY`, `FRONTEND_URL`

### Frontend → Vercel

1. Import this repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Set env var: `VITE_API_BASE_URL` = your Render backend URL

After both deploy, set `FRONTEND_URL` on Render to your Vercel URL for CORS.

## The 5 Cards

| #  | Card         | What It Shows                                    |
|----|--------------|--------------------------------------------------|
| 1  | Coder DNA    | Top 5 languages with animated bars               |
| 2  | Peak Hours   | 24-hour commit histogram with peak hour highlight |
| 3  | Streak       | Recent consecutive coding days (count-up animation) |
| 4  | Commit Vibe  | AI analysis of commit messages + sample pills     |
| 5  | Final Wrap   | Archetype reveal, stats summary, share/download   |

## Known Constraints

- **Commit count is approximate** — capped at 100 commits/repo across top 10 repos. Displayed as `~N commits`.
- **Streak is recent only** — GitHub events API caps at ~90 events. Labeled "Recent Streak" honestly.
- **Twitter sharing is text-only** — Web Intent can't attach images. Users download PNG and attach manually.
- **Font rendering in PNG** — html2canvas may fall back to system fonts in some browsers.

## Demo

<!-- Add a screenshot of Card 5 here -->

---

*Built by Swapnil Hazra — 100 Days of Vibe Coding*
