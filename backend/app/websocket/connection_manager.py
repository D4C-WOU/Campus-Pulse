"""
Manages live WebSocket connections for the admin dashboard.

Every connected dashboard tab gets the same broadcast when an alert is
created, acknowledged, investigated, resolved, or marked false. There is
no per-user targeting here on purpose -- keeping every admin's view in
sync is exactly the point of a shared incident feed.
"""

import json
from typing import List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, event: str, data: dict):
        """Send a JSON event to every connected client.

        Dead connections are pruned as they're discovered rather than
        raising, so one stale tab can't break the broadcast for everyone
        else.
        """
        payload = json.dumps({"event": event, "data": data}, default=str)

        stale = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                stale.append(connection)

        for connection in stale:
            self.disconnect(connection)


# Single shared instance used across the app (routes + broadcast triggers)
manager = ConnectionManager()
