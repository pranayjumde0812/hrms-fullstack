import { Router } from 'express';
import {
  createUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUsers,
  updateUserHandler,
} from '../controllers/users.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams } from '../middlewares/validationMiddleware';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../validators/users.validation';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), getUsers);
router.post('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateBody(createUserSchema), createUserHandler);
router.get('/:id', validateParams(userIdParamSchema), getUserByIdHandler);
router.put('/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateParams(userIdParamSchema), validateBody(updateUserSchema), updateUserHandler);
router.delete('/:id', authorize(['SUPER_ADMIN']), validateParams(userIdParamSchema), deleteUserHandler);

export default router;
