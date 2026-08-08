const { ObjectId } = require('mongodb');
const { connectDb } = require('../config/db');

const toOrderPayload = (order) => {
    if (!order) return null;

    return {
        id: order._id ? order._id.toString() : order.id,
        userId: order.userId && ObjectId.isValid(order.userId) ? order.userId.toString() : order.userId,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        items: order.items,
        pricing: order.pricing,
        offerSummary: order.offerSummary,
        loyalty: order.loyalty,
        delivery: order.delivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    };
};

const buildUserQuery = (userId) => {
    if (ObjectId.isValid(userId)) {
        return { userId: new ObjectId(userId) };
    }
    return { userId };
};

exports.createOrder = async (orderData) => {
    const db = await connectDb();
    const now = new Date();
    const payload = {
        ...orderData,
        userId: ObjectId.isValid(orderData.userId) ? new ObjectId(orderData.userId) : orderData.userId,
        createdAt: now,
        updatedAt: now
    };

    const result = await db.collection('Orders').insertOne(payload);
    const order = await db.collection('Orders').findOne({ _id: result.insertedId });
    return toOrderPayload(order);
};

exports.getOrdersByUser = async (userId) => {
    const db = await connectDb();
    const query = buildUserQuery(userId);

    const orders = await db.collection('Orders')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

    return orders.map(toOrderPayload);
};

exports.getOrderById = async (orderId, userId) => {
    const db = await connectDb();

    const query = {
        _id: new ObjectId(orderId),
        ...buildUserQuery(userId)
    };

    const order = await db.collection('Orders').findOne(query);
    return toOrderPayload(order);
};

exports.updateOrderStatus = async (orderId, userId, status) => {
    const db = await connectDb();
    const query = {
        _id: new ObjectId(orderId),
        ...buildUserQuery(userId)
    };

    const result = await db.collection('Orders').findOneAndUpdate(
        query,
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );

    return toOrderPayload(result.value);
};
