const orderRepo = require('../repositories/orderRepository');

const createOrderNumber = () => {
    const timestamp = Date.now().toString();
    return `ORD${timestamp}`;
};

const buildPricing = (items, shippingCharge = 0) => {
    const totals = items.reduce(
        (acc, item) => {
            const quantity = item.quantity || 1;
            const itemPrice = item.price || 0;
            const discountedPrice = item.discountedPrice != null ? item.discountedPrice : itemPrice;
            acc.mrpTotal += itemPrice * quantity;
            acc.itemsTotal += discountedPrice * quantity;
            return acc;
        },
        { mrpTotal: 0, itemsTotal: 0 }
    );

    const discount = totals.mrpTotal - totals.itemsTotal;
    const grandTotal = totals.itemsTotal + shippingCharge;

    return {
        itemsTotal: totals.itemsTotal,
        mrpTotal: totals.mrpTotal,
        discount: discount > 0 ? discount : 0,
        shippingCharge,
        grandTotal
    };
};

exports.createOrder = async (orderData) => {
    const orderNumber = createOrderNumber();
    const pricing = buildPricing(orderData.items, orderData.shippingCharge);

    const orderPayload = {
        userId: orderData.userId,
        orderNumber,
        status: 'processing',
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        shippingAddress: orderData.shippingAddress,
        items: orderData.items,
        pricing,
        offerSummary: orderData.offerSummary || [],
        loyalty: {
            neucoinsEarned: Math.floor(pricing.grandTotal * 0.01),
            tier: 'Bronze'
        },
        delivery: {
            expectedDate: null,
            carrier: null,
            trackingId: null
        }
    };

    return await orderRepo.createOrder(orderPayload);
};

exports.getOrdersByUser = async (userId) => {
    return await orderRepo.getOrdersByUser(userId);
};

exports.getOrderById = async (orderId, userId) => {
    return await orderRepo.getOrderById(orderId, userId);
};

exports.cancelOrder = async (orderId, userId) => {
    const order = await orderRepo.getOrderById(orderId, userId);
    if (!order) {
        throw new Error('Order not found');
    }

    if (order.status !== 'processing') {
        throw new Error('Only processing orders can be cancelled');
    }

    return await orderRepo.updateOrderStatus(orderId, userId, 'cancelled');
};

exports.trackOrder = async (orderId, userId) => {
    const order = await orderRepo.getOrderById(orderId, userId);
    if (!order) {
        throw new Error('Order not found');
    }

    return {
        orderId: order.id,
        status: order.status,
        delivery: order.delivery,
        orderNumber: order.orderNumber,
        estimatedDelivery: order.delivery.expectedDate
    };
};
