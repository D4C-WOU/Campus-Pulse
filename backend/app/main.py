from fastapi import FastAPI
import app.models
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.alerts import router as alerts_router
from app.api.routes.auth import router as auth_router
from app.api.routes.websocket import router as websocket_router
from app.api.routes.audit import router as audit_router
from app.api.routes.admins import router as admins_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.public import router as public_router
from app.api.routes.comments import router as comments_router


app = FastAPI(
    title="Campus Pulse API",
    version="2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(alerts_router)
app.include_router(audit_router)
app.include_router(websocket_router)
app.include_router(admins_router)
app.include_router(dashboard_router)
app.include_router(public_router)
app.include_router(comments_router)


@app.get("/")
def root():
    return {"message": "Campus Pulse Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
