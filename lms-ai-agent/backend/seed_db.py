"""Seed database with test user"""
from app.db.session import SessionLocal, engine
from app.db.models import Base, Student
from app.core.security import hash_password
from datetime import datetime

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if test user exists
existing = db.query(Student).filter(Student.email == "test@example.com").first()
if existing:
    print("Test user already exists")
else:
    # Create test user
    test_user = Student(
        full_name="Test User",
        email="test@example.com",
        password=hash_password("password123"),
        created_at=datetime.utcnow()
    )
    db.add(test_user)
    db.commit()
    print("Test user created: test@example.com / password123")

db.close()
