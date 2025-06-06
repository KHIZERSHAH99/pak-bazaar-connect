
// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

export const validateMOQ = (moq: number): boolean => {
  return moq > 0 && Number.isInteger(moq);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Pakistani phone number validation
  const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
