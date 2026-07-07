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

// Get requests for current user (inbox)
export const getMyRequests = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) {
      return res.status(404).json({ error: 'User not found' });
    }

    const requests = await MatchRequest.find({ receiverId: me._id })
      .populate('senderId', 'name skillLevel location')
      .populate('venueId', 'name location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

// Respond to a request
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

    res.json(matchReq);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
};
