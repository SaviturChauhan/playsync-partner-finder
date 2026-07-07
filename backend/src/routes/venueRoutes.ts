import { Router } from 'express';
import { getVenues } from '../controllers/venueController';

const router = Router();

router.get('/', getVenues);

export default router;
