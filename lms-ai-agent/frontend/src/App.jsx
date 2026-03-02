import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundColor: "#f9fcff",
    backgroundImage: `
      linear-gradient(#eaf2ff 1px, transparent 1px),
      linear-gradient(90deg, #eaf2ff 1px, transparent 1px),
      linear-gradient(#dbeafe 1px, transparent 1px),
      linear-gradient(90deg, #dbeafe 1px, transparent 1px)
    `,
    backgroundSize: "20px 20px, 20px 20px, 60px 60px, 60px 60px",
    backgroundPosition: "-1px -1px",
  }}
>
      {/* CENTERED CONTENT WRAPPER */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "60px 20px",
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}