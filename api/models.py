import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class MatchupResult(Base):
    __tablename__ = "matchup_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    round: Mapped[int] = mapped_column(Integer, nullable=False)
    winner_id: Mapped[int] = mapped_column(Integer, nullable=False)
    loser_id: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class QBElo(Base):
    __tablename__ = "qb_elo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    qb_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=1500.0)
    wins: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    losses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
