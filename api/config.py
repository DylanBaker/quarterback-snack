from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    frontend_origin: str = "*"

    @property
    def frontend_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origin.split(",")]
    elo_k_factor: int = 32
    elo_initial_rating: int = 1500

    class Config:
        env_file = ".env"


settings = Settings()
