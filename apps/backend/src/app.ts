import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import organizationRoutes from './routes/organization.routes';
import dashboardRoutes from './routes/dashboard.routes';
import uploadRoutes from './routes/upload.routes';
import activityRoutes from './routes/activity.routes';
import taskRoutes from './routes/task.routes';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — must come before routes; credentials:true is required for httpOnly cookie flow
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Static files for uploaded images
  app.use('/uploads', express.static('uploads'));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/organization', organizationRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/tasks', taskRoutes);

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  return app;
}
