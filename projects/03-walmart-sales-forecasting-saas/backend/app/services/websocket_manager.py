"""
WebSocket Manager for real-time updates
- Handles connection lifecycle (connect, disconnect)
- Manages subscriptions to specific sessions/topics
- Broadcasts messages to subscribed clients
"""
from fastapi import WebSocket
from typing import List, Dict
import logging
import json
import asyncio

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        # Maps session_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Maps user_id -> List[WebSocket] (for user-specific notifications)
        self.user_connections: Dict[str, List[WebSocket]] = {}
        # Global broadcast connections (e.g., admin dashboard)
        self.global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, session_id: str = None, user_id: str = None):
        await websocket.accept()
        
        if session_id:
            if session_id not in self.active_connections:
                self.active_connections[session_id] = []
            self.active_connections[session_id].append(websocket)
            logger.info(f"🔌 WebSocket connected to session: {session_id}")
            
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
            logger.info(f"👤 WebSocket connected for user: {user_id}")
            
        if not session_id and not user_id:
            self.global_connections.append(websocket)
            logger.info("🌍 Global WebSocket connected")

    def disconnect(self, websocket: WebSocket, session_id: str = None, user_id: str = None):
        if session_id and session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
                if not self.active_connections[session_id]:
                    del self.active_connections[session_id]
        
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
                    
        if websocket in self.global_connections:
            self.global_connections.remove(websocket)
            
        logger.info(f"🔌 WebSocket disconnected (Session: {session_id}, User: {user_id})")

    async def broadcast_to_session(self, session_id: str, message: dict):
        """Send message to all clients subscribed to a specific session"""
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Failed to send to session {session_id}: {e}")
                    # Auto-cleanup logic could go here

    async def broadcast_to_user(self, user_id: str, message: dict):
        """Send message to all clients for a specific user"""
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Failed to send to user {user_id}: {e}")

    async def broadcast_global(self, message: dict):
        """Send message to all connected clients (use sparingly)"""
        for connection in self.global_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to broadcast global: {e}")

# Global instance
manager = WebSocketManager()
