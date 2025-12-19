import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleTaskAssigned = (data: any) => {
      setNotificationCount(prev => prev + 1);
      // Reset count after 10 seconds
      setTimeout(() => {
        setNotificationCount(prev => Math.max(0, prev - 1));
      }, 10000);
    };

    const handleTaskUpdated = (data: any) => {
      setNotificationCount(prev => prev + 1);
      // Reset count after 10 seconds
      setTimeout(() => {
        setNotificationCount(prev => Math.max(0, prev - 1));
      }, 10000);
    };

    socket.on("Task:assigned", handleTaskAssigned);
    socket.on("Task:updated", handleTaskUpdated);

    return () => {
      socket.off("Task:assigned", handleTaskAssigned);
      socket.off("Task:updated", handleTaskUpdated);
    };
  }, [socket]);

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="md:hidden mr-4">
            {/* Mobile menu button would go here */}
          </div>
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">
            TaskFlow
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            <button
              onClick={logout}
              className="hidden md:flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
