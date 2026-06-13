import uuid
import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import AnonymousUser
from app.schemas.user import UserResponse

router = APIRouter()

def generate_nickname():
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    random_str = "".join(random.choices(chars, k=4))
    return f"Anon-{random_str}"

@router.post("/anonymous-login", response_model=UserResponse)
def anonymous_login(db: Session = Depends(get_db)):
    user_id = str(uuid.uuid4())
    nickname = generate_nickname()
    
    new_user = AnonymousUser(user_id=user_id, nickname=nickname)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user
