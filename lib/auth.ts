import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'principal' | 'teacher' | 'student';
  firstName: string;
  lastName: string;
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: IUser): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  if (!JWT_SECRET) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is principal (super admin)
 */
export function isPrincipal(userRole: string): boolean {
  return userRole === 'principal';
}

/**
 * Check if user is teacher
 */
export function isTeacher(userRole: string): boolean {
  return userRole === 'teacher';
}

/**
 * Check if user is student
 */
export function isStudent(userRole: string): boolean {
  return userRole === 'student';
}

/**
 * Role hierarchy for access control
 */
export const ROLE_HIERARCHY = {
  principal: 3,
  teacher: 2,
  student: 1,
};

/**
 * Check if user has sufficient role level
 */
export function hasMinimumRole(userRole: string, minimumRole: string): boolean {
  return ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] >= 
         ROLE_HIERARCHY[minimumRole as keyof typeof ROLE_HIERARCHY];
}