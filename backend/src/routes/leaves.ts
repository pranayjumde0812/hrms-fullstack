import { Router } from 'express';
import {
  createLeaveHandler,
  getLeaves,
  updateLeaveStatusHandler,
} from '../controllers/leaves.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validationMiddleware';
import { applyLeaveSchema, leaveIdParamSchema, leaveStatusSchema } from '../validators/leaves.validation';

const router = Router();

router.use(authenticate);

router.get('/', getLeaves);
router.post('/', validateBody(applyLeaveSchema), createLeaveHandler);
router.patch('/:id/status', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateParams(leaveIdParamSchema), validateBody(leaveStatusSchema), updateLeaveStatusHandler);

export default router;
