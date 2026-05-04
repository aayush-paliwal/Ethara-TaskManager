import { Router } from 'express';

import { authenticate } from '../middleware/authMiddleware';
import { createTask, getTasks, updateTask, getMyTasks } from '../controllers/taskController';


const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/my', getMyTasks);
router.post('/', createTask);
router.patch('/:taskId', updateTask);

export default router;
