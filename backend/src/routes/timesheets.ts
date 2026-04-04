import { Router } from 'express';
import {
  createTimesheetHandler,
  getTimesheets,
  updateTimesheetStatusHandler,
} from '../controllers/timesheets.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validationMiddleware';
import { logTimesheetSchema, timesheetIdParamSchema, timesheetStatusSchema } from '../validators/timesheets.validation';

const router = Router();

router.use(authenticate);

router.get('/', getTimesheets);
router.post('/', validateBody(logTimesheetSchema), createTimesheetHandler);
router.patch('/:id/status', authorize(['PROJECT_MANAGER', 'SUPER_ADMIN']), validateParams(timesheetIdParamSchema), validateBody(timesheetStatusSchema), updateTimesheetStatusHandler);

export default router;
