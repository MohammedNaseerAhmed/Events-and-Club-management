import { z } from 'zod';

const passwordMin = 8;
const passwordRegex = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
};

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
  username: z
    .string()
    .min(4, 'Username must be 4–30 characters')
    .max(30, 'Username must be 4–30 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores')
    .transform((v) => v.toLowerCase()),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(passwordMin, `At least ${passwordMin} characters`)
    .refine((v) => passwordRegex.upper.test(v), 'At least 1 uppercase letter')
    .refine((v) => passwordRegex.lower.test(v), 'At least 1 lowercase letter')
    .refine((v) => passwordRegex.number.test(v), 'At least 1 number')
    .refine((v) => passwordRegex.special.test(v), 'At least 1 special character'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
  role: z.enum(['student', 'clubHead', 'admin']).default('student'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const passwordRules = [
  { id: 'len', label: `Minimum ${passwordMin} characters`, test: (v) => (v || '').length >= passwordMin },
  { id: 'upper', label: 'At least 1 uppercase letter', test: (v) => passwordRegex.upper.test(v || '') },
  { id: 'lower', label: 'At least 1 lowercase letter', test: (v) => passwordRegex.lower.test(v || '') },
  { id: 'number', label: 'At least 1 number', test: (v) => passwordRegex.number.test(v || '') },
  { id: 'special', label: 'At least 1 special character', test: (v) => passwordRegex.special.test(v || '') },
];
