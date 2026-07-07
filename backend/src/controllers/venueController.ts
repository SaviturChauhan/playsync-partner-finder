import { Request, Response } from 'express';
import axios from 'axios';
import Venue from '../models/Venue';

// Fetch venues from Google Places API and cache them
export const getVenues = async (req: Request, res: Response) => {
  const { city } = req.query; // e.g., 'Lucknow' or 'Jaipur'
  
  if (!city || typeof city !== 'string') {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
    // 1. Check database cache first
    const cachedVenues = await Venue.find({ city: new RegExp(city, 'i') });
    
    if (cachedVenues.length > 0) {
      return res.json(cachedVenues);
    }

    // 2. If no cache, fetch from Google Places API
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API key is missing in environment variables' });
    }

    // Query for sports venues, stadiums, courts
    const query = `sports venues and courts in ${city}`;
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await axios.get(googleApiUrl);
    const places = response.data.results;

    if (!places || places.length === 0) {
      return res.json([]);
    }

    // 3. Transform and save to database cache
    const venuesToSave = places.map((place: any) => ({
      googlePlaceId: place.place_id,
      name: place.name,
      location: place.formatted_address,
      city: city, // normalize this or extract from address components in production
      type: 'Mixed', // Default, could infer based on place types
      games: ['Badminton', 'Tennis', 'Cricket'], // Default mock for now
      rating: place.rating || 4.0
    }));

    // Upsert into DB to avoid duplicates
    const savedVenues = [];
    for (const venue of venuesToSave) {
      const updated = await Venue.findOneAndUpdate(
        { googlePlaceId: venue.googlePlaceId },
        venue,
        { upsert: true, new: true }
      );
      savedVenues.push(updated);
    }

    res.json(savedVenues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
};
