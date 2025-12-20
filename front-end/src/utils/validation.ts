// Enterprise-level validation utilities with field-level validations

export interface ValidationError {
  field: string;
  message: string;
}

// Helper function to check if a field is empty
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

export class ValidationService {
  static validateName(name: string): ValidationError | null {
    // Check if field is empty
    if (isEmpty(name)) {
      return { field: "name", message: "Please enter your name." };
    }
    
    // Check minimum length
    if (name.trim().length < 2) {
      return { field: "name", message: "Name must be at least 2 characters long" };
    }
    
    // Check maximum length
    if (name.trim().length > 50) {
      return { field: "name", message: "Name must be less than 50 characters" };
    }
    
    // Check for valid characters (only alphabets and spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      return { field: "name", message: "Name can only contain letters and spaces" };
    }
    
    // Check first letter is capital and first letter after space is capital
    const words = name.trim().split(/\s+/);
    for (const word of words) {
      if (word.length > 0) {
        const firstChar = word.charAt(0);
        if (firstChar !== firstChar.toUpperCase()) {
          return { field: "name", message: "First letter of each word must be capitalized" };
        }
      }
    }
    
    return null;
  }
  
  static capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  
  static validateTaskTitle(title: string): ValidationError | null {
    if (!title || title.trim().length === 0) {
      return { field: "title", message: "Please enter the title." };
    }
    
    if (title.trim().length < 2) {
      return { field: "title", message: "Title must be at least 2 characters long" };
    }
    
    if (title.trim().length > 100) {
      return { field: "title", message: "Title must be less than 100 characters" };
    }
    
    return null;
  }
  
  static validateTaskDescription(description: string): ValidationError | null {
    if (description && description.length > 1000) {
      return { field: "description", message: "Description must be less than 1000 characters" };
    }
    
    return null;
  }
  
  static validateTaskDueDate(dueDate: string): ValidationError | null {
    if (!dueDate) {
      return { field: "dueDate", message: "Please select the due date." };
    }
    
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      return { field: "dueDate", message: "Invalid date format" };
    }
    
    return null;
  }
  
  static validateTaskPriority(priority: string): ValidationError | null {
    const validPriorities = ["Low", "Medium", "High", "Urgent"];
    if (!validPriorities.includes(priority)) {
      return { field: "priority", message: "Invalid priority value" };
    }
    
    return null;
  }
  
  static validateTaskStatus(status: string): ValidationError | null {
    const validStatuses = ["To Do", "In Progress", "Review", "Completed"];
    if (!validStatuses.includes(status)) {
      return { field: "status", message: "Invalid status value" };
    }
    
    return null;
  }
  
  static validateEmail(email: string): ValidationError | null {
    // Check if field is empty
    if (isEmpty(email)) {
      return { field: "email", message: "Please enter your email." };
    }
    
    // Email must have at least 2 characters before @ and a proper domain
    const emailRegex = /^[A-Za-z0-9._%+-]{2,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { field: "email", message: "Email must have at least 2 characters before @ and a valid domain" };
    }
    
    return null;
  }
  
  static validatePassword(password: string): ValidationError | null {
    // Check if field is empty
    if (isEmpty(password)) {
      return { field: "password", message: "Please enter your password." };
    }
    
    if (password.length < 6) {
      return { field: "password", message: "Password must be at least 6 characters long" };
    }
    
    if (password.length > 20) {
      return { field: "password", message: "Password must be less than 20 characters" };
    }
    
    return null;
  }
}