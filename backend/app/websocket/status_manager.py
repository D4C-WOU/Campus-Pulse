"""
Per-alert WebSocket connections for the public status page.
Reporters subscribe using their incident_code (e.g. INC-000042) and
receive live status updates without polling.
"""

import json
from collections import defaultdict
from typing import List

from fastapi import WebSocket


class StatusConnectionManager:
    def __init__(self):
        # incident_code → list of sockets
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

    async def broadcast_status(
        self, incident_code: str, status: str, resolved_at=None
    ):
        """
        Notify anyone watching this incident_code (e.g. "INC-000042").
        """
        payload = json.dumps(
            {
                "event": "STATUS_UPDATE",
                "data": {
                    "reference": incident_code,
                    "status": status,
                    "resolved_at": str(resolved_at) if resolved_at else None,
                },
            },
            default=str,
        )

        stale = []
        for ws in list(self._connections.get(incident_code, [])):
            try:
                await ws.send_text(payload)
            except Exception:
                stale.append(ws)

        for ws in stale:
            self.disconnect(incident_code, ws)


status_manager = StatusConnectionManager()