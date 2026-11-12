import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ecoloop_super_secret_jwt_key_2026_circular_economy';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    businessName: string;
    city: string;
    category: string;
    role: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        businessName: true,
        city: true,
        category: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User session invalid. Please log in again.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const userRole = (req.user.role || 'BUYER').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    if (!normalizedAllowed.includes(userRole)) {
      res.status(403).json({
        error: `Access denied (403): This resource requires role "${allowedRoles.join(' or ')}", but your account is registered as "${req.user.role}".`,
      });
      return;
    }
    next();
  };
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          businessName: true,
          city: true,
          category: true,
          role: true,
        },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid token for optional auth
  }
  next();
}
