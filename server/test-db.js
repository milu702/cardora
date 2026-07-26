const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const localUri = 'mongodb://127.0.0.1:27017/cardora';
console.log('Testing connection to Local MongoDB:', localUri);

mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 })
.then((conn) => {
  console.log('✅ LOCAL MONGO SUCCESS! Connected to:', conn.connection.host);
  console.log('Connected Database Name:', conn.connection.name);
  process.exit(0);
})
.catch((err) => {
  console.error('❌ LOCAL MONGO ERROR:', err.message);
  process.exit(1);
});
