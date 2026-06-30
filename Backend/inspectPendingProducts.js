const { connectDb } = require('./src/config/db');
(async () => {
  try {
    const db = await connectDb();
    const total = await db.collection('Products').countDocuments();
    const pending = await db.collection('Products').find({ approved: false, status: 'pending' }).limit(20).toArray();
    console.log('total products:', total);
    console.log('pending count:', pending.length);
    console.log(JSON.stringify(pending, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
