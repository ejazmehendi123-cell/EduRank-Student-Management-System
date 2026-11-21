export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const isValidRollNumber = (roll) => {
  return typeof roll === 'string' && roll.trim().length >= 3;
};

export const isPositiveInteger = (val) => {
  const num = Number(val);
  return Number.isInteger(num) && num > 0;
};

