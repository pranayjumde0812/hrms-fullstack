import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

// Get all departments
router.get('/', async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { users: true } } }
    });
    res.json({ success: true, message: 'Departments retrieved', data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching departments', data: null });
  }
});

const departmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

// Create department (HR, Admin)
router.post('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), async (req: Request, res: Response) => {
  try {
    const data = departmentSchema.parse(req.body);
    const existing = await prisma.department.findUnique({ where: { name: data.name } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department already exists', data: null });
    }
    
    const department = await prisma.department.create({ data });
    res.json({ success: true, message: 'Department created', data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

// Update department
router.put('/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), async (req: Request, res: Response) => {
  try {
    const departmentId = Number(req.params.id);
    if (Number.isNaN(departmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid department id', data: null });
    }

    const data = departmentSchema.parse(req.body);
    const department = await prisma.department.update({
      where: { id: departmentId },
      data
    });
    res.json({ success: true, message: 'Department updated', data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

// Delete department
router.delete('/:id', authorize(['SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const departmentId = Number(req.params.id);
    if (Number.isNaN(departmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid department id', data: null });
    }

    await prisma.department.delete({ where: { id: departmentId } });
    res.json({ success: true, message: 'Department deleted', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting department (may have assigned users)', data: null });
  }
});

export default router;
