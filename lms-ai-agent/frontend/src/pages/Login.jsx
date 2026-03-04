import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errors = {};
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))
      errors.email = "Invalid email format";
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (password.length > 72) {
      errors.password = "Password cannot be longer than 72 characters";
    }
    setFieldError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      if (!response.data.student_id) {
        const studentId = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        localStorage.setItem("student_id", studentId);
      } else {
        localStorage.setItem("student_id", response.data.student_id);
      }

      navigate("/profile");
    } catch (error) {
      // Show backend error message if available
      const backendMsg = error?.response?.data?.detail || error?.message || "Invalid credentials";
      setError(backendMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgMain">
      <div className="relative w-96 flex flex-col items-center">

        {/* LOGIN PANEL */}
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
          <div className="relative w-full text-white p-10 flex flex-col items-center" style={{ paddingBottom: "100px" }}>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login
          </h2>

          <form
            onSubmit={handleLogin}
            className="space-y-5 w-full"
          >
            {/* USERNAME */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                htmlFor="email"
              >
                Username
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className={`w-full bg-white text-black px-4 py-3 rounded-sm outline-none ${
                  fieldError.email
                    ? "ring-2 ring-red-500"
                    : ""
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldError({
                    ...fieldError,
                    email: undefined,
                  });
                  setError("");
                }}
                required
              />
              {fieldError.email && (
                <div className="text-red-400 text-sm mt-1">
                  {fieldError.email}
                </div>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={`w-full bg-white text-black px-4 py-3 pr-12 rounded-sm outline-none ${
                    fieldError.password
                      ? "ring-2 ring-red-500"
                      : ""
                  }`}
                  maxLength={72}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldError({
                      ...fieldError,
                      password: undefined,
                    });
                    setError("");
                  }}
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
              {fieldError.password && (
                <div className="text-red-400 text-sm mt-1">
                  {fieldError.password}
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full py-3 rounded-sm font-semibold text-white transition"
              style={{
                background:
                  "linear-gradient(90deg, #1f78d1 0%, #2ca6e0 100%)",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </form>

          <div className="mt-5 text-center text-sm w-full">
            Didn't register yet?{" "}
            <a
              href="/register"
              className="text-[#ffffff] underline hover:text-[#fca311]"
            >
              Register
            </a>
          </div>
          </div>
        </div>

        {/* REGISTER LINK
        <div className="mt-5 text-center text-sm w-full">
          Didn't register yet?{" "}
          <a
            href="/register"
            className="text-[#14213d] underline hover:text-[#fca311]"
          >
            Register
          </a>
        </div> */}
      </div>
    </div>
  );
}