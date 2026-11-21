import { isValidEmail, isValidPassword, isValidRollNumber, isPositiveInteger } from '../src/utils/validators';

describe('Frontend Form Validators', () => {
  test('isValidEmail validates standard email formats', () => {
    expect(isValidEmail('test@student.edu')).toBe(true);
    expect(isValidEmail('teacher.name@domain.co.in')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });

  test('isValidPassword requires at least 6 characters', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('Password@123')).toBe(true);
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });

  test('isValidRollNumber checks roll number validity', () => {
    expect(isValidRollNumber('CS2026-001')).toBe(true);
    expect(isValidRollNumber('AB')).toBe(false);
    expect(isValidRollNumber('')).toBe(false);
  });

  test('isPositiveInteger checks valid positive whole numbers', () => {
    expect(isPositiveInteger(50)).toBe(true);
    expect(isPositiveInteger('100')).toBe(true);
    expect(isPositiveInteger(0)).toBe(false);
    expect(isPositiveInteger(-10)).toBe(false);
    expect(isPositiveInteger(3.14)).toBe(false);
  });
});

