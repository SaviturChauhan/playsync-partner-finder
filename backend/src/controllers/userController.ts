import { Request, Response } from 'express';
import User from '../models/User';

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { name, games, skillLevel, location } = req.body;
    
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
        location: location || '' 
      },
      { new: true, upsert: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
