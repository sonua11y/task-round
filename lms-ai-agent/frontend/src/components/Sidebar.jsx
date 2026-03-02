import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/profile" },
    { name: "Courses", path: "/courses" },
    { name: "Chat", path: "/chat" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-primary mb-10">
        LMS AI
      </h1>

      <nav className="flex flex-col gap-3">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-softLavender text-primary font-semibold"
                  : "text-gray-600 hover:bg-softLavender"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}