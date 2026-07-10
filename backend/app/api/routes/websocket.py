from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.connection_manager import manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/alerts")
async def alerts_socket(websocket: WebSocket):
    """
    Live feed for the admin dashboard.

    Clients just listen -- all writes still go through the REST endpoints,
    which validate, persist, and then broadcast. This socket never
    receives incoming alert data, only pushes it out.
    """
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from the client. Reading (and
            # discarding) keeps the connection alive and lets us detect
            # disconnects promptly.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
