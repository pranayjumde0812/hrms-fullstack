import { Router } from 'express';
import {
  createWorkLocationHandler,
  deleteWorkLocationHandler,
  getWorkLocations,
  updateWorkLocationHandler,
} from '../controllers/work-locations.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validationMiddleware';
import {
  workLocationCreateSchema,
  workLocationIdParamSchema,
  workLocationUpdateSchema,
} from '../validators/work-locations.validation';

const router = Router();

router.use(authenticate);

router.get('/', getWorkLocations);
router.post('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateBody(workLocationCreateSchema), createWorkLocationHandler);
router.put('/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateParams(workLocationIdParamSchema), validateBody(workLocationUpdateSchema), updateWorkLocationHandler);
router.delete('/:id', authorize(['SUPER_ADMIN']), validateParams(workLocationIdParamSchema), deleteWorkLocationHandler);

export default router;
