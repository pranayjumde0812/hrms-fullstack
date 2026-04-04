import { Router } from 'express';
import { generatePayrollHandler, getPayrolls } from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { generatePayrollSchema } from '../validators/payroll.validation';

const router = Router();

router.use(authenticate);

router.post('/generate', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateBody(generatePayrollSchema), generatePayrollHandler);
router.get('/', getPayrolls);

export default router;
