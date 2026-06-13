from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("anonymous_users.user_id"))
    nickname = Column(String)
    room_id = Column(String, index=True, default="global")
    content = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("AnonymousUser")
