from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  DATABASE_URL: str
  SECRET_KEY: str
  ALGORITHM: str
  ACCESS_TOKEN_EXPRIRE_MINUTES= 60

  class Config:
    env_file = '.env'


settings = Settings()