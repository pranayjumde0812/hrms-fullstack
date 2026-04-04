import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { loginSchema } from '../validators/auth.validation';
import { authController } from '../controllers';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.loginUser);
router.post('/logout', authController.logoutUser);
router.get('/me', authenticate, authController.getAuthenticatedUserProfile);

export default router;
