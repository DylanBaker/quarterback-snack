from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    frontend_origin: str = "*"
    elo_k_factor: int = 32
    elo_initial_rating: int = 1500

    class Config:
        env_file = ".env"


settings = Settings()
