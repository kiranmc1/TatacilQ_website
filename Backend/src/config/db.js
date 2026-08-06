const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error('Missing MongoDB configuration in environment variables');
}

let client;
let db;

async function connectDb() {
  if (db) return db;

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  db = client.db(dbName);
  return db;
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connectDb, closeDb };
