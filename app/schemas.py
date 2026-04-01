from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class MessageResponse(BaseModel):
    message: str


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    leetcode_username: str | None
    created_at: datetime


class LeetCodeConnectRequest(BaseModel):
    leetcode_username: str = Field(min_length=1, max_length=64)


class GroupCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class GroupPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    owner_id: int
    created_at: datetime


class AddMemberRequest(BaseModel):
    username: str


class ProgressCheckInRequest(BaseModel):
    entry_date: date | None = None
    problem_difficulty: Literal["easy", "medium", "hard"] | None = None
    problems_solved: int = Field(ge=0)
    hours_spent: float = Field(ge=0)
    did_daily_problem: bool = False


class ProgressPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    entry_date: date
    problem_difficulty: str | None
    problems_solved: int
    hours_spent: float
    did_daily_problem: bool
    created_at: datetime


class UserStats(BaseModel):
    user_id: int
    username: str
    total_problems_solved: int
    total_hours_spent: float
    current_activity_streak: int
    current_daily_problem_streak: int
    solved_by_difficulty: dict[str, int]


class LeetCodeSnapshotResponse(BaseModel):
    snapshot_date: date
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int


class GroupStats(BaseModel):
    group_id: int
    group_name: str
    group_daily_problem_streak: int
    member_count: int
    leaderboard: list[UserStats]


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    total_problems_solved: int
    current_activity_streak: int
    current_daily_problem_streak: int
