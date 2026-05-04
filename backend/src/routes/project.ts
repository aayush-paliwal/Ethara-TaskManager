import { Router } from 'express';

import { authenticate } from '../middleware/authMiddleware';
import { createProject, getProjects, getProjectDetails, addMember } from '../controllers/projectController';


const router = Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:projectId', getProjectDetails);
router.post('/:projectId/members', addMember);

export default router;
