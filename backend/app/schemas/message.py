from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    message: str
    
class MessageResponse(BaseModel):
    user_id: str
    nickname: str
    message: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
