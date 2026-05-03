import { Router } from 'express';
import { createTask, getTasks, updateTask, getMyTasks } from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', createTask);
router.get('/my', getMyTasks);
router.get('/', getTasks);
router.patch('/:taskId', updateTask);

export default router;
