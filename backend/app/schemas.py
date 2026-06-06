from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserRegister(UserBase):
    password: str
    gender: Optional[str] = ""

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    gender: str
    image_string: str
    status: bool

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

class FileResponse(BaseModel):
    id: int
    file_name: str
    file_extension: str
    blur_hash: Optional[str] = None
    status: str
    file_path: str

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    id: int
    message_type: int
    from_user_id: int
    to_user_id: int
    text: str
    file_id: Optional[int] = None
    created_at: datetime
    file_record: Optional[FileResponse] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
