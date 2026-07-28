import { Request, Response } from 'express';
import Community from '../models/Community';
import User from '../models/User';

// Create a new community
export const createCommunity = async (req: Request, res: Response) => {
  try {
    const { name, description, location, city, type, games } = req.body;
    
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) return res.status(404).json({ error: 'User not found' });

    const community = new Community({
      name,
      description: description || '',
      location,
      city,
      type: type || 'Club',
      games: games || [],
      members: [me._id],
      admin: me._id,
    });

    await community.save();
    res.status(201).json(community);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
};

// Get all communities (with optional city/game filters)
export const getCommunities = async (req: Request, res: Response) => {
  try {
    const { city, game } = req.query;
    const query: any = {};

    if (city && city !== 'All') {
      query.city = new RegExp(city as string, 'i');
    }
    if (game) {
      query.games = { $in: [game] };
    }

    const communities = await Community.find(query)
      .populate('admin', 'name')
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
};

// Get communities the current user belongs to
export const getMyCommunities = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) return res.status(404).json({ error: 'User not found' });

    const communities = await Community.find({ members: me._id })
      .populate('admin', 'name')
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (error) {
    console.error('Error fetching my communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
};

// Join a community
export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) return res.status(404).json({ error: 'User not found' });

    const community = await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { members: me._id } },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
};

// Leave a community
export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const me = await User.findOne({ firebaseUid: uid });
    if (!me) return res.status(404).json({ error: 'User not found' });

    const community = await Community.findByIdAndUpdate(
      communityId,
      { $pull: { members: me._id } },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
};

// Get single community with members
export const getCommunityById = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId)
      .populate('admin', 'name avatar')
      .populate('members', 'name avatar skillLevel games');

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
};
