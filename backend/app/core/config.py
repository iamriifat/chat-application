import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Anonymous Chat Platform"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://chat:chat@db:5432/chatdb")

settings = Settings()
