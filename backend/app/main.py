import app.models
from app.api.routes.admins import router as admins_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.audit import router as audit_router
from app.api.routes.auth import router as auth_router
from app.api.routes.comments import router as comments_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.public import router as public_router
from app.api.routes.websocket import router as websocket_router
from app.db.base import Base
from app.db.database import engine
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Campus Pulse API", version="2.0")

app.state.limiter = limiter

# 1. Add CORS Middleware FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://campus-pulse-azure.vercel.app",
    ],
    allow_origin_regex=r"https://campus-pulse-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SlowAPIMiddleware)

# 2. Custom Exception Handlers to preserve CORS on errors
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    response = _rate_limit_exceeded_handler(request, exc)
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"🔥 BACKEND ERROR: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")},
    )

# Routers
app.include_router(auth_router)
app.include_router(alerts_router)
app.include_router(audit_router)
app.include_router(websocket_router)
app.include_router(admins_router)
app.include_router(dashboard_router)
app.include_router(public_router)
app.include_router(comments_router)
app.include_router(notifications_router)

@app.get("/")
def root():
    return {"message": "Campus Pulse Running"}

@app.get("/health")
def health():
    return {"status": "healthy"}