/**
 * Run this script to grant admin role to a user.
 * Usage: node make-admin.js your@email.com
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address:');
  console.error('   node make-admin.js your@email.com');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function makeAdmin() {
  console.log(`\n🔗 Connecting to MongoDB Atlas...`);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected!\n');

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'admin' } },
    { new: true }
  );

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    console.log('\n💡 Tip: Make sure you have logged in to the app first to create your account.');
    
    // List all users to help debug
    const allUsers = await User.find({}, { name: 1, email: 1, role: 1 });
    if (allUsers.length > 0) {
      console.log('\n📋 Existing users in database:');
      allUsers.forEach(u => console.log(`   - ${u.name || '(no name)'} | ${u.email || '(no email)'} | role: ${u.role || 'user'}`));
    } else {
      console.log('\n⚠️  No users found in database at all. Log in to the app first!');
    }
  } else {
    console.log(`✅ Success! "${user.name || user.email}" is now an admin.`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role:  ${user.role}`);
    console.log('\n🎉 You can now access the Admin Dashboard at http://localhost:3000/admin\n');
  }

  await mongoose.disconnect();
  process.exit(0);
}

makeAdmin().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
