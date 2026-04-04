import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { projectsService } from '../services';
import { asyncHandler } from '../utils/http';

export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const projects = await projectsService.listProjects(req.user!);
  res.json({ success: true, message: 'Projects retrieved', data: projects });
});

export const createProjectHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await projectsService.createProject(req.body);
  res.json({ success: true, message: 'Project created', data: project });
});

export const assignProjectUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const { userIds } = req.body as { userIds: number[] };
  const project = await projectsService.assignUsers(id, userIds);
  res.json({ success: true, message: 'Users assigned', data: project });
});

export const updateProjectHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const project = await projectsService.updateProject(id, req.body);
  res.json({ success: true, message: 'Project updated', data: project });
});

export const deleteProjectHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await projectsService.deleteProject(id);
  res.json({ success: true, message: 'Project deleted', data: null });
});
