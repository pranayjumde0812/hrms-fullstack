import { Router } from 'express';
import { holidaysController } from '../controllers';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validationMiddleware';
import { holidayCreateSchema, holidayIdParamSchema, holidayQuerySchema } from '../validators/holidays.validation';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(holidayQuerySchema), holidaysController.getHolidaysHandler);
router.post('/', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateBody(holidayCreateSchema), holidaysController.createHolidayHandler);
router.delete('/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), validateParams(holidayIdParamSchema), holidaysController.deleteHolidayHandler);

export default router;
