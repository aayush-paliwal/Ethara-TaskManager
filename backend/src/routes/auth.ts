import { Router } from 'express';

import { authenticate } from '../middleware/authMiddleware';
import { createUser, loginUser, logout, me } from '../controllers/authController';


const router = Router();

router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
