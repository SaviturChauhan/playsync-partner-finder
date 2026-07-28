/**
 * Migration: Backfill friends from existing accepted MatchRequests
 * 
 * Run with: node migrate-friends.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not found in .env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const matchRequests = db.collection('matchrequests');
  const users = db.collection('users');

  // Find all accepted requests
  const accepted = await matchRequests.find({ status: 'accepted' }).toArray();
  console.log(`Found ${accepted.length} accepted requests to process`);

  let friendPairsAdded = 0;

  for (const req of accepted) {
    const senderId = req.senderId;
    const receiverId = req.receiverId;

    if (!senderId || !receiverId) continue;

    // Add receiverId to sender's friends (if not already there)
    const r1 = await users.updateOne(
      { _id: senderId },
      { $addToSet: { friends: receiverId } }
    );

    // Add senderId to receiver's friends (if not already there)
    const r2 = await users.updateOne(
      { _id: receiverId },
      { $addToSet: { friends: senderId } }
    );

    if (r1.modifiedCount > 0 || r2.modifiedCount > 0) {
      friendPairsAdded++;
      console.log(`  ✓ Linked ${senderId} <-> ${receiverId}`);
    } else {
      console.log(`  · Already friends: ${senderId} <-> ${receiverId}`);
    }
  }

  console.log(`\nDone! ${friendPairsAdded} new friend pair(s) added.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
