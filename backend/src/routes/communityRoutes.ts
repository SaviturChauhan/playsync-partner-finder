import { Router } from 'express';
import { 
  createCommunity, 
  getCommunities, 
  getMyCommunities, 
  joinCommunity, 
  leaveCommunity, 
  getCommunityById 
} from '../controllers/communityController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', createCommunity);
router.get('/', getCommunities);
router.get('/mine', getMyCommunities);
router.get('/:communityId', getCommunityById);
router.post('/:communityId/join', joinCommunity);
router.post('/:communityId/leave', leaveCommunity);

export default router;
