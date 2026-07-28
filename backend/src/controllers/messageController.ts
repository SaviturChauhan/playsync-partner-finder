import { Request, Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import mongoose from 'mongoose';

// Send a message to a friend
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ error: 'receiverId and content are required' });
    }

    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const sender = await User.findOne({ firebaseUid: uid });
    if (!sender) return res.status(404).json({ error: 'Sender not found' });

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

    // Only allow messaging friends
    const isFriend = sender.friends.some((fId) => fId.toString() === receiverId.toString());
    if (!isFriend) {
      return res.status(403).json({ error: 'You can only message your friends' });
    }

    const message = new Message({
      senderId: sender._id,
      receiverId,
      content: content.trim(),
    });

    await message.save();

    // Populate sender info before responding
    const populated = await Message.findById(message._id)
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get all conversations (friends list with last message + unread count)
export const getConversations = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid }).populate('friends', 'name avatar games skillLevel location');
    if (!me) return res.json([]);

    const conversations = await Promise.all(
      (me.friends as any[]).map(async (friend: any) => {
        // Last message between me and this friend
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: me._id, receiverId: friend._id },
            { senderId: friend._id, receiverId: me._id },
          ],
        }).sort({ createdAt: -1 });

        // Unread count: messages sent by friend to me that are not read
        const unreadCount = await Message.countDocuments({
          senderId: friend._id,
          receiverId: me._id,
          read: false,
        });

        return {
          friend: {
            _id: friend._id,
            name: friend.name,
            avatar: friend.avatar,
            games: friend.games,
            skillLevel: friend.skillLevel,
            location: friend.location,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isMine: lastMessage.senderId.toString() === me._id.toString(),
              }
            : null,
          unreadCount,
        };
      })
    );

    // Sort by last message date (most recent first), then by friend name
    conversations.sort((a, b) => {
      const aDate = a.lastMessage?.createdAt?.getTime() ?? 0;
      const bDate = b.lastMessage?.createdAt?.getTime() ?? 0;
      return bDate - aDate;
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get full chat history with a specific friend
export const getConversation = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) return res.status(404).json({ error: 'User not found' });

    // Verify friendship
    const isFriend = me.friends.some((fId) => fId.toString() === friendId);
    if (!isFriend) {
      return res.status(403).json({ error: 'Not friends with this user' });
    }

    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    const messages = await Message.find({
      $or: [
        { senderId: me._id, receiverId: friendObjectId },
        { senderId: friendObjectId, receiverId: me._id },
      ],
    } as any)
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar');

    // Mark all unread messages from friend as read
    await Message.updateMany(
      { senderId: friendId, receiverId: me._id, read: false } as any,
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Get total unread message count (for nav badge)
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) return res.json({ count: 0 });

    const count = await Message.countDocuments({
      receiverId: me._id,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// Get friends list
export const getFriends = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid }).populate(
      'friends',
      'name avatar games skillLevel location bio'
    );
    if (!me) return res.json([]);

    res.json(me.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};
