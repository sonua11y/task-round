import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

# Default: current dir (works on Render).
# For local dev inside OneDrive, set DATABASE_URL in backend/.env
# to a path outside OneDrive, e.g. sqlite:///C:/Temp/kalviumlabs_forge.sqlite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kalviumlabs_forge.sqlite")

# NullPool: every connection is opened and closed for real on each use.
# This prevents SQLite "database is locked" from pooled connections lingering
# across uvicorn --reload restarts.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=NullPool,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
