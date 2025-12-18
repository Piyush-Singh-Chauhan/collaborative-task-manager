import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClass =
    "block px-4 py-2 rounded text-sm hover:bg-blue-100";

  return (
    <aside className="w-60 bg-white border-r min-h-screen p-4">
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClass} ${
              isActive ? "bg-blue-500 text-white" : "text-gray-700"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `${linkClass} ${
              isActive ? "bg-blue-500 text-white" : "text-gray-700"
            }`
          }
        >
          Tasks
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
