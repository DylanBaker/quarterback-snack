import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class PickRequest(BaseModel):
    session_id: uuid.UUID
    round: int = Field(ge=0, le=4)
    winner_id: int = Field(ge=0, le=31)
    loser_id: int = Field(ge=0, le=31)


class BracketSubmission(BaseModel):
    session_id: uuid.UUID
    picks: list[PickRequest]


class PickResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    round: int
    winner_id: int
    loser_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    qb_id: int
    qb_name: str
    team: str
    team_abbr: str
    team_color: str
    rating: float
    wins: int
    losses: int
    total: int
    win_pct: float
    rank: int


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    total_matchups: int
