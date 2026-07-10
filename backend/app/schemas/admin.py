from pydantic import BaseModel, EmailStr
from typing import Optional


class AdminCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "admin"  # "admin" or "dispatcher" -- super_admin created manually only


class AdminResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True