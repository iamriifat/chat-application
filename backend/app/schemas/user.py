from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserLogin(BaseModel):
    pass # No fields needed for anon login, but can hold device info later

class UserResponse(BaseModel):
    user_id: str
    nickname: str
    created_at: datetime
    
    class Config:
        from_attributes = True
