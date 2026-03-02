import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth_routes, profile_routes, chatbot_routes
from app.db.session import engine
from app.db.models import Base
from dotenv import load_dotenv

load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    print("WARNING: OPENAI_API_KEY is not set. The chatbot agent will be inactive.")


def _seed():
    """Seed courses + demo user if they don't exist."""
    from app.db.session import SessionLocal
    from app.db.models import Student, Course
    from app.core.security import hash_password
    from datetime import datetime

    db = SessionLocal()
    try:
        courses = [
            {"title": "GenAI", "duration_months": 6, "fee": 1000},
            {"title": "Machine Learning", "duration_months": 6, "fee": 1200},
            {"title": "Full Stack", "duration_months": 6, "fee": 1100},
            {"title": "Cloud Computing", "duration_months": 6, "fee": 1300},
            {"title": "Flutter", "duration_months": 6, "fee": 900},
            {"title": "Cyber Security", "duration_months": 6, "fee": 1400},
        ]
        for c in courses:
            if not db.query(Course).filter(Course.title == c["title"]).first():
                db.add(Course(**c))

        if not db.query(Student).filter(Student.email == "test@example.com").first():
            db.add(Student(
                full_name="Test User",
                email="test@example.com",
                password=hash_password("password123"),
                created_at=datetime.utcnow(),
            ))
            print("Demo user created: test@example.com / password123")

        db.commit()
        print("Startup seed complete.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        _seed()
    except Exception as e:
        print(f"WARNING: startup init skipped ({e})")
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://task-round-x8c5.onrender.com",
        "https://task-round.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(profile_routes.router, prefix="/profile", tags=["Profile"])
app.include_router(chatbot_routes.router, prefix="/chat", tags=["Chatbot"])
print("Connected DB:", engine.url)
