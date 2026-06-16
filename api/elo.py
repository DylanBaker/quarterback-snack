import math

from sqlalchemy.orm import Session

from config import settings
from models import QBElo


def expected_score(rating_a: float, rating_b: float) -> float:
    return 1 / (1 + math.pow(10, (rating_b - rating_a) / 400))


def update_ratings(
    db: Session,
    winner_id: int,
    loser_id: int,
    k: int = settings.elo_k_factor,
) -> tuple[float, float]:
    winner = _get_or_create(db, winner_id)
    loser = _get_or_create(db, loser_id)

    expected_win = expected_score(winner.rating, loser.rating)
    expected_loss = expected_score(loser.rating, winner.rating)

    new_winner_rating = winner.rating + k * (1 - expected_win)
    new_loser_rating = loser.rating + k * (0 - expected_loss)

    winner.rating = new_winner_rating
    winner.wins += 1

    loser.rating = new_loser_rating
    loser.losses += 1

    db.flush()

    return new_winner_rating, new_loser_rating


def _get_or_create(db: Session, qb_id: int) -> QBElo:
    record = db.query(QBElo).filter(QBElo.qb_id == qb_id).first()
    if not record:
        record = QBElo(qb_id=qb_id, rating=float(settings.elo_initial_rating))
        db.add(record)
        db.flush()
    return record
