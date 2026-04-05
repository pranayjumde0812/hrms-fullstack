import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { workLocationsService } from '../services';
import { asyncHandler } from '../utils/http';

export const getWorkLocations = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const workLocations = await workLocationsService.listWorkLocations();
  res.json({ success: true, message: 'Work locations retrieved', data: workLocations });
});

export const createWorkLocationHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const workLocation = await workLocationsService.createWorkLocation(req.body);
  res.json({ success: true, message: 'Work location created', data: workLocation });
});

export const updateWorkLocationHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const workLocation = await workLocationsService.updateWorkLocation(id, req.body);
  res.json({ success: true, message: 'Work location updated', data: workLocation });
});

export const deleteWorkLocationHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await workLocationsService.deleteWorkLocation(id);
  res.json({ success: true, message: 'Work location deleted', data: null });
});
