from pydantic import BaseModel
from typing import Optional, List

class EducationUpdate(BaseModel):
    tenth_board: Optional[str]
    tenth_percentage: Optional[float]
    twelfth_board: Optional[str]
    twelfth_percentage: Optional[float]


class PersonalUpdate(BaseModel):
    full_name: Optional[str]
    phone: Optional[str]
    date_of_birth: Optional[str]
    city: Optional[str]

class CourseEnroll(BaseModel):
    id: int