import { Router } from 'express';
import { createRequest, getMyRequests, respondToRequest } from '../controllers/requestController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware
router.use(verifyToken);

router.post('/', createRequest);
router.get('/', getMyRequests);
router.put('/:requestId', respondToRequest);

export default router;
