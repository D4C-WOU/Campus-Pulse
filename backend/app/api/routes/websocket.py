import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import manager
from app.websocket.status_manager import status_manager

router = APIRouter(tags=["WebSocket"])

PING_INTERVAL = 25  # seconds — under Render's ~55s idle timeout


async def keepalive(websocket: WebSocket, stop_event: asyncio.Event):
    """Send a ping frame every PING_INTERVAL seconds to prevent proxy timeout."""
    try:
        while not stop_event.is_set():
            await asyncio.sleep(PING_INTERVAL)
            if stop_event.is_set():
                break
            try:
                await websocket.send_text('{"event":"ping"}')
            except Exception:
                break
    except asyncio.CancelledError:
        pass


@router.websocket("/ws/alerts")
async def alerts_socket(websocket: WebSocket):
    """Live feed for the admin dashboard."""
    await manager.connect(websocket)
    stop_event = asyncio.Event()
    ping_task = asyncio.create_task(keepalive(websocket, stop_event))
    try:
        while True:
            # receive_text blocks; client can send "pong" or anything
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        stop_event.set()
        ping_task.cancel()
        manager.disconnect(websocket)


@router.websocket("/ws/status/{reference}")
async def status_socket(reference: str, websocket: WebSocket):
    """Public status tracking socket for a single report."""
    await status_manager.connect(reference, websocket)
    stop_event = asyncio.Event()
    ping_task = asyncio.create_task(keepalive(websocket, stop_event))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        stop_event.set()
        ping_task.cancel()
        status_manager.disconnect(reference, websocket)