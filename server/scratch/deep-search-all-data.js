const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const localUri = 'mongodb://127.0.0.1:27017/cardora';

async function deepSearch() {
  console.log('=================== DEEP SEARCHING LOCAL MONGO ===================');
  try {
    const localConn = await mongoose.createConnection(localUri).asPromise();
    const cols = await localConn.db.listCollections().toArray();
    for (const c of cols) {
      const docs = await localConn.db.collection(c.name).find().toArray();
      console.log(`\nLocal Collection "${c.name}" -> ${docs.length} documents:`);
      for (const d of docs) {
        console.log(JSON.stringify(d, null, 2));
      }
    }
    await localConn.close();
  } catch (err) {
    console.error('Local Mongo error:', err.message);
  }

  console.log('\n=================== DEEP SEARCHING ATLAS MONGO ===================');
  try {
    const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
    const cols = await atlasConn.db.listCollections().toArray();
    for (const c of cols) {
      const docs = await atlasConn.db.collection(c.name).find().toArray();
      console.log(`\nAtlas Collection "${c.name}" -> ${docs.length} documents:`);
      for (const d of docs) {
        console.log(JSON.stringify(d, null, 2));
      }
    }
    await atlasConn.close();
  } catch (err) {
    console.error('Atlas Mongo error:', err.message);
  }

  process.exit(0);
}

deepSearch();
