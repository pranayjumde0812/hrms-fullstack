import { Router } from 'express';
import {
  createWeeklyOffRuleHandler,
  deleteWeeklyOffRuleHandler,
  getWeeklyOffRules,
  updateWeeklyOffRuleHandler,
} from '../controllers/weekly-off-rules.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validationMiddleware';
import {
  weeklyOffRuleCreateSchema,
  weeklyOffRuleIdParamSchema,
  weeklyOffRuleUpdateSchema,
} from '../validators/weekly-off-rules.validation';

const router = Router();
router.use(authenticate);
router.get('/', getWeeklyOffRules);
router.post('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateBody(weeklyOffRuleCreateSchema), createWeeklyOffRuleHandler);
router.put('/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateParams(weeklyOffRuleIdParamSchema), validateBody(weeklyOffRuleUpdateSchema), updateWeeklyOffRuleHandler);
router.delete('/:id', authorize(['SUPER_ADMIN']), validateParams(weeklyOffRuleIdParamSchema), deleteWeeklyOffRuleHandler);

export default router;
