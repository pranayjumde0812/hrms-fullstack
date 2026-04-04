import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

// Get all users
router.get('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true,
        baseSalary: true, hourlyRate: true, joiningDate: true, departmentId: true,
        department: { select: { name: true } },
        createdAt: true
      }
    });
    res.json({ success: true, message: 'Users retrieved', data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', data: null });
  }
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE']),
  baseSalary: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  joiningDate: z.string().transform((str) => new Date(str)),
  departmentId: z.coerce.number().optional()
});

// Create user
router.post('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), async (req: Request, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists', data: null });
    }
    
    const user = await prisma.user.create({
      data: {
        ...data,
      }
    });
    
    const { password, ...userSafelyExported } = user;
    res.json({ success: true, message: 'User created', data: userSafelyExported });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', data: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error', data: null });
  }
});

// Get user profile by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id', data: null });
    }

    // Only HR and admins, or the user themselves can view full profile
    const authedUser = (req as any).user;
    if (authedUser.id !== userId && !['SUPER_ADMIN', 'HR_MANAGER'].includes(authedUser.role)) {
      return res.status(403).json({ success: false, message: 'Access denied', data: null });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    });
    
    if (!user) return res.status(404).json({ success: false, message: 'Not found', data: null });
    
    const { password, ...safeUser } = user;
    res.json({ success: true, message: 'User retrieved', data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', data: null });
  }
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE']).optional(),
  baseSalary: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  departmentId: z.coerce.number().nullable().optional()
});

// Update user
router.put('/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id', data: null });
    }

    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: userId },
      data
    });
    const { password, ...safeUser } = user;
    res.json({ success: true, message: 'User updated', data: safeUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', data: error.errors });
    }
    res.status(500).json({ success: false, message: 'Error updating user', data: null });
  }
});

// Delete user
router.delete('/:id', authorize(['SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id', data: null });
    }

    // Prevent self-deletion
    const authedUser = (req as any).user;
    if (authedUser.id === userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself', data: null });
    }
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: 'User deleted', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user', data: null });
  }
});

export default router;
