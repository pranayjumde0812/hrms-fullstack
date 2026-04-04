import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // In a real app, hash password and use bcrypt
});

// Since this is an MVP without bcrypt, we just check plain text for ease of setup.
// In actual prod, we'd hash the password on creation and compare here.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod';
    const accessToken = jwt.sign(payload, secret, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Exclude password from response
    const { password: _, ...userWithoutPass } = user;
    
    res.json({ success: true, message: 'Logged in successfully', data: { user: userWithoutPass, accessToken } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', data: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error', data: null });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.json({ success: true, message: 'Logged out successfully', data: null });
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, departmentId: true }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }
    
    res.json({ success: true, message: 'Authenticated user', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', data: null });
  }
});

export default router;
