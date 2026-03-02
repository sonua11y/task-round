from app.db.session import SessionLocal
from app.db.models import Course

def seed_courses():
    db = SessionLocal()
    courses = [
        {"title": "GenAI", "duration_months": 6, "fee": 1000},
        {"title": "Machine Learning", "duration_months": 6, "fee": 1200},
        {"title": "Full Stack", "duration_months": 6, "fee": 1100},
        {"title": "Cloud Computing", "duration_months": 6, "fee": 1300},
        {"title": "Flutter", "duration_months": 6, "fee": 900},
        {"title": "Cyber Security", "duration_months": 6, "fee": 1400},
    ]
    for course in courses:
        exists = db.query(Course).filter(Course.title == course["title"]).first()
        if not exists:
            db.add(Course(**course))
    db.commit()
    db.close()
    print("Courses seeded!")

if __name__ == "__main__":
    seed_courses()
