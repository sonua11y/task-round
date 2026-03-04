import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../App.css";

export default function ProfileForm({ profile, refresh }) {
  const navigate = useNavigate();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [editSection, setEditSection] = useState("");
  // Always initialize from profile, and never lose details on edit
  const [personal, setPersonal] = useState(() => ({
    full_name: profile?.full_name || profile?.personal?.full_name || "User",
    student_id: profile?.student_id || profile?.personal?.student_id || "",
    roll_number: profile?.roll_number || profile?.personal?.roll_number || "",
    email: profile?.email || profile?.personal?.email || "",
    date_of_birth: profile?.date_of_birth || profile?.personal?.date_of_birth || "",
    phone: profile?.phone || profile?.personal?.phone || "",
    city: profile?.city || profile?.personal?.city || ""
  }));
  // Always preserve details on profile change
  React.useEffect(() => {
    setPersonal((prev) => ({
      ...prev,
      full_name: profile?.full_name || profile?.personal?.full_name || prev.full_name || "User",
      student_id: profile?.student_id || profile?.personal?.student_id || prev.student_id || "",
      roll_number: profile?.roll_number || profile?.personal?.roll_number || prev.roll_number || "",
      email: profile?.email || profile?.personal?.email || prev.email || "",
      date_of_birth: profile?.date_of_birth || profile?.personal?.date_of_birth || prev.date_of_birth || "",
      phone: profile?.phone || profile?.personal?.phone || prev.phone || "",
      city: profile?.city || profile?.personal?.city || prev.city || ""
    }));
  }, [profile]);
  const [education, setEducation] = useState(() => ({
    tenth_board: profile?.education?.tenth_board || profile?.tenth_board || "",
    tenth_percentage: profile?.education?.tenth_percentage || profile?.tenth_percentage || "",
    twelfth_board: profile?.education?.twelfth_board || profile?.twelfth_board || "",
    twelfth_percentage: profile?.education?.twelfth_percentage || profile?.twelfth_percentage || ""
  }));
  React.useEffect(() => {
    setEducation((prev) => ({
      ...prev,
      tenth_board: profile?.education?.tenth_board || profile?.tenth_board || prev.tenth_board || "",
      tenth_percentage: profile?.education?.tenth_percentage || profile?.tenth_percentage || prev.tenth_percentage || "",
      twelfth_board: profile?.education?.twelfth_board || profile?.twelfth_board || prev.twelfth_board || "",
      twelfth_percentage: profile?.education?.twelfth_percentage || profile?.twelfth_percentage || prev.twelfth_percentage || ""
    }));
  }, [profile]);
  const [courses, setCourses] = useState(profile ? profile.courses : []);
  const [loading, setLoading] = useState(false);

  // Fetch available courses from backend
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await api.get("/profile/courses");
        setAvailableCourses(res.data);
      } catch (err) {
        setAvailableCourses([]);
      }
    }
    fetchCourses();
  }, []);
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Handlers for editing
  const handlePersonalChange = (e) => {
    setPersonal((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEducationChange = (e) => {
    setEducation({ ...education, [e.target.name]: e.target.value });
  };
  const handleCourseChange = (idx, field, value) => {
    const updated = [...courses];
    updated[idx][field] = value;
    setCourses(updated);
  };

  // Save handlers
  // Restore backend save handler
  const handleSave = async (section) => {
    setLoading(true);
    try {
      if (section === "personal") {
        await api.put("/profile/personal", personal);
      } else if (section === "education") {
        // Convert empty string to null for percentage fields
        const payload = {
          ...education,
          tenth_percentage: education.tenth_percentage === "" ? null : Number(education.tenth_percentage),
          twelfth_percentage: education.twelfth_percentage === "" ? null : Number(education.twelfth_percentage),
        };
        await api.put("/profile/education", payload);
      } else if (section === "courses") {
        await api.put("/profile/courses", courses);
      }
      setEditSection("");
      // Always reload latest profile from backend after save
      if (typeof refresh === "function") {
        setTimeout(() => refresh(), 100);
      }
    } catch (err) {
      alert("Failed to update " + section + " details");
    }
    setLoading(false);
  };

  // Get student ID from localStorage if not present in profile
  const studentId = personal.student_id || localStorage.getItem("student_id") || "(not set)";
    // ...existing code...
  useEffect(() => {
    // If student_id is not set, generate and save it
    if (!profile?.student_id && !localStorage.getItem("student_id")) {
      const newId = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem("student_id", newId);
      // Optionally, send to backend if needed
      // await api.put("/profile/personal", { ...personal, student_id: newId });
      setPersonal((prev) => ({ ...prev, student_id: newId }));
    }
  }, [profile]);

  if (!profile) return null;

  return (
    <>
      {/* Page header row - absolute corners */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 z-10">
        <span style={{ fontFamily: '"Pacifico", cursive', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#1f2937' }}>
          <span style={{ fontSize: '2rem' }}>👩🏻‍🎓</span> Kampus
        </span>
        <button className="border rounded px-5 py-2 font-medium flex items-center gap-2" style={{cursor:'pointer'}} onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>
      {/* Profile header row (no faded container) */}
      <div className="w-175 mx-auto pt-20 pb-2">
        <h2 className="font-bold text-2xl mb-6 text-left">My Profile</h2>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-200 mx-0">
            {getInitials(personal.full_name)}
          </div>
          <div className="flex flex-col justify-center ml-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl text-gray-700">Hi,</span>
              <span className="text-3xl font-bold text-black">{personal.full_name || "User"}</span>
            </div>
            <div className="mt-2 text-gray-500 text-sm">Student ID: {studentId}</div>
          </div>
        </div>
      </div>
      {/* Center the three sections, no outer faded container */}
      <div className="flex flex-col items-center w-full">
        <div className="w-175 mb-5 flex flex-col gap-2 items-start bg-white rounded-lg shadow p-6">
          {/* Personal Details Section */}
          <div className="flex justify-between items-center w-full mb-2">
            <span className="font-semibold text-lg">Personal Details</span>
            <button className="ml-2 align-middle" title="Edit Personal" style={{cursor:'pointer'}} onClick={() => setEditSection("personal")}> <img src="https://img.icons8.com/material-rounded/20/000000/edit--v1.png" alt="edit" /> </button>
          </div>
          {editSection === "personal" ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
              <div className="flex items-center gap-2"><img src="https://img.icons8.com/ios/24/40C4FF/new-post.png" alt="email" /><input type="email" name="email" value={personal.email || ""} disabled className="border border-blue-200 rounded px-2 py-1 w-full bg-gray-100 text-gray-500" /></div>
              <div className="flex items-center gap-2"><img src="https://img.icons8.com/ios/24/40C4FF/calendar--v1.png" alt="dob" /><input type="date" name="date_of_birth" value={personal.date_of_birth || ""} onChange={handlePersonalChange} className="border border-blue-200 rounded px-2 py-1 w-full bg-white" /></div>
              <div className="flex items-center gap-2"><img src="https://img.icons8.com/ios/24/40C4FF/phone.png" alt="phone" /><input type="text" name="phone" value={personal.phone || ""} onChange={handlePersonalChange} className="border border-blue-200 rounded px-2 py-1 w-full bg-white" /></div>
              <div className="flex items-center gap-2"><img src="https://img.icons8.com/ios/24/40C4FF/marker.png" alt="city" /><input type="text" name="city" value={personal.city || ""} onChange={handlePersonalChange} className="border border-blue-200 rounded px-2 py-1 w-full bg-white" /></div>
            </div>
            ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full text-gray-700">
              <div className="flex items-center gap-2"><img src="https://img.icons8.com/ios/24/40C4FF/new-post.png" alt="email" /> {personal.email || "(not set)"}</div>
              <div className="flex items-center gap-2"><img src="https://img.icons8.com/ios/24/40C4FF/calendar--v1.png" alt="dob" /> {formatDate(personal.date_of_birth)}</div>
              <div className="flex items-center gap-2"><img src="https://img.icons8.com/ios/24/40C4FF/phone.png" alt="phone" /> {personal.phone || "Contact number"}</div>
              <div className="flex items-center gap-2"><img src="https://img.icons8.com/ios/24/40C4FF/marker.png" alt="city" /> {personal.city || "City"}</div>
            </div>
          )}
          {editSection === "personal" && (
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleSave("personal")} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
              <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditSection("")}>Cancel</button>
            </div>
          )}
        </div>
        <div className="w-175 mb-5 flex flex-col gap-2 items-start bg-white rounded-lg shadow p-6">
          {/* Education Details Section */}
          <div className="flex justify-between items-center w-full mb-2">
            <span className="font-semibold text-lg">Education Details</span>
            <button className="ml-2 align-middle" title="Edit Education" style={{cursor:'pointer'}} onClick={() => setEditSection("education")}> <img src="https://img.icons8.com/material-rounded/20/000000/edit--v1.png" alt="edit" /> </button>
          </div>
          {editSection === "education" ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="bg-gray-100 rounded-lg px-4 py-3 flex justify-between items-center w-full">
                <span>10th Board: <input type="text" name="tenth_board" value={education.tenth_board || ""} onChange={handleEducationChange} className="border rounded px-2 py-1 font-semibold w-32" /></span>
                <input type="number" name="tenth_percentage" value={education.tenth_percentage || ""} onChange={handleEducationChange} className="border rounded px-2 py-1 font-semibold text-blue-600 w-20" placeholder="%" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3 flex justify-between items-center w-full">
                <span>12th Board: <input type="text" name="twelfth_board" value={education.twelfth_board || ""} onChange={handleEducationChange} className="border rounded px-2 py-1 font-semibold w-32" /></span>
                <input type="number" name="twelfth_percentage" value={education.twelfth_percentage || ""} onChange={handleEducationChange} className="border rounded px-2 py-1 font-semibold text-blue-600 w-20" placeholder="%" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <div className="bg-gray-100 rounded-lg px-4 py-3 flex justify-between items-center w-full">
                <span>10th Board: <span className="font-semibold">{education.tenth_board || "Board"}</span></span>
                <span className="font-semibold text-blue-600">{education.tenth_percentage ? `${education.tenth_percentage}%` : "Percentage"}</span>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3 flex justify-between items-center w-full">
                <span>12th Board: <span className="font-semibold">{education.twelfth_board || "Board"}</span></span>
                <span className="font-semibold text-blue-600">{education.twelfth_percentage ? `${education.twelfth_percentage}%` : "Percentage"}</span>
              </div>
            </div>
          )}
          {editSection === "education" && (
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleSave("education")} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
              <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditSection("")}>Cancel</button>
            </div>
          )}
        </div>
        <div className="w-175 mb-8 flex flex-col gap-2 items-start bg-white rounded-lg shadow p-6">
          {/* Enrolled Courses Section */}
          <div className="flex justify-between items-center mb-2 w-full">
            <span className="font-semibold text-lg">Enrolled Courses</span>
            <button className="text-blue-600 font-medium flex items-center gap-1" style={{cursor:'pointer'}} onClick={() => setEditSection("courses")}> <span>+</span> Add Course</button>
          </div>
          {editSection === "courses" ? (
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="course-select" className="mb-2">Select a course to enroll:</label>
              <select id="course-select" className="border rounded px-2 py-1 w-full" value={courses[0]?.id || ""} onChange={e => {
                const selectedId = Number(e.target.value);
                if (selectedId) {
                  const selectedCourse = availableCourses.find(c => c.id === selectedId);
                  if (selectedCourse) setCourses([selectedCourse]);
                } else {
                  setCourses([]);
                }
              }}>
                <option value="">-- Select a course --</option>
                {availableCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleSave("courses")} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
                <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setEditSection("")}>Cancel</button>
              </div>
            </div>
          ) : (
            courses.length > 0 ? courses.map((course, idx) => (
              <div key={idx} className="bg-gray-100 rounded-lg px-4 py-3 flex justify-between items-center w-full mb-2">
                <span className="font-semibold text-blue-700 flex items-center gap-2"><img src="https://img.icons8.com/color/20/000000/artificial-intelligence.png" alt="course" /> {course.title} <span className="text-gray-500">· {course.duration_months} months</span></span>
                <span className="font-semibold">₹{course.fee}/month</span>
              </div>
            )) : <div className="text-gray-500">No courses enrolled.</div>
          )}
        </div>
      </div>
    </>
  );
}

// Format date of birth as dd-mm-yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "(not set)";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
