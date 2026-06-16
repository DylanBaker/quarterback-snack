from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from elo import update_ratings
from models import MatchupResult
from qbs import QB_MAP
from schemas import BracketSubmission, PickResponse

router = APIRouter(prefix="/results", tags=["results"])


@router.post("/", response_model=list[PickResponse], status_code=201)
def submit_bracket(payload: BracketSubmission, db: Session = Depends(get_db)):
    if len(payload.picks) != 31:
        raise HTTPException(status_code=422, detail="A completed bracket must have exactly 31 picks.")

    seen_pairs: set[frozenset[int]] = set()
    for pick in payload.picks:
        if pick.winner_id == pick.loser_id:
            raise HTTPException(status_code=422, detail="winner_id and loser_id must differ.")
        if pick.winner_id not in QB_MAP or pick.loser_id not in QB_MAP:
            raise HTTPException(status_code=422, detail=f"Unknown QB id in pick.")
        pair = frozenset({pick.winner_id, pick.loser_id})
        if pair in seen_pairs:
            raise HTTPException(status_code=422, detail="Duplicate matchup in bracket submission.")
        seen_pairs.add(pair)

    existing = (
        db.query(MatchupResult)
        .filter(MatchupResult.session_id == payload.session_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Results for this session have already been submitted.")

    records = []
    for pick in payload.picks:
        record = MatchupResult(
            session_id=payload.session_id,
            round=pick.round,
            winner_id=pick.winner_id,
            loser_id=pick.loser_id,
        )
        db.add(record)
        records.append(record)
        update_ratings(db, pick.winner_id, pick.loser_id)

    db.commit()
    for r in records:
        db.refresh(r)

    return records
