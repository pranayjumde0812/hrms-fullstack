import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);

// Get all projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    
    let projects;
    if (['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'].includes(userRole)) {
      projects = await prisma.project.findMany({ include: { users: { select: { id: true, firstName: true, lastName: true } } } });
    } else {
      // Employee only sees assigned projects
      projects = await prisma.project.findMany({
        where: { users: { some: { id: (req as any).user.id } } }
      });
    }
    res.json({ success: true, message: 'Projects retrieved', data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching projects', data: null });
  }
});

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined)
});

// Create project
router.post('/', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), async (req: Request, res: Response) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({ data });
    res.json({ success: true, message: 'Project created', data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

const assignSchema = z.object({
  userIds: z.array(z.coerce.number())
});

// Assign users to project
router.post('/:id/assign', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project id', data: null });
    }

    const { userIds } = assignSchema.parse(req.body);
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        users: {
          connect: userIds.map(id => ({ id }))
        }
      },
      include: { users: { select: { id: true, firstName: true, lastName: true } } }
    });
    res.json({ success: true, message: 'Users assigned', data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

// Update project
router.put('/:id', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project id', data: null });
    }

    const data = projectSchema.parse(req.body);
    const project = await prisma.project.update({
      where: { id: projectId },
      data,
      include: { users: { select: { id: true, firstName: true, lastName: true } } }
    });
    res.json({ success: true, message: 'Project updated', data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', data: null });
  }
});

// Delete project
router.delete('/:id', authorize(['SUPER_ADMIN']), async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ success: false, message: 'Invalid project id', data: null });
    }

    await prisma.project.delete({ where: { id: projectId } });
    res.json({ success: true, message: 'Project deleted', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting project', data: null });
  }
});

export default router;
