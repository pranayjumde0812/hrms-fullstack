import { Router } from 'express';
import {
  createAttendancePolicyHandler,
  deleteAttendancePolicyHandler,
  getAttendancePolicies,
  updateAttendancePolicyHandler,
} from '../controllers/attendance-policies.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validationMiddleware';
import {
  attendancePolicyCreateSchema,
  attendancePolicyIdParamSchema,
  attendancePolicyUpdateSchema,
} from '../validators/attendance-policies.validation';

const router = Router();

router.use(authenticate);

router.get('/', getAttendancePolicies);
router.post('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateBody(attendancePolicyCreateSchema), createAttendancePolicyHandler);
router.put('/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateParams(attendancePolicyIdParamSchema), validateBody(attendancePolicyUpdateSchema), updateAttendancePolicyHandler);
router.delete('/:id', authorize(['SUPER_ADMIN']), validateParams(attendancePolicyIdParamSchema), deleteAttendancePolicyHandler);

export default router;
