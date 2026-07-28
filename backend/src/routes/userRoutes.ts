import { Router } from 'express';
import { syncUser, getProfile, updateProfile } from '../controllers/userController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all user routes
router.use(verifyToken);

router.post('/sync', syncUser);
router.get('/me', getProfile);
router.put('/me', updateProfile);

export default router;
