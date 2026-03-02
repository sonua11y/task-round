from sqlalchemy.orm import Session
from app.db.models import Student, EducationDetails, Application, Course
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


def update_courses(db: Session, user: Student, courses):
    print("update_courses received:", courses)
    try:
        # Delete inside the same transaction so a later error can be rolled back
        db.query(Application).filter(Application.student_id == user.id).delete()
        for course in courses:
            course_id = course.get('id')
            print("Processing course_id:", course_id)
            if course_id:
                course_obj = db.query(Course).filter(Course.id == course_id).first()
                if not course_obj:
                    print(f"Course with id {course_id} does not exist!")
                    db.rollback()
                    raise Exception(f"Course with id {course_id} does not exist!")
                app = Application(student_id=user.id, course_id=course_id, status="submitted")
                db.add(app)
        db.commit()
        return db.query(Application).filter(Application.student_id == user.id).all()
    except Exception as e:
        print("Exception in update_courses:", e)
        raise


def get_full_profile(db: Session, user: Student):
    education = db.query(EducationDetails).filter(
        EducationDetails.student_id == user.id
    ).first()

    applications = db.query(Application).filter(
        Application.student_id == user.id
    ).all()

    enrolled_courses = []
    for app in applications:
        course = db.query(Course).filter(Course.id == app.course_id).first()
        enrolled_courses.append({
            "title": course.title,
            "duration_months": course.duration_months,
            "fee": course.fee,
            "status": app.status
        })

    return {
        "personal": user,
        "education": education,
        "courses": enrolled_courses
    }


def update_personal(db: Session, user: Student, data):
    from datetime import datetime, date
    changed = {}
    for key, value in data.dict(exclude_unset=True).items():
        if key == "date_of_birth" and isinstance(value, str):
            try:
                value = datetime.strptime(value, "%Y-%m-%d").date()
            except Exception:
                pass
        setattr(user, key, value)
        changed[key] = value

    db.commit()
    db.refresh(user)
    logger.debug("updated personal fields for user %s: %s", user.email, changed)
    return user

def update_education(db: Session, user: Student, data):
    education = db.query(EducationDetails).filter(
        EducationDetails.student_id == user.id
    ).first()

    if not education:
        education = EducationDetails(student_id=user.id)
        db.add(education)

    changed = {}
    for key, value in data.dict(exclude_unset=True).items():
        setattr(education, key, value)
        changed[key] = value

    db.commit()
    db.refresh(education)
    logger.debug("updated education for user %s: %s", user.email, changed)
    return education