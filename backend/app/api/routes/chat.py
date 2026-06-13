from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import datetime
from app.services.chat_service import manager
from app.db.session import get_db
from app.models.message import Message

router = APIRouter()

@router.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str, nickname: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, room_id, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            
            # Parse incoming JSON (expected: {"message": "hello"})
            import json
            try:
                payload = json.loads(data)
                content = payload.get("message", "")
                
                if not content:
                    continue
                    
                # Save to DB (Optional, but good for history)
                db_msg = Message(
                    user_id=user_id,
                    nickname=nickname,
                    room_id=room_id,
                    content=content
                )
                db.add(db_msg)
                db.commit()
                db.refresh(db_msg)
                
                # Broadcast
                broadcast_msg = {
                    "type": "chat",
                    "user_id": user_id,
                    "nickname": nickname,
                    "message": content,
                    "timestamp": db_msg.timestamp.isoformat()
                }
                
                await manager.broadcast(broadcast_msg, room_id)
                
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id, user_id)
        await manager.broadcast_user_count(room_id)
