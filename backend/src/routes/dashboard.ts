import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getDashboardMetrics);

export default router;
