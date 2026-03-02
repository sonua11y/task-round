import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[a-zA-Z0-9 ]{3,32}$/.test(form.name.trim())) {
      newErrors.name = "Name must be 3-32 characters, letters, numbers, and spaces only";
    }
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) newErrors.email = "Invalid email format";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: undefined });
    if (e.target.name === "email") setEmailExists(false);
    if (e.target.name === "name") setNameExists(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      // Truncate password to 72 characters
      const formData = { ...form, password: form.password.slice(0, 72) };
      await registerUser(formData);
      navigate("/login");
    } catch (error) {
      const errorMsg = error?.detail || error?.message || error?.toString();
      if ((errorMsg && errorMsg.toLowerCase().includes("already registered")) || (errorMsg && errorMsg.toLowerCase().includes("already exists"))) {
        if (errorMsg.toLowerCase().includes("name")) setNameExists(true);
        if (errorMsg.toLowerCase().includes("mail") || errorMsg.toLowerCase().includes("email")) setEmailExists(true);
      } else {
        alert("Registration failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgMain">
      <div className="relative w-96 flex flex-col items-center">
        {/* REGISTER PANEL */}
        <div
          className="w-full text-white p-10 flex flex-col items-center shadow-2xl"
          style={{
            background: "linear-gradient(180deg, #0f2a47 0%, #081c2f 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)",
            minHeight: "600px"
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Full Name"
                className={`w-full bg-white text-black px-4 py-3 rounded-sm outline-none ${nameExists ? "ring-2 ring-red-500" : ""}`}
                value={form.name}
                onChange={handleChange}
                required
              />
              {nameExists
                ? <div className="text-red-400 text-sm mt-1">Username is already taken</div>
                : errors.name && <div className="text-red-400 text-sm mt-1">{errors.name}</div>
              }
            </div>
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                className={`w-full bg-white text-black px-4 py-3 rounded-sm outline-none ${emailExists ? "ring-2 ring-red-500" : ""}`}
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="text-red-400 text-sm mt-1">{errors.email}</div>}
              {emailExists && <div className="text-red-400 text-sm mt-1">This mail id already exists</div>}
            </div>
            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                className="w-full bg-white text-black px-4 py-3 rounded-sm outline-none"
                value={form.password}
                onChange={handleChange}
                required
              />
              {errors.password && <div className="text-red-400 text-sm mt-1">{errors.password}</div>}
            </div>
            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="w-full py-3 rounded-sm font-semibold text-white transition"
              style={{
                background: "linear-gradient(90deg, #1f78d1 0%, #2ca6e0 100%)",
              }}
            >
              Register
            </button>
          </form>
        </div>
        {/* LOGIN LINK */}
        <div className="mt-5 text-center text-sm w-full">
          Already registered?{' '}
          <a href="/login" className="text-[#14213d] underline hover:text-[#fca311]">Login</a>
        </div>
      </div>
    </div>
  );
}