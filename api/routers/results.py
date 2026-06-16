from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from elo import update_ratings
from models import MatchupResult
from qbs import QB_MAP
from schemas import PickRequest, PickResponse

router = APIRouter(prefix="/results", tags=["results"])


@router.post("/pick", response_model=PickResponse, status_code=201)
def submit_pick(pick: PickRequest, db: Session = Depends(get_db)):
    if pick.winner_id == pick.loser_id:
        raise HTTPException(status_code=422, detail="winner_id and loser_id must differ.")
    if pick.winner_id not in QB_MAP or pick.loser_id not in QB_MAP:
        raise HTTPException(status_code=422, detail="Unknown QB id.")

    # Idempotency: if this exact matchup for this session already exists, return it
    existing = (
        db.query(MatchupResult)
        .filter(
            MatchupResult.session_id == pick.session_id,
            MatchupResult.winner_id == pick.winner_id,
            MatchupResult.loser_id == pick.loser_id,
        )
        .first()
    )
    if existing:
        return existing

    record = MatchupResult(
        session_id=pick.session_id,
        round=pick.round,
        winner_id=pick.winner_id,
        loser_id=pick.loser_id,
    )
    db.add(record)
    update_ratings(db, pick.winner_id, pick.loser_id)
    db.commit()
    db.refresh(record)
    return record
