const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const localUri = 'mongodb://127.0.0.1:27017/cardora';

async function checkLocal() {
  console.log('\n=================== LOCAL MONGO (127.0.0.1:27017) ===================');
  try {
    const localConn = await mongoose.createConnection(localUri, { serverSelectionTimeoutMS: 3000 }).asPromise();
    console.log('✅ Connected to Local Mongo!');
    const db = localConn.db;
    const collections = await db.listCollections().toArray();
    console.log('Local Collections:', collections.map(c => c.name));

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`\n--- Local Collection: "${col.name}" (${count} docs) ---`);
      if (count > 0) {
        const docs = await db.collection(col.name).find().limit(5).toArray();
        console.log(JSON.stringify(docs, null, 2));
      }
    }
    await localConn.close();
  } catch (err) {
    console.log('Local Mongo connection error or not running:', err.message);
  }
}

async function checkAtlas() {
  console.log('\n=================== ATLAS MONGO (Cluster0) ===================');
  try {
    const atlasConn = await mongoose.createConnection(atlasUri, { serverSelectionTimeoutMS: 5000 }).asPromise();
    console.log('✅ Connected to Atlas Mongo!');
    const db = atlasConn.db;
    const collections = await db.listCollections().toArray();
    console.log('Atlas Collections:', collections.map(c => c.name));

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`\n--- Atlas Collection: "${col.name}" (${count} docs) ---`);
      if (count > 0) {
        const docs = await db.collection(col.name).find().limit(5).toArray();
        console.log(JSON.stringify(docs, null, 2));
      }
    }
    await atlasConn.close();
  } catch (err) {
    console.log('Atlas Mongo error:', err.message);
  }
}

async function run() {
  await checkLocal();
  await checkAtlas();
  process.exit(0);
}

run();
