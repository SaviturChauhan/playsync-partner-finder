import { Router } from 'express';
import { getDashboardStats, getAllUsers, deleteUser, getActivityLog, getGameCategories } from '../controllers/adminController';
import { verifyToken } from '../middleware/authMiddleware';
import { verifyAdmin } from '../middleware/adminMiddleware';

const router = Router();

// All admin routes require auth + admin role
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.get('/activity', getActivityLog);
router.get('/games', getGameCategories);

export default router;
