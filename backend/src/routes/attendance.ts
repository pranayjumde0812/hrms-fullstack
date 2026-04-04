import { Router } from 'express';
import { attendanceController } from '../controllers';
import { authenticate } from '../middlewares/authMiddleware';
import { validateBody, validateQuery } from '../middlewares/validationMiddleware';
import { attendanceCheckInSchema, attendanceCheckOutSchema, attendanceMonthlyQuerySchema } from '../validators/attendance.validation';

const router = Router();

router.use(authenticate);

router.get('/me', attendanceController.getMyAttendanceHandler);
router.get('/monthly', validateQuery(attendanceMonthlyQuerySchema), attendanceController.getMonthlyAttendanceHandler);
router.get('/viewable-users', attendanceController.getViewableAttendanceUsersHandler);
router.post('/check-in', validateBody(attendanceCheckInSchema), attendanceController.checkInHandler);
router.post('/check-out', validateBody(attendanceCheckOutSchema), attendanceController.checkOutHandler);

export default router;
