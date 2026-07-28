import { Request, Response } from 'express';
import User from '../models/User';

// Get players based on filters (city, skill, game, availability)
export const getPlayers = async (req: Request, res: Response) => {
  try {
    const { city, skill, game, day, timeSlot } = req.query;
    
    // Build query object
    const query: any = {};
    
    if (city && city !== 'All') {
      query.location = new RegExp(city as string, 'i');
    }
    
    if (skill && skill !== 'All') {
      query.skillLevel = skill;
    }

    if (game && game !== 'All') {
      query.games = { $in: [game] };
    }

    if (day) {
      query['availability.days'] = { $in: Array.isArray(day) ? day : [day] };
    }

    if (timeSlot) {
      query['availability.timeSlots'] = { $in: Array.isArray(timeSlot) ? timeSlot : [timeSlot] };
    }

    // Exclude the current user from the results if they are authenticated
    if (req.user?.uid) {
      query.firebaseUid = { $ne: req.user.uid };
    }

    const players = await User.find(query)
      .select('-email -phone -createdAt -updatedAt -__v')
      .sort({ updatedAt: -1 });
    
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};
