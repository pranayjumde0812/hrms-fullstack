import { Router } from 'express';
import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  getDepartments,
  updateDepartmentHandler,
} from '../controllers/departments.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validationMiddleware';
import { departmentIdParamSchema, departmentSchema } from '../validators/departments.validation';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.post('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateBody(departmentSchema), createDepartmentHandler);
router.put('/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateParams(departmentIdParamSchema), validateBody(departmentSchema), updateDepartmentHandler);
router.delete('/:id', authorize(['SUPER_ADMIN']), validateParams(departmentIdParamSchema), deleteDepartmentHandler);

export default router;
