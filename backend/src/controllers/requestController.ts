import { Request, Response } from 'express';
import MatchRequest from '../models/MatchRequest';
import User from '../models/User';

// Create a new match request
export const createRequest = async (req: Request, res: Response) => {
  try {
    const { receiverId, venueId, game, scheduledTime, message } = req.body;
    
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    // Find sender by firebaseUid
    const sender = await User.findOne({ firebaseUid: uid });
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    const newRequest = new MatchRequest({
      senderId: sender._id,
      receiverId,
      venueId,
      game,
      scheduledTime,
      message,
      status: 'pending'
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
};

// Get requests received by current user (inbox)
export const getMyRequests = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) {
      // User authenticated but not synced to DB yet — return empty inbox
      return res.json([]);
    }

    const requests = await MatchRequest.find({ receiverId: me._id })
      .populate('senderId', 'name skillLevel location games avatar')
      .populate('venueId', 'name location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

// Get requests sent by current user
export const getSentRequests = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) {
      // User authenticated but not synced to DB yet — return empty sent list
      return res.json([]);
    }

    const requests = await MatchRequest.find({ senderId: me._id })
      .populate('receiverId', 'name skillLevel location games avatar')
      .populate('venueId', 'name location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
};

// Get match history (accepted requests that are in the past, or completed)
export const getMatchHistory = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) {
      // User authenticated but not synced to DB yet — return empty history
      return res.json({ upcoming: [], past: [] });
    }

    const now = new Date();

    // Upcoming: accepted requests with future scheduledTime
    const upcoming = await MatchRequest.find({
      $or: [{ senderId: me._id }, { receiverId: me._id }],
      status: 'accepted',
      scheduledTime: { $gte: now },
    })
      .populate('senderId', 'name skillLevel location games avatar')
      .populate('receiverId', 'name skillLevel location games avatar')
      .populate('venueId', 'name location')
      .sort({ scheduledTime: 1 });

    // Past: accepted requests with past scheduledTime
    const past = await MatchRequest.find({
      $or: [{ senderId: me._id }, { receiverId: me._id }],
      status: 'accepted',
      scheduledTime: { $lt: now },
    })
      .populate('senderId', 'name skillLevel location games avatar')
      .populate('receiverId', 'name skillLevel location games avatar')
      .populate('venueId', 'name location')
      .sort({ scheduledTime: -1 })
      .limit(20);

    res.json({ upcoming, past });
  } catch (error) {
    console.error('Error fetching match history:', error);
    res.status(500).json({ error: 'Failed to fetch match history' });
  }
};

// Respond to a request (accept or decline)
export const respondToRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matchReq = await MatchRequest.findOneAndUpdate(
      { _id: requestId, receiverId: me._id } as any,
      { status },
      { new: true }
    );

    if (!matchReq) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Auto-add each other as friends when request is accepted
    if (status === 'accepted') {
      await User.findByIdAndUpdate(matchReq.senderId, {
        $addToSet: { friends: matchReq.receiverId },
      });
      await User.findByIdAndUpdate(matchReq.receiverId, {
        $addToSet: { friends: matchReq.senderId },
      });
    }

    res.json(matchReq);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

// Cancel a request (sender can cancel their own pending/accepted requests)
export const cancelRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matchReq = await MatchRequest.findOneAndUpdate(
      { 
        _id: requestId, 
        $or: [{ senderId: me._id }, { receiverId: me._id }],
        status: { $in: ['pending', 'accepted'] } 
      } as any,
      { status: 'cancelled' },
      { new: true }
    );

    if (!matchReq) {
      return res.status(404).json({ error: 'Request not found or cannot be cancelled' });
    }

    res.json(matchReq);
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
};
