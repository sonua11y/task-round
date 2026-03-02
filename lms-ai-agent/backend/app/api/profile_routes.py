from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from app.core.security import get_current_user, get_db
from app.services.profile_service import (
    get_full_profile, update_personal, update_education, update_courses
)
from app.schemas.profile import EducationUpdate, PersonalUpdate

router = APIRouter()

@router.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    from app.db.models import Course
    courses = db.query(Course).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "duration_months": c.duration_months,
            "fee": c.fee
        } for c in courses
    ]
from fastapi import HTTPException
from app.schemas.profile import CourseEnroll
from typing import List

@router.put("/courses")
async def edit_courses(
    courses: List[CourseEnroll],
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        print("Received courses:", courses)
        course_dicts = [course.dict() for course in courses]
        updated = update_courses(db, user, course_dicts)
        return jsonable_encoder(updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_profile(db: Session = Depends(get_db),
                user = Depends(get_current_user)):
    profile = get_full_profile(db, user)
    return jsonable_encoder(profile)

@router.put("/")
def edit_profile(data: dict,
                 db: Session = Depends(get_db),
                 user = Depends(get_current_user)):
    result = {}
    personal_keys = set(PersonalUpdate.__fields__.keys())
    personal_data = {k: v for k, v in data.items() if k in personal_keys}
    if personal_data:
        result["personal"] = jsonable_encoder(update_personal(db, user, PersonalUpdate(**personal_data)))

    education_keys = set(EducationUpdate.__fields__.keys())
    education_data = {k: v for k, v in data.items() if k in education_keys}
    if education_data:
        result["education"] = jsonable_encoder(update_education(db, user, EducationUpdate(**education_data)))

    return result

@router.put("/personal")
def edit_personal(data: PersonalUpdate,
                  db: Session = Depends(get_db),
                  user = Depends(get_current_user)):
    updated = update_personal(db, user, data)
    return jsonable_encoder(updated)

@router.put("/education")
def edit_education(data: EducationUpdate,
                   db: Session = Depends(get_db),
                   user = Depends(get_current_user)):
    updated = update_education(db, user, data)
    return jsonable_encoder(updated)