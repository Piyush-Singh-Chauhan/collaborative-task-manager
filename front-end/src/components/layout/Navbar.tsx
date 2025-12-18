import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-blue-600">
        Collaborative Task Manager
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          {user?.name}
        </span>

        <button
          onClick={logout}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
