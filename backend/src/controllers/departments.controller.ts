import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { departmentsService } from '../services';
import { asyncHandler } from '../utils/http';

export const getDepartments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const departments = await departmentsService.listDepartments();
  res.json({ success: true, message: 'Departments retrieved', data: departments });
});

export const createDepartmentHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await departmentsService.createDepartment(req.body);
  res.json({ success: true, message: 'Department created', data: department });
});

export const updateDepartmentHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const department = await departmentsService.updateDepartment(id, req.body);
  res.json({ success: true, message: 'Department updated', data: department });
});

export const deleteDepartmentHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await departmentsService.deleteDepartment(id);
  res.json({ success: true, message: 'Department deleted', data: null });
});
