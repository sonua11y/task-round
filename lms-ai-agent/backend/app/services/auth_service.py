from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db.models import Student
from app.core.security import hash_password, verify_password, create_token

def register_user(db: Session, full_name: str, email: str, password: str):
    existing = db.query(Student).filter(Student.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = Student(
        full_name=full_name,
        email=email,
        password=hash_password(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def login_user(db: Session, email: str, password: str):
    user = db.query(Student).filter(Student.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_token({"sub": user.email})
    return token