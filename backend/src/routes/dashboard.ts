import { Router } from 'express';

import { authenticate } from '../middleware/authMiddleware';
import { getDashboardMetrics } from '../controllers/dashboardController';


const router = Router();

router.get('/', authenticate, getDashboardMetrics);

export default router;
