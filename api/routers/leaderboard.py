from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import MatchupResult, QBElo
from qbs import QB_MAP, QBS
from schemas import LeaderboardEntry, LeaderboardResponse

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=LeaderboardResponse)
def get_leaderboard(db: Session = Depends(get_db)):
    elo_records = {r.qb_id: r for r in db.query(QBElo).all()}
    total_matchups = db.query(func.count(MatchupResult.id)).scalar() or 0

    entries: list[LeaderboardEntry] = []
    for qb in QBS:
        record = elo_records.get(qb["id"])
        rating = record.rating if record else 1500.0
        wins = record.wins if record else 0
        losses = record.losses if record else 0
        total = wins + losses
        win_pct = round(wins / total * 100, 1) if total > 0 else 0.0

        entries.append(
            LeaderboardEntry(
                qb_id=qb["id"],
                qb_name=qb["name"],
                team=qb["team"],
                team_abbr=qb["abbr"],
                team_color=qb["color"],
                rating=round(rating, 1),
                wins=wins,
                losses=losses,
                total=total,
                win_pct=win_pct,
                rank=0,
            )
        )

    entries.sort(key=lambda e: e.rating, reverse=True)
    for i, entry in enumerate(entries):
        entry.rank = i + 1

    return LeaderboardResponse(entries=entries, total_matchups=total_matchups)
