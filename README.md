# LeetGrind

LeetGrind is a social coding accountability app where users track LeetCode
progress, keep personal streaks, compete on leaderboards, and maintain group
streaks together.

## Tech Stack

- **Backend:** Python 3.11–3.13, FastAPI, SQLAlchemy, SQLite, JWT auth
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router
- **External:** LeetCode stats via `alfa-leetcode-api`

> ⚠️ Python 3.14 is **not** supported yet — `pydantic-core` doesn't have
> prebuilt wheels for it in the pinned versions. Use 3.11, 3.12, or 3.13.

## Features

- Account registration and login with JWT auth
- Connect your LeetCode username and sync solved counts
- Daily check-ins (difficulty, problems solved, hours spent, daily problem)
- Personal streak tracking (activity streak + daily problem streak)
- Groups with group-wide daily problem streaks
- Global leaderboard

---

## Quick Start (Demo)

These steps spin up the full stack locally with pre-populated demo data so you
can log in and click around immediately. The flow is the same on every OS:

1. Start the backend (FastAPI on port 8000).
2. Seed demo data (`python seed.py`).
3. Start the frontend (Vite on port 5173).
4. Log in as **`demo`** / **`password123`**.

### Prerequisites

- **Python 3.11, 3.12, or 3.13**
  - Check what you have:
    - Windows (PowerShell): `py -0`
    - macOS / Linux: `python3 --version`
  - Install if missing:
    - Windows: [python.org/downloads](https://www.python.org/downloads/) or `winget install Python.Python.3.13`
    - macOS: `brew install python@3.13` (or grab the installer from [python.org](https://www.python.org/downloads/))
    - Linux: `sudo apt install python3.13 python3.13-venv` (or your distro's equivalent)
- **Node.js 18+** and `npm`
  - Check: `node --version`
  - Install: [nodejs.org](https://nodejs.org/) (LTS), or `brew install node` on macOS, or `winget install OpenJS.NodeJS.LTS` on Windows
- **Two terminals** — one for the backend, one for the frontend, both opened at the repo root.

---

### 1. Backend — create the venv, install, seed, run

Pick the block for your OS. All commands run from the repo root.

#### macOS / Linux (bash/zsh)

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

#### Windows (PowerShell)

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

> If PowerShell blocks `Activate.ps1` with an execution-policy error, run this
> once (not admin): `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

#### Windows (Git Bash)

```bash
py -3.13 -m venv .venv
source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

When uvicorn is up you'll see `Uvicorn running on http://127.0.0.1:8000`.
The SQLite file `leetgrind.db` is created in the repo root on first run.
Leave this terminal running.

---

### 2. Frontend — install and run

Open a **second** terminal (leave the backend running in the first one). All
commands run from the repo root.

#### macOS / Linux / Git Bash

```bash
cd frontend
npm install
npm run dev
```

#### Windows (PowerShell)

```powershell
cd frontend
npm install
npm run dev
```

Vite will print a URL like `http://localhost:5173`. Open it in your browser.
The dev server proxies `/auth`, `/users`, `/progress`, `/groups`, and
`/leaderboards` to the backend on port 8000 automatically (see
`frontend/vite.config.ts`), so no CORS setup is needed.

---

### 3. Log in with the demo account

On the login page, click **"Use demo credentials"** (or type them manually):

- **Username:** `demo`
- **Password:** `password123`

You'll land on the dashboard with pre-populated stats, streaks, a LeetCode
snapshot, group memberships, and a spot on the leaderboard. Other demo
accounts you can try (same password): `alice`, `bob`, `carol`, `dave`.

---

## Seeding and Resetting Demo Data

`seed.py` at the repo root is idempotent — run it any time you want to wipe
the demo users' progress and start fresh:

```bash
python seed.py
```

It creates/updates:

- 5 demo users with hashed passwords: `demo`, `alice`, `bob`, `carol`, `dave`
  (all use the password `password123`)
- Contiguous daily progress records so streak counters are non-zero
- Today's LeetCode snapshot for each user
- Two groups: `LeetGrind Squad` (owned by `demo`) and `Weekend Warriors`

To nuke everything and start from a clean DB:

**macOS / Linux / Git Bash**
```bash
# stop uvicorn first, then:
rm leetgrind.db
python seed.py
uvicorn app.main:app --reload
```

**Windows (PowerShell)**
```powershell
# stop uvicorn first, then:
Remove-Item leetgrind.db
python seed.py
uvicorn app.main:app --reload
```

---

## Subsequent Runs

Once the venv and `node_modules` are set up, day-to-day startup is just:

**Backend (terminal 1):**
```bash
# macOS / Linux / Git Bash
source .venv/bin/activate        # Git Bash on Windows: source .venv/Scripts/activate
uvicorn app.main:app --reload
```
```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Frontend (terminal 2):**
```bash
cd frontend
npm run dev
```

---

## Environment Variables

Copy `.env.example` to `.env` if you want to override defaults:

```bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./leetgrind.db` | SQLAlchemy DB URL |
| `JWT_SECRET` | `change-this-in-production` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `120` | Token lifetime |
| `LEETCODE_API_BASE_URL` | `https://alfa-leetcode-api.onrender.com` | LeetCode stats proxy |

---

## API Overview

Interactive docs: http://127.0.0.1:8000/docs

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Users
- `GET /users/me`
- `POST /users/me/leetcode/connect`
- `POST /users/me/leetcode/sync`
- `GET /users/me/stats`

### Progress
- `POST /progress/checkin`
- `GET /progress/me`

### Groups
- `POST /groups`
- `GET /groups/me`
- `POST /groups/{group_id}/members`
- `GET /groups/{group_id}/stats`

### Leaderboards
- `GET /leaderboards/global`

---

## Project Structure

```text
.
├── app                     # FastAPI backend
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   ├── deps.py
│   ├── routers
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── progress.py
│   │   ├── groups.py
│   │   └── leaderboard.py
│   └── services
│       ├── streaks.py
│       └── leetcode_client.py
├── frontend                # React + Vite frontend
│   └── src
│       ├── pages           # Login, Dashboard, CheckIn, Groups, Leaderboard, ...
│       ├── components
│       ├── context
│       └── api
├── seed.py                 # Demo-data seeder
├── requirements.txt
└── .env.example
```

---

## Troubleshooting

**`pydantic-core` fails to build, mentioning Rust/Cargo:**
You're on Python 3.14. Recreate the venv with 3.11–3.13.

macOS / Linux:
```bash
deactivate 2>/dev/null
rm -rf .venv
python3.13 -m venv .venv        # or python3.12 / python3.11
source .venv/bin/activate
pip install -r requirements.txt
```

Windows PowerShell:
```powershell
deactivate
Remove-Item -Recurse -Force .venv
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**`source : The term 'source' is not recognized` in PowerShell:**
`source` is a bash command. In PowerShell, activate with
`.\.venv\Scripts\Activate.ps1` instead. If activation is blocked by execution
policy, run once (not admin): `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

**macOS says `command not found: python`:**
Use `python3` instead of `python` when creating the venv. Once the venv is
activated, plain `python` inside it points to the right interpreter.

**macOS `Activate.ps1` vs `activate`:**
On macOS/Linux the activation script is `source .venv/bin/activate` (no
`.ps1`). `Activate.ps1` is Windows PowerShell only.

**Login says "Invalid credentials" for the demo account:**
The backend is probably running against a different DB than the one you
seeded. Make sure you run `python seed.py` and `uvicorn` from the same
directory (the repo root) — the SQLite path is relative to the current
working directory.

**Frontend shows network errors:**
Confirm uvicorn is running on `127.0.0.1:8000`, and access the Vite URL
(usually `http://localhost:5173`) — not the uvicorn URL — in the browser.

**`npm` is not recognized / command not found:**
Install Node.js LTS from https://nodejs.org/ (or `brew install node` on
macOS) and open a fresh terminal so `PATH` picks it up.

**Port 8000 or 5173 already in use:**
- Backend: `uvicorn app.main:app --reload --port 8001` (then update the
  proxy targets in `frontend/vite.config.ts` to match).
- Frontend: `npm run dev -- --port 5174`.
