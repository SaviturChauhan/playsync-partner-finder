import { Request, Response } from 'express';
import User from '../models/User';

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { name, games, skillLevel, location, availability, bio } = req.body;
    
    // req.user is populated by the verifyToken middleware
    const firebaseUid = req.user?.uid;
    const email = req.user?.email;
    const phone = req.user?.phone_number;

    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Upsert the user
    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { 
        firebaseUid, 
        name: name || req.user?.name || 'Player',
        email, 
        phone, 
        games: games || [], 
        skillLevel: skillLevel || 'Intermediate', 
        location: location || '',
        availability: availability || { days: [], timeSlots: [] },
        bio: bio || '',
      },
      { new: true, upsert: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user's profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update current user's profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowedFields = ['name', 'games', 'skillLevel', 'location', 'availability', 'bio', 'avatar'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
