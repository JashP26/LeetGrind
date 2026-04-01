from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import LeaderboardEntry
from app.services.streaks import build_global_leaderboard

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])


@router.get("/global", response_model=list[LeaderboardEntry])
def global_leaderboard(limit: int = 50, db: Session = Depends(get_db)):
    stats = build_global_leaderboard(db)
    entries: list[LeaderboardEntry] = []
    for index, stat in enumerate(stats[:limit], start=1):
        entries.append(
            LeaderboardEntry(
                rank=index,
                username=stat.username,
                total_problems_solved=stat.total_problems_solved,
                current_activity_streak=stat.current_activity_streak,
                current_daily_problem_streak=stat.current_daily_problem_streak,
            )
        )
    return entries
