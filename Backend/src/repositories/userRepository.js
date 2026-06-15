const { ObjectId } = require('mongodb');
const { connectDb } = require('../config/db');

const toUserPayload = (user) => {
    if (!user) return null;

    const { _id, ...rest } = user;
    return {
        id: _id ? _id.toString() : rest.id,
        ...rest
    };
};

exports.findById = async (id) => {
    const db = await connectDb();

    const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { id };

    const user = await db.collection('Users').findOne(query);
    return toUserPayload(user);
};

exports.getDashboardData = async (userId) => {
    const db = await connectDb();

    const user = await db.collection('Users').findOne({
        _id: new ObjectId(userId)
    });

    const totalProducts = await db.collection('products').countDocuments();
    const recentProducts = await db.collection('products')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ _id: 1, name: 1, price: 1, image: 1, categoryId: 1, brandId: 1, createdAt: 1 })
        .toArray();

    return {
        user: toUserPayload(user),
        stats: {
            totalProducts,
            totalCategories: await db.collection('Categories').countDocuments()
        },
        recentProducts
    };
};

exports.getAllCategories = async () => {
    const db = await connectDb();

    const categories = await db.collection('Categories')
        .find({})
        .project({ _id: 1, name: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .toArray();

    return categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        createdAt: category.createdAt
    }));
};