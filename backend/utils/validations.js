import { z } from 'zod';

export const sendSignupOtpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const verifySignupOtpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const sendLoginOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyLoginOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const signupSchema = sendSignupOtpSchema;
export const loginSchema = sendLoginOtpSchema;



export const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Done', 'Blocked', 'Cancelled']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  assignee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID').optional().or(z.literal('')),
  workspace: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Task title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Done', 'Blocked', 'Cancelled']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  assignee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID').optional().or(z.literal('')),
});
