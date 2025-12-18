import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error";
}

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleTaskAssigned = (data: any) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: data.message || "You have been assigned a new task!",
        timestamp: new Date(),
        type: "info",
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    const handleTaskUpdated = (data: any) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: data.message || `Task updated: ${data.task?.title}`,
        timestamp: new Date(),
        type: "info",
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    socket.on("Task:assigned", handleTaskAssigned);
    socket.on("Task:updated", handleTaskUpdated);

    return () => {
      socket.off("Task:assigned", handleTaskAssigned);
      socket.off("Task:updated", handleTaskUpdated);
    };
  }, [socket]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded shadow-lg max-w-md animate-fadeIn ${
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
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;