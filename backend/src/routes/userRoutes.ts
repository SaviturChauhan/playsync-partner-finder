import { Router } from 'express';
import { syncUser } from '../controllers/userController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all user routes
router.use(verifyToken);

router.post('/sync', syncUser);

export default router;
