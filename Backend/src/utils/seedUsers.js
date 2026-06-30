require('dotenv').config();
const { ObjectId } = require('mongodb');
const { connectDb } = require('./src/config/db');

const envUsers = [
  {
    role: 'admin',
    flag: 'isAdmin',
    identifierKeys: ['ADMIN_EMAIL', 'ADMIN_PHONE', 'ADMIN_ID'],
  },
  {
    role: 'vendor',
    flag: 'isVendor',
    identifierKeys: ['VENDOR_EMAIL', 'VENDOR_PHONE', 'VENDOR_ID'],
  },
];

const buildIdentifierQuery = (identifier) => {
  if (identifier.email) return { email: identifier.email };
  if (identifier.phone) return { phone: identifier.phone };
  if (identifier.id) {
    return ObjectId.isValid(identifier.id)
      ? { $or: [{ _id: new ObjectId(identifier.id) }, { id: identifier.id }] }
      : { id: identifier.id };
  }
  return null;
};

const collectIdentifier = (keys) => {
  const identifier = {};
  keys.forEach((key) => {
    const value = process.env[key];
    if (value) {
      if (key.endsWith('_EMAIL')) identifier.email = value;
      else if (key.endsWith('_PHONE')) identifier.phone = value;
      else if (key.endsWith('_ID')) identifier.id = value;
    }
  });
  return identifier;
};

async function seed() {
  const db = await connectDb();

  for (const userInfo of envUsers) {
    const identifier = collectIdentifier(userInfo.identifierKeys);
    const query = buildIdentifierQuery(identifier);

    if (!query) {
      console.log(`Skipping ${userInfo.role} setup: no ${userInfo.identifierKeys.join(', ')} provided in .env.`);
      continue;
    }

    const existing = await db.collection('Users').findOne(query);
    if (!existing) {
      console.warn(`No user found for ${userInfo.role} using provided identifiers. Please create the user first in the Users collection.`);
      continue;
    }

    const update = {
      [userInfo.flag]: true,
      updatedAt: new Date(),
    };
    if (userInfo.role === 'admin') {
      update.isVendor = existing.isVendor || false;
    }
    if (userInfo.role === 'vendor') {
      update.isAdmin = existing.isAdmin || false;
    }

    await db.collection('Users').updateOne({ _id: existing._id }, { $set: update });
    console.log(`Updated ${userInfo.role} user: ${existing.email || existing.phone || existing._id.toString()}`);
  }

  console.log('\nSeeder complete. Updated roles based on existing Users collection entries.');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
