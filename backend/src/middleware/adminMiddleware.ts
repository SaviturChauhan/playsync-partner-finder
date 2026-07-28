import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
