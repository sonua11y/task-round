from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Student

SECRET_KEY = "supersecret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str):
    # Silently truncate to 72 bytes for bcrypt, never raise error
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return pwd_context.hash(password_bytes.decode("utf-8", errors="ignore"))

def verify_password(plain, hashed):
    # Silently truncate to 72 bytes for bcrypt, never raise error
    plain_bytes = plain.encode("utf-8")
    if len(plain_bytes) > 72:
        plain_bytes = plain_bytes[:72]
    return pwd_context.verify(plain_bytes.decode("utf-8", errors="ignore"), hashed)

def create_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(Student).filter(Student.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user