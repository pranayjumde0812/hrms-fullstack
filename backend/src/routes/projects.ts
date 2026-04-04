import { Router } from 'express';
import {
  assignProjectUsers,
  createProjectHandler,
  deleteProjectHandler,
  getProjects,
  updateProjectHandler,
} from '../controllers/projects.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validationMiddleware';
import { assignUsersSchema, projectIdParamSchema, projectSchema } from '../validators/projects.validation';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), validateBody(projectSchema), createProjectHandler);
router.post('/:id/assign', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), validateParams(projectIdParamSchema), validateBody(assignUsersSchema), assignProjectUsers);
router.put('/:id', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), validateParams(projectIdParamSchema), validateBody(projectSchema), updateProjectHandler);
router.delete('/:id', authorize(['SUPER_ADMIN']), validateParams(projectIdParamSchema), deleteProjectHandler);

export default router;
