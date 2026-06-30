const { connectDb } = require('./src/config/db');
(async () => {
  try {
    const db = await connectDb();
    const admins = await db.collection('Users').find({ isAdmin: true }).toArray();
    const vendors = await db.collection('Users').find({ isVendor: true }).toArray();
    console.log('admins:', admins.map(u => ({ id: u._id.toString(), email: u.email, phone: u.phone, isAdmin: u.isAdmin, isVendor: u.isVendor })));
    console.log('vendors:', vendors.map(u => ({ id: u._id.toString(), email: u.email, phone: u.phone, isAdmin: u.isAdmin, isVendor: u.isVendor })));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
