from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.connection_manager import manager
from app.websocket.status_manager import status_manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/alerts")
async def alerts_socket(websocket: WebSocket):
    """Live feed for the admin dashboard."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


@router.websocket("/ws/status/{reference}")
async def status_socket(reference: str, websocket: WebSocket):
    """
    Public status tracking socket for a single report.
    The reporter opens this after submitting and receives status change
    events without polling.
    """
    await status_manager.connect(reference, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        status_manager.disconnect(reference, websocket)
    except Exception:
        status_manager.disconnect(reference, websocket)