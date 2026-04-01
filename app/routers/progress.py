from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import DailyProgress, User
from app.schemas import ProgressCheckInRequest, ProgressPublic

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/checkin", response_model=ProgressPublic)
def create_or_update_checkin(
    payload: ProgressCheckInRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_date = payload.entry_date or date.today()

    progress = (
        db.query(DailyProgress)
        .filter(DailyProgress.user_id == current_user.id, DailyProgress.entry_date == target_date)
        .first()
    )
    if not progress:
        progress = DailyProgress(user_id=current_user.id, entry_date=target_date)

    progress.problem_difficulty = payload.problem_difficulty
    progress.problems_solved = payload.problems_solved
    progress.hours_spent = payload.hours_spent
    progress.did_daily_problem = payload.did_daily_problem

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return progress


@router.get("/me", response_model=list[ProgressPublic])
def list_my_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(DailyProgress)
        .filter(DailyProgress.user_id == current_user.id)
        .order_by(DailyProgress.entry_date.desc())
        .all()
    )
