"""
Per-alert WebSocket connections for the public status page.
Reporters can subscribe to their own report's reference prefix and
receive live status updates without polling.
"""

import json
from collections import defaultdict
from typing import List

from fastapi import WebSocket


class StatusConnectionManager:
    def __init__(self):
        # reference (first 8 chars of alert id) → list of sockets
        self._connections: dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, reference: str, websocket: WebSocket):
        await websocket.accept()
        self._connections[reference].append(websocket)

    def disconnect(self, reference: str, websocket: WebSocket):
        conns = self._connections.get(reference, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self._connections.pop(reference, None)

    async def broadcast_status(self, alert_id: str, status: str, resolved_at=None):
        """
        Notify anyone watching the first 8 chars of this alert's id.
        """
        reference = alert_id[:8]
        payload = json.dumps(
            {
                "event": "STATUS_UPDATE",
                "data": {
                    "reference": reference,
                    "status": status,
                    "resolved_at": str(resolved_at) if resolved_at else None,
                },
            },
            default=str,
        )

        stale = []
        for ws in list(self._connections.get(reference, [])):
            try:
                await ws.send_text(payload)
            except Exception:
                stale.append(ws)

        for ws in stale:
            self.disconnect(reference, ws)


status_manager = StatusConnectionManager()