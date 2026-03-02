"""Utility to inspect the test user's profile from the command line.

This script is intended to be run from the `backend` directory using the
same virtualenv that runs the application.  It connects to the same SQLite
file and prints the current values stored for `test@example.com`.

Usage:
    cd backend
    python check_profile.py

After you update the profile via the frontend (or via the chatbot) you can
rerun this script to see the changes reflected immediately.
"""

from app.db.session import SessionLocal
from app.db.models import Student, EducationDetails


def show_profile(email: str = "test@example.com", show_hash: bool=False):
    db = SessionLocal()
    user = db.query(Student).filter(Student.email == email).first()
    if not user:
        print(f"no user found with email {email}")
        return

    print("=== personal ===")
    print(f"id          : {user.id}")
    print(f"full_name   : {user.full_name}")
    print(f"email       : {user.email}")
    print(f"phone       : {user.phone}")
    print(f"date_of_birth: {user.date_of_birth}")
    print(f"city        : {user.city}")
    print(f"password_hash: {user.password}")

    ed = db.query(EducationDetails).filter(EducationDetails.student_id == user.id).first()
    if ed:
        print("\n=== education ===")
        print(f"10th board      : {ed.tenth_board}")
        print(f"10th percentage : {ed.tenth_percentage}")
        print(f"12th board      : {ed.twelfth_board}")
        print(f"12th percentage : {ed.twelfth_percentage}")
    else:
        print("\n(no education details present)")

    db.close()


if __name__ == "__main__":
    show_profile()
