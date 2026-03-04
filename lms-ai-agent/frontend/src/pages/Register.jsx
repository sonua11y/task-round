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
  const [formError, setFormError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[a-zA-Z0-9 ]{3,32}$/.test(form.name.trim())) {
      newErrors.name = "Name must be 3-32 characters, letters, numbers, and spaces only";
    }
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      newErrors.email = "Invalid email format";
    }
    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (form.password.length > 72) {
      newErrors.password = "Password cannot be longer than 72 characters";
    }
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
    setFormError("");
    if (!validate()) {
      setFormError("Please fix the errors below before registering.");
      return;
    }
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
        setFormError(errorMsg || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgMain">
      <div className="relative w-96 flex flex-col items-center">
        {/* REGISTER PANEL */}
        <div className="relative w-full shadow-2xl" style={{ minHeight: "600px" }}>
          {/* Decorative clipped background — pointer-events disabled so it never blocks clicks */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, #0f2a47 0%, #081c2f 100%)",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Actual content — no clip-path, so every element is fully clickable */}
          <div className="relative w-full text-white p-10 flex flex-col items-center" style={{ paddingBottom: "120px" }}>
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
          {formError && (
            <div className="w-full bg-red-600 text-white text-sm font-semibold px-4 py-3 rounded mb-2 text-center">
              {formError}
            </div>
          )}
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full bg-white text-black px-4 py-3 pr-12 rounded-sm outline-none"
                  maxLength={72}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <div className="text-red-400 text-sm mt-1">{errors.password}</div>}
            </div>
            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="w-full py-3 rounded-sm font-semibold text-white transition"
              style={{
                background: "linear-gradient(90deg, #1f78d1 0%, #2ca6e0 100%)",
                cursor: "pointer",
              }}
            >
              Register
            </button>
          </form>
          </div>
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