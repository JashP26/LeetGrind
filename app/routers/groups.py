from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Group, GroupMember, User
from app.schemas import AddMemberRequest, GroupCreate, GroupPublic, GroupStats, MessageResponse
from app.services.streaks import build_group_leaderboard, group_daily_streak

router = APIRouter(prefix="/groups", tags=["groups"])


def _ensure_member(db: Session, group_id: int, user_id: int) -> None:
    membership = (
        db.query(GroupMember)
        .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
        .first()
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a group member")


@router.post("", response_model=GroupPublic, status_code=status.HTTP_201_CREATED)
def create_group(
    payload: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group = Group(name=payload.name, owner_id=current_user.id)
    db.add(group)
    db.commit()
    db.refresh(group)

    membership = GroupMember(group_id=group.id, user_id=current_user.id)
    db.add(membership)
    db.commit()

    return group


@router.get("/me", response_model=list[GroupPublic])
def list_my_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    groups = (
        db.query(Group)
        .join(GroupMember, GroupMember.group_id == Group.id)
        .filter(GroupMember.user_id == current_user.id)
        .all()
    )
    return groups


@router.post("/{group_id}/members", response_model=MessageResponse)
def add_member(
    group_id: int,
    payload: AddMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    if group.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can add members")

    user_to_add = db.query(User).filter(User.username == payload.username).first()
    if not user_to_add:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = (
        db.query(GroupMember)
        .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_to_add.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already in group")

    db.add(GroupMember(group_id=group_id, user_id=user_to_add.id))
    db.commit()
    return MessageResponse(message="Member added")


@router.get("/{group_id}/stats", response_model=GroupStats)
def group_stats(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    _ensure_member(db, group_id, current_user.id)

    leaderboard = build_group_leaderboard(db, group_id)
    member_count = (
        db.query(GroupMember).filter(GroupMember.group_id == group_id).count()
    )

    return GroupStats(
        group_id=group.id,
        group_name=group.name,
        group_daily_problem_streak=group_daily_streak(db, group_id),
        member_count=member_count,
        leaderboard=leaderboard,
    )
