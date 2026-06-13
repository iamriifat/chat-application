from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        # Room ID -> List of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Keep track of active users count per room (simple tracking)
        self.room_users: Dict[str, set] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
            self.room_users[room_id] = set()
            
        self.active_connections[room_id].append(websocket)
        self.room_users[room_id].add(user_id)
        
        await self.broadcast_user_count(room_id)

    def disconnect(self, websocket: WebSocket, room_id: str, user_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if user_id in self.room_users[room_id]:
                # If they have multiple tabs open, we only want to remove them if this was their last socket
                # but for simplicity, we remove and re-add on connect.
                # A more robust approach checks if they still have sockets.
                pass 
            
            # Simple cleanup for now
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                del self.room_users[room_id]
            else:
                pass # Broadcast updated count later if needed

    async def broadcast(self, message: dict, room_id: str):
        if room_id in self.active_connections:
            msg_str = json.dumps(message)
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(msg_str)
                except Exception:
                    pass

    async def broadcast_user_count(self, room_id: str):
        if room_id in self.active_connections:
            count = len(self.active_connections[room_id])
            msg = {
                "type": "system",
                "action": "user_count",
                "count": count
            }
            await self.broadcast(msg, room_id)

manager = ConnectionManager()
