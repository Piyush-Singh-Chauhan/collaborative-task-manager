import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [notification, setNotification] = useState<{message: string, type: string} | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleTaskAssigned = (data: any) => {
      setNotification({
        message: data.message,
        type: "info"
      });
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    const handleTaskUpdated = (data: any) => {
      setNotification({
        message: data.message,
        type: "info"
      });
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    const handleTaskDeleted = (data: any) => {
      setNotification({
        message: data.message,
        type: "warning"
      });
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    const handleCustomNotification = (data: any) => {
      setNotification({
        message: data.message,
        type: "success"
      });
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    // Listen for task events
    socket.on("Task:assigned", handleTaskAssigned);
    socket.on("Task:updated", handleTaskUpdated);
    socket.on("Task:deleted", handleTaskDeleted);
    socket.on("notification", handleCustomNotification);

    // Cleanup listeners on unmount
    return () => {
      socket.off("Task:assigned", handleTaskAssigned);
      socket.off("Task:updated", handleTaskUpdated);
      socket.off("Task:deleted", handleTaskDeleted);
      socket.off("notification", handleCustomNotification);
    };
  }, [socket]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">TaskFlow</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900"
              >
                Dashboard
              </Link>
              <Link 
                to="/tasks" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Tasks
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {notification && (
              <div className={`mr-4 px-4 py-2 rounded-md text-sm font-medium ${
                notification.type === "success" ? "bg-green-100 text-green-800" :
                notification.type === "warning" ? "bg-yellow-100 text-yellow-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {notification.message}
              </div>
            )}
            
            <div className="ml-3 relative">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  <span className="sr-only">User menu</span>
                  <span>{user?.name || "User"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;