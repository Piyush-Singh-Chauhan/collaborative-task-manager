import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error";
  read?: boolean;
}

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFfHp8fHx9fX1+fn5/f3+AgICBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=");
      audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
      console.log("Audio play failed:", e);
    }
  }, []);

  // Function to add a new notification
  const addNotification = useCallback((message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date(),
      type,
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Play notification sound
    playNotificationSound();
    
    // Auto-remove notification after 15 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 15000);
  }, [playNotificationSound]);

  useEffect(() => {
    if (!socket) return;

    const handleTaskAssigned = (data: any) => {
      const message = data.message || "You have been assigned a new task!";
      addNotification(message, "info");
    };

    const handleTaskUpdated = (data: any) => {
      const message = data.message || `Task updated: ${data.task?.title}`;
      addNotification(message, "info");
    };

    // Listen for custom notifications
    const handleCustomNotification = (data: any) => {
      const { message, type = "info" } = data;
      addNotification(message, type);
    };

    const handleTaskDeleted = (data: any) => {
      const message = data.message || "A task has been deleted.";
      addNotification(message, "warning");
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
  }, [socket, addNotification]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Notification header with controls */}
      {notifications.length > 0 && (
        <div className="p-3 rounded-t-lg bg-gray-800 text-white text-sm flex justify-between items-center">
          <span>{notifications.length} Notifications</span>
          <div className="flex space-x-2">
            <button 
              onClick={markAllAsRead}
              className="text-xs hover:text-gray-300"
              aria-label="Mark all as read"
            >
              Mark all read
            </button>
            <button 
              onClick={clearAllNotifications}
              className="text-xs hover:text-gray-300"
              aria-label="Clear all notifications"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
      
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-md animate-bounceIn ${
            notification.read 
              ? "opacity-75 " 
              : ""
          }${
            notification.type === "info"
              ? "bg-blue-100 border border-blue-300 text-blue-800"
              : notification.type === "success"
              ? "bg-green-100 border border-green-300 text-green-800"
              : notification.type === "warning"
              ? "bg-yellow-100 border border-yellow-300 text-yellow-800"
              : "bg-red-100 border border-red-300 text-red-800"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{notification.message}</p>
              <p className="text-xs mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex space-x-2">
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-gray-500 hover:text-gray-700 text-xs"
                  aria-label="Mark as read"
                >
                  ✓
                </button>
              )}
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {notifications.length > 5 && (
        <div className="p-3 rounded-b-lg bg-gray-100 text-gray-700 text-center text-sm">
          +{notifications.length - 5} more notifications
        </div>
      )}
      
      {/* Show empty state when no notifications */}
      {notifications.length === 0 && (
        <div className="p-4 rounded-lg bg-gray-100 text-gray-500 text-center text-sm">
          No notifications
        </div>
      )}
    </div>
  );
};

export default Notification;