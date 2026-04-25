import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  tenantId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      rawBody?: string;
    }
  }
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('FATAL: JWT_SECRET env var not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    if (!payload.sub) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      tenantId: payload.tenantId as string | undefined,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const setupAuth = async (app: any) => {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not set — all protected routes will return 500');
  }
};
