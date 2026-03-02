from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db.models import Student
from app.core.security import hash_password, verify_password, create_token


def _safe_password(password: str) -> str:
    """
    Ensure password never exceeds bcrypt's 72‑byte limit before hashing,
    even if the underlying hashing helper isn't defensive in a given deploy.
    """
    if not isinstance(password, str):
        password = str(password)
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        return password_bytes.decode("utf-8", errors="ignore")
    return password


def register_user(db: Session, full_name: str, email: str, password: str):
    # Normalize email so registration and login behave consistently
    normalized_email = email.strip().lower()

    existing = db.query(Student).filter(Student.email == normalized_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    safe_password = _safe_password(password)

    try:
        hashed = hash_password(safe_password)
    except Exception:
        # If anything goes wrong at the hashing layer, fail with a clean message
        raise HTTPException(
            status_code=400,
            detail="Password is not valid. Please use a shorter password (max ~70 characters).",
        )

    user = Student(
        full_name=full_name,
        email=normalized_email,
        password=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def login_user(db: Session, email: str, password: str):
    # Normalize email in the same way as registration
    normalized_email = email.strip().lower()

    user = db.query(Student).filter(Student.email == normalized_email).first()
    if not user:
        print(f"Login failed: user not found for email {email}")
        raise HTTPException(status_code=400, detail="Invalid credentials")
    print(f"Login attempt for {email}")
    print(f"Provided password: {password}")
    print(f"Stored hash: {user.password}")
    try:
        verified = verify_password(password, user.password)
        print(f"Password verified: {verified}")
    except Exception as e:
        print(f"Password verification error: {e}")
        verified = False
    if not verified:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_token({"sub": user.email})
    return token