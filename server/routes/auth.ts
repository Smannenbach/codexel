import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { users, userCredentials, refreshTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { isAuthenticated } from '../auth';

const router = Router();

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

function generateTokens(userId: string, email: string, tenantId?: string) {
  const secret = process.env.JWT_SECRET!;
  const accessToken = jwt.sign(
    { sub: userId, email, tenantId },
    secret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' },
    secret,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      firstName: z.string().min(1).max(50).optional(),
      lastName: z.string().min(1).max(50).optional(),
    });
    const { email, password, firstName, lastName } = schema.parse(req.body);

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = crypto.randomUUID();

    const [user] = await db.insert(users).values({
      id: userId,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      subscriptionStatus: 'free',
    }).returning();

    await db.insert(userCredentials).values({ userId, passwordHash });

    const { accessToken, refreshToken } = generateTokens(userId, email);

    await db.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    res.status(201).json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });
    const { email, password } = schema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const [creds] = await db.select().from(userCredentials).where(eq(userCredentials.userId, user.id));
    if (!creds) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, creds.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email || email);

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    res.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, subscriptionStatus: user.subscriptionStatus },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const secret = process.env.JWT_SECRET!;

    const payload = jwt.verify(refreshToken, secret) as jwt.JwtPayload;
    if (payload.type !== 'refresh' || !payload.sub) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const [stored] = await db.select().from(refreshTokens).where(
      and(eq(refreshTokens.token, refreshToken), gt(refreshTokens.expiresAt, new Date()))
    );
    if (!stored) {
      return res.status(401).json({ error: 'Refresh token expired or not found' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub));
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Rotate refresh token
    await db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));
    const tokens = generateTokens(user.id, user.email || '');
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    res.json(tokens);
  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', isAuthenticated, async (req, res) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string().optional() }).parse(req.body);
    if (refreshToken) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    }
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { stripeCustomerId, stripeSubscriptionId, ...safe } = user as any;
    res.json(safe);
  } catch {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
