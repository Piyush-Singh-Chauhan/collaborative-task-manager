import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../api/auth.api";
import { ValidationService, type ValidationError } from "../../utils/validation";
import { NotificationTemplates } from "../../utils/notifications";
import { useSocket } from "../../context/SocketContext";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

const UserProfile = () => {
  const { user, login } = useAuth();
  const { socket } = useSocket();
  const [name, setName] = useState(user?.name || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Real-time validation on name change
  useEffect(() => {
    const nameError = ValidationService.validateName(name);
    if (nameError) {
      setErrors({ [nameError.field]: nameError.message });
    } else {
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  }, [name]);

  // Helper function to auto-capitalize first letter of each word
  const autoCapitalizeName = (value: string): string => {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Handle input change with validation
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Auto-capitalize first letter of each word
    const capitalizedValue = autoCapitalizeName(value);
    setName(capitalizedValue);
    
    // Real-time validation
    const nameError = ValidationService.validateName(capitalizedValue);
    if (nameError) {
      setErrors(prev => ({ ...prev, [nameError.field]: nameError.message }));
    } else {
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const nameError = ValidationService.validateName(name);
    
    if (nameError) {
      setErrors({ [nameError.field]: nameError.message });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await updateUserProfile({ name });
      
      // Update the user in context
      if (user) {
        login(response.user.id, response.user);
      }
      
      setMessage({ type: "success", text: response.message });
      
      // Send notification
      if (socket) {
        socket.emit("notification", {
          message: NotificationTemplates.PROFILE_UPDATED(),
          type: "success"
        });
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <div className="md:w-64">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Profile</h1>
              <p className="text-gray-600 mt-1">Manage your profile information</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={() => {
                      const nameError = ValidationService.validateName(name);
                      if (nameError) {
                        setErrors({ [nameError.field]: nameError.message });
                      } else {
                        // Clear error if validation passes
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.name;
                          return newErrors;
                        });
                      }
                    }}
                    required
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.name}
                    </p>
                  )}
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {message && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;