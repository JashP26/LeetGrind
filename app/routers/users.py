from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import LeetCodeSnapshot, User
from app.schemas import (
    LeetCodeConnectRequest,
    LeetCodeSnapshotResponse,
    MessageResponse,
    UserPublic,
    UserStats,
)
from app.services.leetcode_client import LeetCodeClient
from app.services.streaks import build_user_stats

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/me/leetcode/connect", response_model=MessageResponse)
def connect_leetcode(
    payload: LeetCodeConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.leetcode_username = payload.leetcode_username
    db.add(current_user)
    db.commit()
    return MessageResponse(message="LeetCode account linked")


@router.post("/me/leetcode/sync", response_model=LeetCodeSnapshotResponse)
def sync_leetcode(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.leetcode_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Connect a LeetCode account first")

    client = LeetCodeClient()
    try:
        snapshot_data = client.fetch_snapshot(current_user.leetcode_username)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    today = date.today()
    snapshot = (
        db.query(LeetCodeSnapshot)
        .filter(LeetCodeSnapshot.user_id == current_user.id, LeetCodeSnapshot.snapshot_date == today)
        .first()
    )

    if not snapshot:
        snapshot = LeetCodeSnapshot(user_id=current_user.id, snapshot_date=today)

    snapshot.total_solved = snapshot_data["total_solved"]
    snapshot.easy_solved = snapshot_data["easy_solved"]
    snapshot.medium_solved = snapshot_data["medium_solved"]
    snapshot.hard_solved = snapshot_data["hard_solved"]
    snapshot.raw_payload = snapshot_data["raw_payload"]

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return LeetCodeSnapshotResponse(
        snapshot_date=snapshot.snapshot_date,
        total_solved=snapshot.total_solved,
        easy_solved=snapshot.easy_solved,
        medium_solved=snapshot.medium_solved,
        hard_solved=snapshot.hard_solved,
    )


@router.get("/me/stats", response_model=UserStats)
def my_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_user_stats(db, current_user)
