import { Request, Response } from 'express';
import User from '../models/User';
import MatchRequest from '../models/MatchRequest';
import Community from '../models/Community';

// Get dashboard stats
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeMatches = await MatchRequest.countDocuments({ status: 'accepted', scheduledTime: { $gte: new Date() } });
    const totalCommunities = await Community.countDocuments();
    const pendingRequests = await MatchRequest.countDocuments({ status: 'pending' });

    // Get counts from last month for comparison
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const usersLastMonth = await User.countDocuments({ createdAt: { $lt: lastMonth } });
    const userGrowth = usersLastMonth > 0 ? Math.round(((totalUsers - usersLastMonth) / usersLastMonth) * 100) : 100;

    res.json({
      totalUsers,
      activeMatches,
      totalCommunities,
      pendingRequests,
      userGrowth,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Get all users (paginated)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also clean up their requests
    await MatchRequest.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] } as any);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get recent activity log
export const getActivityLog = async (_req: Request, res: Response) => {
  try {
    // Recent registrations
    const recentUsers = await User.find()
      .select('name location createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent match requests
    const recentMatches = await MatchRequest.find()
      .populate('senderId', 'name location')
      .populate('receiverId', 'name location')
      .populate('venueId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent communities
    const recentCommunities = await Community.find()
      .populate('admin', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Combine and sort by date
    const activities: Array<Record<string, any>> = [];

    for (const user of recentUsers) {
      activities.push({
        type: 'registration',
        action: 'New user registration',
        user: user.name,
        city: user.location,
        time: user.createdAt,
      });
    }

    for (const match of recentMatches) {
      const sender = match.senderId as any;
      activities.push({
        type: 'match',
        action: `Match ${match.status}`,
        user: sender?.name || 'Unknown',
        city: sender?.location || '',
        details: `${match.game} — ${match.status}`,
        time: match.createdAt,
      });
    }

    for (const community of recentCommunities) {
      const admin = community.admin as any;
      activities.push({
        type: 'community',
        action: 'Community Created',
        user: admin?.name || 'Unknown',
        city: community.city,
        details: community.name,
        time: community.createdAt,
      });
    }

    // Sort all activities by time, most recent first
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json(activities.slice(0, 15));
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
};

// Get all unique game categories from users
export const getGameCategories = async (_req: Request, res: Response) => {
  try {
    const games = await User.distinct('games');
    res.json(games.filter(Boolean).sort());
  } catch (error) {
    console.error('Error fetching game categories:', error);
    res.status(500).json({ error: 'Failed to fetch game categories' });
  }
};
