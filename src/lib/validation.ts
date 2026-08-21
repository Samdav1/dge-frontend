import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export const registerSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().min(8, { message: 'Please confirm your password' }),
    referralCode: z.string().optional(),
    terms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the Terms of Services',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const kycSchema = z.object({
    idType: z.string().min(1, { message: 'Please select an ID type' }),
    idNumber: z.string().min(1, { message: 'ID Number is required' }),
    // In a real app, we'd validate the file object/list here
    document: z.any().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type KYCInput = z.infer<typeof kycSchema>;
