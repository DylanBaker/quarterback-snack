from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine
from routers import leaderboard, results


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Quarterback Snack API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(results.router)
app.include_router(leaderboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}
