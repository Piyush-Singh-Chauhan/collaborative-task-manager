// Utility function to capitalize the first letter of a string
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Validate name field
export const validateName = (name: string): string | null => {
  if (!name) {
    return "Please enter your name.";
  }
  
  // Check length
  if (name.length < 2) {
    return "Name must be at least 2 characters long.";
  }
  
  if (name.length > 60) {
    return "Name must be no more than 60 characters long.";
  }
  
  // Check for valid characters (only alphabets and spaces)
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    return "Name can only contain letters and spaces.";
  }
  
  // Check that it's not just spaces
  if (name.trim().length === 0) {
    return "Name cannot be empty.";
  }
  
  return null; // Valid name
};

// Validate email field
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Please enter your email.";
  }
  
  if (email.length > 60) {
    return "Email must be no more than 60 characters long.";
  }
  
  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email.";
  }
  
  return null; // Valid email
};

// Validate password field
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Please enter your password.";
  }
  
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  
  if (password.length > 16) {
    return "Password must be no more than 16 characters long.";
  }
  
  return null; // Valid password
};