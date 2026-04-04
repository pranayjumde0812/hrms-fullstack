import { Router } from 'express';
import { attendanceController } from '../controllers';
import { authenticate } from '../middlewares/authMiddleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validationMiddleware';
import { userIdParamSchema } from '../validators/users.validation';
import { attendanceCheckInSchema, attendanceCheckOutSchema, attendanceMonthlyQuerySchema } from '../validators/attendance.validation';
import { attendanceRegularizationCreateSchema, attendanceRegularizationReviewSchema } from '../validators/attendance-regularization.validation';

const router = Router();

router.use(authenticate);

router.get('/me', attendanceController.getMyAttendanceHandler);
router.get('/monthly', validateQuery(attendanceMonthlyQuerySchema), attendanceController.getMonthlyAttendanceHandler);
router.get('/viewable-users', attendanceController.getViewableAttendanceUsersHandler);
router.get('/regularizations', attendanceController.getRegularizationsHandler);
router.post('/regularizations', validateBody(attendanceRegularizationCreateSchema), attendanceController.createRegularizationHandler);
router.patch('/regularizations/:id', validateParams(userIdParamSchema), validateBody(attendanceRegularizationReviewSchema), attendanceController.reviewRegularizationHandler);
router.post('/check-in', validateBody(attendanceCheckInSchema), attendanceController.checkInHandler);
router.post('/check-out', validateBody(attendanceCheckOutSchema), attendanceController.checkOutHandler);

export default router;
