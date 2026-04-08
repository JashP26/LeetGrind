"""
Seed the LeetGrind database with synthetic accounts and sample data.

Run once from the repo root (with your venv activated):

    python seed.py

After running, you can log into the frontend with any of the demo accounts
printed at the bottom of the output. The default login is:

    username: demo
    password: password123
"""

from __future__ import annotations

import json
import random
from datetime import date, datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models import (
    DailyProgress,
    Group,
    GroupMember,
    LeetCodeSnapshot,
    User,
)
from app.security import hash_password


DEMO_PASSWORD = "password123"

DEMO_USERS = [
    {
        "username": "demo",
        "leetcode_username": "demo_leetgrind",
        "total_solved": 187,
        "easy_solved": 92,
        "medium_solved": 78,
        "hard_solved": 17,
        # how many of the last N days should have activity
        "activity_days": 12,
        # how many of the last N days should have did_daily_problem=True
        "daily_problem_days": 12,
    },
    {
        "username": "alice",
        "leetcode_username": "alice_codes",
        "total_solved": 243,
        "easy_solved": 110,
        "medium_solved": 105,
        "hard_solved": 28,
        "activity_days": 15,
        "daily_problem_days": 10,
    },
    {
        "username": "bob",
        "leetcode_username": "bob_grinds",
        "total_solved": 156,
        "easy_solved": 80,
        "medium_solved": 62,
        "hard_solved": 14,
        "activity_days": 8,
        "daily_problem_days": 6,
    },
    {
        "username": "carol",
        "leetcode_username": "carol_dp",
        "total_solved": 301,
        "easy_solved": 120,
        "medium_solved": 140,
        "hard_solved": 41,
        "activity_days": 20,
        "daily_problem_days": 14,
    },
    {
        "username": "dave",
        "leetcode_username": "dave_tries",
        "total_solved": 74,
        "easy_solved": 50,
        "medium_solved": 22,
        "hard_solved": 2,
        "activity_days": 4,
        "daily_problem_days": 3,
    },
]

DEMO_GROUPS = [
    {
        "name": "LeetGrind Squad",
        "owner": "demo",
        "members": ["demo", "alice", "bob", "carol"],
    },
    {
        "name": "Weekend Warriors",
        "owner": "alice",
        "members": ["alice", "carol", "dave"],
    },
]


def ensure_tables() -> None:
    Base.metadata.create_all(bind=engine)


def upsert_user(db, spec: dict) -> User:
    user = db.query(User).filter(User.username == spec["username"]).first()
    if user:
        user.password_hash = hash_password(DEMO_PASSWORD)
        user.leetcode_username = spec["leetcode_username"]
    else:
        user = User(
            username=spec["username"],
            password_hash=hash_password(DEMO_PASSWORD),
            leetcode_username=spec["leetcode_username"],
            created_at=datetime.utcnow() - timedelta(days=30),
        )
        db.add(user)
    db.flush()
    return user


def seed_daily_progress(db, user: User, spec: dict) -> None:
    # Clear existing progress so the seed is idempotent.
    db.query(DailyProgress).filter(DailyProgress.user_id == user.id).delete()

    today = date.today()
    rng = random.Random(hash(user.username) & 0xFFFFFFFF)

    activity_days = int(spec["activity_days"])
    daily_problem_days = int(spec["daily_problem_days"])

    # Give the user a contiguous streak ending today so the streak counters
    # on the dashboard/leaderboard look meaningful.
    for offset in range(activity_days):
        entry_date = today - timedelta(days=offset)
        difficulty = rng.choice(["easy", "medium", "hard"])
        problems_solved = rng.randint(1, 4)
        hours_spent = round(rng.uniform(0.5, 3.0), 1)
        did_daily = offset < daily_problem_days

        db.add(
            DailyProgress(
                user_id=user.id,
                entry_date=entry_date,
                problem_difficulty=difficulty,
                problems_solved=problems_solved,
                hours_spent=hours_spent,
                did_daily_problem=did_daily,
                created_at=datetime.utcnow(),
            )
        )


def seed_leetcode_snapshot(db, user: User, spec: dict) -> None:
    today = date.today()
    db.query(LeetCodeSnapshot).filter(
        LeetCodeSnapshot.user_id == user.id,
        LeetCodeSnapshot.snapshot_date == today,
    ).delete()

    payload = {
        "totalSolved": spec["total_solved"],
        "easySolved": spec["easy_solved"],
        "mediumSolved": spec["medium_solved"],
        "hardSolved": spec["hard_solved"],
    }

    db.add(
        LeetCodeSnapshot(
            user_id=user.id,
            snapshot_date=today,
            total_solved=spec["total_solved"],
            easy_solved=spec["easy_solved"],
            medium_solved=spec["medium_solved"],
            hard_solved=spec["hard_solved"],
            raw_payload=json.dumps(payload),
        )
    )


def seed_groups(db, user_lookup: dict[str, User]) -> None:
    for spec in DEMO_GROUPS:
        owner = user_lookup[spec["owner"]]
        group = (
            db.query(Group)
            .filter(Group.name == spec["name"], Group.owner_id == owner.id)
            .first()
        )
        if not group:
            group = Group(name=spec["name"], owner_id=owner.id)
            db.add(group)
            db.flush()

        # Reset members so membership stays in sync with the spec.
        db.query(GroupMember).filter(GroupMember.group_id == group.id).delete()
        for member_name in spec["members"]:
            member = user_lookup.get(member_name)
            if not member:
                continue
            db.add(GroupMember(group_id=group.id, user_id=member.id))


def main() -> None:
    ensure_tables()
    db = SessionLocal()
    try:
        user_lookup: dict[str, User] = {}
        for spec in DEMO_USERS:
            user = upsert_user(db, spec)
            seed_daily_progress(db, user, spec)
            seed_leetcode_snapshot(db, user, spec)
            user_lookup[spec["username"]] = user

        db.flush()
        seed_groups(db, user_lookup)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("Seed complete. Demo accounts (password is the same for all):")
    print(f"  password: {DEMO_PASSWORD}")
    print("  usernames:")
    for spec in DEMO_USERS:
        print(f"    - {spec['username']}")
    print("\nLog in with `demo` / `password123` to explore the app.")


if __name__ == "__main__":
    main()