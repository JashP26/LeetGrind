from fastapi import FastAPI

from app.database import Base, engine
from app.routers import auth, groups, leaderboard, progress, users

app = FastAPI(title="LeetGrind API", version="0.1.0")


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(progress.router)
app.include_router(leaderboard.router)
