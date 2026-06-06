import os
import shutil
import base64
import io
from typing import List, Dict, Optional
from datetime import datetime, timezone

from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from PIL import Image

from app.database import engine, Base, get_db
from app.models import User, FileModel, Message
from app.schemas import UserRegister, UserLogin, UserResponse, Token, MessageResponse, FileResponse
from app.auth import get_password_hash, verify_password, create_access_token, verify_token

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chat Application Backend")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify front-end domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception:
                # Connection might be dead
                self.disconnect(user_id)

    async def broadcast(self, message: dict):
        dead_connections = []
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(user_id)
        
        for user_id in dead_connections:
            self.disconnect(user_id)


manager = ConnectionManager()


# Helper function to generate a base64 micro-thumbnail
def generate_micro_thumbnail(file_path: str) -> str:
    try:
        with Image.open(file_path) as img:
            img.thumbnail((16, 16))
            buffered = io.BytesIO()
            if img.mode in ("RGBA", "P"):
                img.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                return f"data:image/png;base64,{img_str}"
            else:
                img.save(buffered, format="JPEG")
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print("Failed to generate micro-thumbnail:", e)
        return ""


# REST ENDPOINTS

@app.post("/api/auth/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if username exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        password_hash=hashed_password,
        gender=user_data.gender or "",
        image_string="",
        status=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/auth/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user.username, "user_id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    # Dynamic status check from connection manager
    for user in users:
        user.status = user.id in manager.active_connections
    return users


@app.get("/api/messages/{other_user_id}", response_model=List[MessageResponse])
def get_messages(other_user_id: int, token: str, db: Session = Depends(get_db)):
    # Validate token
    token_data = verify_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    current_user_id = token_data.user_id
    messages = db.query(Message).filter(
        ((Message.from_user_id == current_user_id) & (Message.to_user_id == other_user_id)) |
        ((Message.from_user_id == other_user_id) & (Message.to_user_id == current_user_id))
    ).order_by(Message.created_at.asc()).all()

    # Load file record details for messages if they exist
    for msg in messages:
        if msg.file_id:
            msg.file_record = db.query(FileModel).filter(FileModel.id == msg.file_id).first()

    return messages


@app.post("/api/files/upload")
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Retrieve extension
    file_name = file.filename
    _, ext = os.path.splitext(file_name)
    
    # Save the file to unique path
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    unique_name = f"{timestamp}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Generate blurhash / micro-thumbnail if it's an image
    blur_hash = None
    if ext.lower() in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        blur_hash = generate_micro_thumbnail(file_path)
        
    # Save file record in database
    db_file = FileModel(
        file_name=file_name,
        file_extension=ext,
        blur_hash=blur_hash,
        status="COMPLETED",
        file_path=f"/uploads/{unique_name}"
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return {
        "id": db_file.id,
        "file_name": db_file.file_name,
        "file_extension": db_file.file_extension,
        "blur_hash": db_file.blur_hash,
        "status": db_file.status,
        "file_path": db_file.file_path
    }


# WEBSOCKET ENDPOINT

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    # Authenticate through query param token
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    token_data = verify_token(token)
    if not token_data or token_data.user_id != user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Accept connection and manage
    await manager.connect(user_id, websocket)
    
    # Update status in db
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.status = True
        db.commit()
        
    # Broadcast connection status
    await manager.broadcast({
        "type": "user_status",
        "user_id": user_id,
        "status": True
    })

    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "send_message":
                message_type = data.get("message_type") # 1: TEXT, 2: EMOJI, 3: FILE, 4: IMAGE
                to_user_id = data.get("to_user_id")
                text = data.get("text", "")
                file_id = data.get("file_id")

                # Insert message
                new_msg = Message(
                    message_type=message_type,
                    from_user_id=user_id,
                    to_user_id=to_user_id,
                    text=text,
                    file_id=file_id
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)

                # Fetch file record if attached
                file_record = None
                if file_id:
                    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()

                # Prep message payload
                msg_payload = {
                    "type": "receive_message",
                    "id": new_msg.id,
                    "message_type": new_msg.message_type,
                    "from_user_id": new_msg.from_user_id,
                    "to_user_id": new_msg.to_user_id,
                    "text": new_msg.text,
                    "file_id": new_msg.file_id,
                    "created_at": new_msg.created_at.isoformat(),
                    "file_record": {
                        "id": file_record.id,
                        "file_name": file_record.file_name,
                        "file_extension": file_record.file_extension,
                        "blur_hash": file_record.blur_hash,
                        "status": file_record.status,
                        "file_path": file_record.file_path
                    } if file_record else None
                }

                # Send back to sender
                await manager.send_personal_message(msg_payload, user_id)
                # Send to recipient
                await manager.send_personal_message(msg_payload, to_user_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        # Update status in db
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.status = False
            db.commit()
            
        # Broadcast disconnect status
        await manager.broadcast({
            "type": "user_status",
            "user_id": user_id,
            "status": False
        })
