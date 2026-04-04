import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

// Get leaves
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    
    const filter = ['SUPER_ADMIN', 'HR_MANAGER'].includes(role) 
      ? {} 
      : { userId };

    const leaves = await prisma.leave.findMany({
      where: filter,
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, message: 'Leaves retrieved', data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leaves', data: null });
  }
});

const applyLeaveSchema = z.object({
  type: z.enum(['SICK', 'CASUAL', 'PAID']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  reason: z.string().optional()
});

// Apply for leave
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = applyLeaveSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const leave = await prisma.leave.create({
      data: {
        ...data,
        userId
      }
    });
    res.json({ success: true, message: 'Leave applied', data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

const approveLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
});

// Approve or reject leave
router.patch('/:id/status', authorize(['SUPER_ADMIN', 'HR_MANAGER']), async (req: Request, res: Response) => {
  try {
    const leaveId = Number(req.params.id);
    if (Number.isNaN(leaveId)) {
      return res.status(400).json({ success: false, message: 'Invalid leave id', data: null });
    }

    const { status } = approveLeaveSchema.parse(req.body);
    const leave = await prisma.leave.update({
      where: { id: leaveId },
      data: { status }
    });
    res.json({ success: true, message: `Leave ${status.toLowerCase()}`, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

export default router;
