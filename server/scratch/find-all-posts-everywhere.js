const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const atlasUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const localUri = 'mongodb://127.0.0.1:27017/cardora';

async function findAllPosts() {
  const localConn = await mongoose.createConnection(localUri).asPromise();
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();

  console.log('\n================ SEARCHING LOCAL MONGO FOR ANY POSTS ================');
  const localCols = await localConn.db.listCollections().toArray();
  for (const c of localCols) {
    const docs = await localConn.db.collection(c.name).find().toArray();
    for (const d of docs) {
      if (d.content || d.description || d.text || d.title || d.post) {
        console.log(`Found post-like doc in Local "${c.name}":`, {
          id: d._id,
          author: d.authorName || d.username || d.userName || d.name,
          content: d.content || d.description || d.text || d.title
        });
      }
    }
  }

  console.log('\n================ SEARCHING ATLAS MONGO FOR ALL POSTS ================');
  const atlasCols = await atlasConn.db.listCollections().toArray();
  for (const c of atlasCols) {
    const docs = await atlasConn.db.collection(c.name).find().toArray();
    for (const d of docs) {
      if ((d.content || d.description || d.text || d.title || d.post) && c.name !== 'systemalerts' && c.name !== 'recommendations' && c.name !== 'marketplacelistings' && c.name !== 'plantations') {
        console.log(`Found post in Atlas "${c.name}":`, {
          id: d._id,
          author: d.authorName || d.username || d.userName || d.user,
          content: d.content || d.description || d.text || d.title
        });
      }
    }
  }

  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

findAllPosts().catch(e => console.error(e));
