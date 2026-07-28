import { Router } from 'express';
import { createRequest, getMyRequests, getSentRequests, getMatchHistory, respondToRequest, cancelRequest } from '../controllers/requestController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware
router.use(verifyToken);

router.post('/', createRequest);
router.get('/', getMyRequests);
router.get('/sent', getSentRequests);
router.get('/history', getMatchHistory);
router.put('/:requestId', respondToRequest);
router.delete('/:requestId', cancelRequest);

export default router;
