from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services.auth_service import register_user, login_user
from app.core.security import get_db

router = APIRouter()

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    print(f"Register request: {data}")
    try:
        register_user(db, data.name, data.email, data.password)
        return {"message": "User registered successfully"}
    except HTTPException as e:
        # Bubble up clean HTTP errors from the service layer
        print(f"Register error (HTTPException): {e.detail}")
        raise e
    except Exception as e:
        # Avoid leaking internal errors directly to the client
        print(f"Register error (unexpected): {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Registration failed due to a server error. Please try again.",
        )

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        print(f"Login route called with email: {data.email} and password: {data.password}")
        token = login_user(db, data.email, data.password)
        print(f"Login successful for {data.email}, token: {token}")
        return {"access_token": token}
    except Exception as e:
        print(f"Login error for {data.email}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))