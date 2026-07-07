import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Need an uppercase letter')
    .regex(/[a-z]/, 'Need a lowercase letter')
    .regex(/\d/, 'Need a number'),
  phone: z.string().optional(),
});

export const customerSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

export const leadSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  score: z.coerce.number().min(0).max(100).optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().min(1, 'Required'),
  price: z.coerce.number().positive('Must be positive'),
  costPrice: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const employeeSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  joiningDate: z.string().optional(),
  salary: z.coerce.number().optional(),
});
