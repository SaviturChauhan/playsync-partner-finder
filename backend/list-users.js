/** Lists all users in the DB */
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function listUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}, { name: 1, email: 1, phone: 1, role: 1, location: 1, createdAt: 1 }).sort({ createdAt: -1 });

  if (users.length === 0) {
    console.log('\n⚠️  No users found. Log in to the app at http://localhost:3000/login first!\n');
  } else {
    console.log(`\n📋 Found ${users.length} user(s):\n`);
    users.forEach((u, i) => {
      console.log(`${i + 1}. Name:  ${u.name || '(no name)'}`);
      console.log(`   Email: ${u.email || '(no email)'}`);
      console.log(`   Phone: ${u.phone || '(no phone)'}`);
      console.log(`   Role:  ${u.role || 'user'}`);
      console.log(`   City:  ${u.location || '(not set)'}`);
      console.log('');
    });
    console.log(`💡 To make a user admin, run:`);
    console.log(`   node make-admin.js <email>\n`);
  }
  await mongoose.disconnect();
}

listUsers().catch(err => { console.error('Error:', err.message); process.exit(1); });
