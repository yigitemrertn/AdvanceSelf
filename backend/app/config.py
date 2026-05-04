from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "AdvanceSelf API"
    api_prefix: str = "/api/v1"
    debug: bool = True

    database_url: str = "sqlite+aiosqlite:///./advanceself.db"

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 30

    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Any localhost port (Flet web uses random or chosen HTTP port in the browser).
    cors_origin_regex: str | None = r"http://(127\.0\.0\.1|localhost):\d+"


settings = Settings()
