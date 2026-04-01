from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import DailyProgress, Group, GroupMember, User
from app.schemas import UserStats


def consecutive_streak(dates: set[date], today: date | None = None) -> int:
    if not dates:
        return 0

    cursor = today or date.today()
    streak = 0
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def build_user_stats(db: Session, user: User) -> UserStats:
    records = db.query(DailyProgress).filter(DailyProgress.user_id == user.id).all()

    total_solved = sum(r.problems_solved for r in records)
    total_hours = round(sum(r.hours_spent for r in records), 2)

    activity_dates = {r.entry_date for r in records if r.problems_solved > 0}
    daily_problem_dates = {r.entry_date for r in records if r.did_daily_problem}

    solved_by_difficulty = {"easy": 0, "medium": 0, "hard": 0}
    for record in records:
        if record.problem_difficulty in solved_by_difficulty:
            solved_by_difficulty[record.problem_difficulty] += record.problems_solved

    return UserStats(
        user_id=user.id,
        username=user.username,
        total_problems_solved=total_solved,
        total_hours_spent=total_hours,
        current_activity_streak=consecutive_streak(activity_dates),
        current_daily_problem_streak=consecutive_streak(daily_problem_dates),
        solved_by_difficulty=solved_by_difficulty,
    )


def group_daily_streak(db: Session, group_id: int) -> int:
    member_rows = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    member_ids = {row.user_id for row in member_rows}
    if not member_ids:
        return 0

    records = (
        db.query(DailyProgress)
        .filter(DailyProgress.user_id.in_(member_ids), DailyProgress.did_daily_problem.is_(True))
        .all()
    )

    by_date = defaultdict(set)
    for record in records:
        by_date[record.entry_date].add(record.user_id)

    complete_dates = {d for d, done_ids in by_date.items() if done_ids == member_ids}
    return consecutive_streak(complete_dates)


def build_group_leaderboard(db: Session, group_id: int) -> list[UserStats]:
    members = (
        db.query(User)
        .join(GroupMember, GroupMember.user_id == User.id)
        .filter(GroupMember.group_id == group_id)
        .all()
    )
    stats = [build_user_stats(db, member) for member in members]
    stats.sort(
        key=lambda s: (
            s.total_problems_solved,
            s.current_activity_streak,
            s.current_daily_problem_streak,
        ),
        reverse=True,
    )
    return stats


def build_global_leaderboard(db: Session) -> list[UserStats]:
    users = db.query(User).all()
    stats = [build_user_stats(db, user) for user in users]
    stats.sort(
        key=lambda s: (
            s.total_problems_solved,
            s.current_activity_streak,
            s.current_daily_problem_streak,
        ),
        reverse=True,
    )
    return stats
