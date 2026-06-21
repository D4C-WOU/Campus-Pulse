from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router

app = FastAPI(
    title="Campus Pulse API",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Campus Pulse Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }