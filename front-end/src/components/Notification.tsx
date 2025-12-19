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
      
      // Play notification sound
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFfHp8fHx9fX1+fn5/f3+AgICBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=");
        audio.play().catch(e => console.log("Audio play failed:", e));
      } catch (e) {
        console.log("Audio play failed:", e);
      }
      
      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 10000);
    };

    const handleTaskUpdated = (data: any) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: data.message || `Task updated: ${data.task?.title}`,
        timestamp: new Date(),
        type: "info",
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Play notification sound
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFfHp8fHx9fX1+fn5/f3+AgICBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=");
        audio.play().catch(e => console.log("Audio play failed:", e));
      } catch (e) {
        console.log("Audio play failed:", e);
      }
      
      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 10000);
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

  // Don't hide notifications, but show a counter instead
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.slice(0, 3).map((notification) => (
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
      {notifications.length > 3 && (
        <div className="p-3 rounded shadow-lg bg-blue-500 text-white text-center font-medium">
          +{notifications.length - 3} more notifications
        </div>
      )}
    </div>
  );
};

export default Notification;