require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Message = require('./backend/src/models/Message').default || require('./backend/src/models/Message');
  console.log("Connected");
  process.exit(0);
});
