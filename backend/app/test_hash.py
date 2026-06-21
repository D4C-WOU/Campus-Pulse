# test_hash.py

from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

hashed = pwd_context.hash("admin@123")

print(hashed)

print(
    pwd_context.verify(
        "admin@123",
        hashed
    )
)