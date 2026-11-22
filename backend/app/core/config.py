from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Loaded from environment or .env (project root or backend/)
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")

    database_url: str = "postgresql+psycopg://businessflow:businessflow@localhost:5432/businessflow"
    app_env: str = "development"
    # Must be provided through the JWT_SECRET_KEY environment variable; never hardcode it.
    jwt_secret_key: str = ""
    jwt_expire_minutes: int = 60
    # Set COOKIE_SECURE=true in production over HTTPS.
    cookie_secure: bool = False
    
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"


settings = Settings()

ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:5174"]
