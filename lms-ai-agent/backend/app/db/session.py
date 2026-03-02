import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use DATABASE_URL env var when available (e.g. PostgreSQL on Render).
# Falls back to a local SQLite file for development.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kalviumlabs_forge.sqlite")

# Render injects postgres:// URLs; SQLAlchemy 1.4+ requires postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# check_same_thread is a SQLite-only argument
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=_connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()