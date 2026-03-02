from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(Text, nullable=False)
    email = Column(Text, nullable=False, unique=True)
    password = Column(Text)
    phone = Column(Text)
    date_of_birth = Column(Date)
    city = Column(Text)
    created_at = Column(DateTime)

    education = relationship("EducationDetails", back_populates="student", uselist=False)
    applications = relationship("Application", back_populates="student")


class EducationDetails(Base):
    __tablename__ = "education_details"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True)
    tenth_board = Column(Text)
    tenth_percentage = Column(Float)
    twelfth_board = Column(Text)
    twelfth_percentage = Column(Float)

    student = relationship("Student", back_populates="education")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    duration_months = Column(Integer)
    fee = Column(Float)

    applications = relationship("Application", back_populates="course")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    status = Column(Text)
    applied_at = Column(DateTime)
    reviewed_at = Column(DateTime)

    student = relationship("Student", back_populates="applications")
    course = relationship("Course", back_populates="applications")