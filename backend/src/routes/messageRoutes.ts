import { Router } from 'express';
import {
  sendMessage,
  getConversations,
  getConversation,
  getUnreadCount,
  getFriends,
} from '../controllers/messageController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/friends', getFriends);
router.get('/unread', getUnreadCount);
router.get('/', getConversations);
router.get('/:friendId', getConversation);
router.post('/', sendMessage);

export default router;
