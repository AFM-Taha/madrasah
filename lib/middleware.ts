import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload, hasRole } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Authentication middleware for API routes
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest, context?: any): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Access denied. No token provided.' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { error: 'Access denied. Invalid token.' },
          { status: 401 }
        );
      }

      req.user = decoded;
      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { error: 'Access denied. Invalid token.' },
        { status: 401 }
      );
    }
  };
}

/**
 * Role-based authorization middleware
 */
export function withRoles(
  requiredRoles: string[],
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest, context?: any) => {
    if (!req.user) {
      return NextResponse.json(
        { error: 'Access denied. User not authenticated.' },
        { status: 401 }
      );
    }

    if (!hasRole(req.user.role, requiredRoles)) {
      return NextResponse.json(
        { error: 'Access denied. Insufficient permissions.' },
        { status: 403 }
      );
    }

    return handler(req, context);
  });
}

/**
 * Principal-only access middleware
 */
export function withPrincipalOnly(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return withRoles(['principal'], handler);
}

/**
 * Teacher or Principal access middleware
 */
export function withTeacherOrPrincipal(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return withRoles(['teacher', 'principal'], handler);
}

/**
 * All roles access middleware (authenticated users)
 */
export function withAllRoles(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return withRoles(['student', 'teacher', 'principal'], handler);
}