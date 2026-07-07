import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/connect';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import venueRoutes from './routes/venueRoutes';
import userRoutes from './routes/userRoutes';
import playerRoutes from './routes/playerRoutes';
import requestRoutes from './routes/requestRoutes';

// Routes
app.use('/api/venues', venueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/requests', requestRoutes);
app.get('/health', (req, res) => res.send('PlaySync API is running'));

// Start server
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
