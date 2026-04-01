# LeetGrind

LeetGrind is a social coding accountability backend where users can track LeetCode progress, keep personal streaks, compete on leaderboards, and maintain group streaks together.

## Tech Stack

- Python 3.11+
- FastAPI
- SQLite
- SQLAlchemy
- LeetCode API integration via alfa-leetcode-api

## Features Implemented

- Account registration and login with JWT auth
- Connect your LeetCode username
- Sync solved counts from the alfa-leetcode-api endpoint
- Create groups and add members
- Daily check-ins for:
	- Problem difficulty (easy/medium/hard)
	- Number of problems solved
	- Hours spent
	- Whether daily problem was completed
- Personal streak tracking:
	- Activity streak (days in a row with any solved problem)
	- Daily problem streak
- Group streak tracking:
	- Group streak continues only when all members complete daily problem
- Global leaderboard ranking by solved count and streaks

## Quick Start

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy env template:

```bash
cp .env.example .env
```

4. Run the API:

```bash
uvicorn app.main:app --reload
```

5. Open docs:

- Swagger UI: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

## API Overview

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

## Project Structure

```text
.
├── app
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
├── requirements.txt
└── .env.example
```

## Notes

- Database tables auto-create at startup.
- This is an MVP foundation intended for fast iteration.
- Next improvements: friendship model, group invites, scheduled LeetCode sync jobs, and frontend app.
