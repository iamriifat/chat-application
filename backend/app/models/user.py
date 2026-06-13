from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class AnonymousUser(Base):
    __tablename__ = "anonymous_users"

    user_id = Column(String, primary_key=True, index=True)
    nickname = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
