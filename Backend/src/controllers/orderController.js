const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, shippingAddress, paymentMethod, paymentStatus, shippingCharge, offerSummary } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.zipcode) {
            return res.status(400).json({ message: 'Valid shipping address is required' });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        const order = await orderService.createOrder({
            userId,
            items,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentStatus || 'pending',
            shippingCharge: shippingCharge || 0,
            offerSummary: offerSummary || []
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to create order' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await orderService.getOrdersByUser(userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Unable to fetch orders' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await orderService.getOrderById(req.params.id, userId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message || 'Unable to fetch order' });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await orderService.cancelOrder(req.params.id, userId);
        res.json(order);
    } catch (err) {
        const status = err.message === 'Order not found' ? 404 : 400;
        res.status(status).json({ message: err.message || 'Unable to cancel order' });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const tracking = await orderService.trackOrder(req.params.id, userId);
        res.json(tracking);
    } catch (err) {
        const status = err.message === 'Order not found' ? 404 : 400;
        res.status(status).json({ message: err.message || 'Unable to track order' });
    }
};
