import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import attendanceRoutes from './routes/attendance';
import attendancePolicyRoutes from './routes/attendance-policies';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import departmentRoutes from './routes/departments';
import holidayRoutes from './routes/holidays';
import projectRoutes from './routes/projects';
import timesheetRoutes from './routes/timesheets';
import payrollRoutes from './routes/payroll';
import leaveRoutes from './routes/leaves';
import dashboardRoutes from './routes/dashboard';
import workLocationRoutes from './routes/work-locations';
import weeklyOffRuleRoutes from './routes/weekly-off-rules';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { seedSuperAdminIfNeeded } from './utils/seedSuperAdmin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance-policies', attendancePolicyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/work-locations', workLocationRoutes);
app.use('/api/weekly-off-rules', weeklyOffRuleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NexusHR API is running', data: null });
});

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await seedSuperAdminIfNeeded();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
