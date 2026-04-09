import bcrypt from 'bcryptjs'

export const SAFE_USER_SELECT = {
  id: true, firstName: true, lastName: true,
  username: true, email: true, phone: true,
  role: true, createdAt: true, updatedAt: true,
} as const

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Simple in-memory rate limiter (per IP, 5 attempts per 15 minutes)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now  = Date.now()
  const WINDOW = 15 * 60 * 1000
  const MAX    = 5

  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW })
    return { allowed: true }
  }
  if (entry.count >= MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count++
  return { allowed: true }
}

export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip)
}
