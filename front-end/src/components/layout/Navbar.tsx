import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTaskAssigned = (data: any) => {
      setNotificationCount(prev => prev + 1);
    };

    const handleTaskUpdated = (data: any) => {
      setNotificationCount(prev => prev + 1);
    };

    const handleTaskDeleted = (data: any) => {
      setNotificationCount(prev => prev + 1);
    };

    const handleCustomNotification = (data: any) => {
      setNotificationCount(prev => prev + 1);
    };

    socket.on("Task:assigned", handleTaskAssigned);
    socket.on("Task:updated", handleTaskUpdated);
    socket.on("Task:deleted", handleTaskDeleted);
    socket.on("notification", handleCustomNotification);

    return () => {
      socket.off("Task:assigned", handleTaskAssigned);
      socket.off("Task:updated", handleTaskUpdated);
      socket.off("Task:deleted", handleTaskDeleted);
      socket.off("notification", handleCustomNotification);
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
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              {notificationCount > 0 && (
                <span 
                  className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
                  aria-label={`${notificationCount} unread notifications`}
                >
                  {notificationCount}
                </span>
              )}
            </button>
            
            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                    <button 
                      onClick={() => setNotificationCount(0)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
                <div className="p-4 text-center text-gray-500 text-sm">
                  {notificationCount > 0 ? (
                    <p>You have {notificationCount} unread notifications</p>
                  ) : (
                    <p>No new notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
