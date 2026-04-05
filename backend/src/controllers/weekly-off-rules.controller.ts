import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { weeklyOffRulesService } from '../services';
import { asyncHandler } from '../utils/http';

export const getWeeklyOffRules = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const weeklyOffRules = await weeklyOffRulesService.listWeeklyOffRules();
  res.json({ success: true, message: 'Weekly off rules retrieved', data: weeklyOffRules });
});

export const createWeeklyOffRuleHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const weeklyOffRule = await weeklyOffRulesService.createWeeklyOffRule(req.body);
  res.json({ success: true, message: 'Weekly off rule created', data: weeklyOffRule });
});

export const updateWeeklyOffRuleHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const weeklyOffRule = await weeklyOffRulesService.updateWeeklyOffRule(id, req.body);
  res.json({ success: true, message: 'Weekly off rule updated', data: weeklyOffRule });
});

export const deleteWeeklyOffRuleHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await weeklyOffRulesService.deleteWeeklyOffRule(id);
  res.json({ success: true, message: 'Weekly off rule deleted', data: null });
});
