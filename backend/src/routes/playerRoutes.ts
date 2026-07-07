import { Router } from 'express';
import { getPlayers } from '../controllers/playerController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all player routes
// Note: We might want discovery to be public, but for now we secure it
router.use(verifyToken);

router.get('/', getPlayers);

export default router;
