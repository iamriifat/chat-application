from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    gender = Column(String(10), default="")
    image_string = Column(String(255), default="")
    status = Column(Boolean, default=False)

    # Relationships
    sent_messages = relationship("Message", foreign_keys="[Message.from_user_id]", back_populates="sender", cascade="all, delete-orphan")
    received_messages = relationship("Message", foreign_keys="[Message.to_user_id]", back_populates="receiver", cascade="all, delete-orphan")


class FileModel(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_extension = Column(String(50), nullable=False)
    blur_hash = Column(String(255), nullable=True)
    status = Column(String(20), default="PENDING")  # PENDING, COMPLETED
    file_path = Column(String(255), nullable=False)

    # Relationship
    messages = relationship("Message", back_populates="file_record")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    message_type = Column(Integer, nullable=False)  # 1: TEXT, 2: EMOJI, 3: FILE, 4: IMAGE
    from_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    text = Column(String, default="")
    file_id = Column(Integer, ForeignKey("files.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[from_user_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[to_user_id], back_populates="received_messages")
    file_record = relationship("FileModel", back_populates="messages")
