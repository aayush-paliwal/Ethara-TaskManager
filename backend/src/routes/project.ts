import { Router } from 'express';
import { createProject, getProjects, getProjectDetails, addMember } from '../controllers/projectController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:projectId', getProjectDetails);
router.post('/:projectId/members', addMember);

export default router;
