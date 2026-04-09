import { z } from 'zod'

export const RegisterSchema = z.object({
  firstName:       z.string().min(1, 'Required').max(50),
  lastName:        z.string().min(1, 'Required').max(50),
  username:        z.string().min(3, 'Min 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email:           z.string().email('Invalid email'),
  phone:           z.string().regex(/^\+?[\d\s\-()+]{7,20}$/, 'Invalid phone number').optional().or(z.literal('')),
  password:        z.string()
                    .min(8, 'Min 8 characters')
                    .max(100)
                    .regex(/[A-Z]/, 'Must contain an uppercase letter')
                    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

export const LoginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
})

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName:  z.string().min(1).max(50).optional(),
  username:  z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email:     z.string().email().optional(),
  phone:     z.string().optional(),
  role:      z.enum(['ADMIN', 'USER']).optional(),
  password:  z.string().min(8).max(100).regex(/[A-Z]/).regex(/[0-9]/).optional(),
})

export type RegisterInput  = z.infer<typeof RegisterSchema>
export type LoginInput     = z.infer<typeof LoginSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
