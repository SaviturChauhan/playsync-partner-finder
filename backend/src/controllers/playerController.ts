import { Request, Response } from 'express';
import User from '../models/User';

// Get players based on filters (city, skill)
export const getPlayers = async (req: Request, res: Response) => {
  try {
    const { city, skill } = req.query;
    
    // Build query object
    const query: any = {};
    
    if (city && city !== 'All') {
      query.location = new RegExp(city as string, 'i');
    }
    
    if (skill) {
      query.skillLevel = skill;
    }

    // Exclude the current user from the results if they are authenticated
    if (req.user?.uid) {
      query.firebaseUid = { $ne: req.user.uid };
    }

    const players = await User.find(query).select('-email -phone -createdAt -updatedAt');
    
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};
