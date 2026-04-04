import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

// Get timesheets
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    
    const filter = ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'].includes(role) 
      ? {} 
      : { userId };

    const timesheets = await prisma.timesheet.findMany({
      where: filter,
      include: { 
        project: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { date: 'desc' }
    });
    
    res.json({ success: true, message: 'Timesheets retrieved', data: timesheets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching timesheets', data: null });
  }
});

const logTimesheetSchema = z.object({
  projectId: z.string(),
  date: z.string().transform(str => new Date(str)),
  hours: z.number().min(0.5).max(24),
  notes: z.string().optional()
});

// Log timesheet
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = logTimesheetSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const timesheet = await prisma.timesheet.create({
      data: {
        ...data,
        userId
      }
    });
    res.json({ success: true, message: 'Timesheet logged', data: timesheet });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

const statusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'])
});

// Approve/Reject timesheet
router.patch('/:id/status', authorize(['PROJECT_MANAGER', 'SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const timesheet = await prisma.timesheet.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, message: `Timesheet ${status.toLowerCase()}`, data: timesheet });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

export default router;
