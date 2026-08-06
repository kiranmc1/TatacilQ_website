const Stripe = require('stripe');
const userService = require('../services/Userservice');
const orderService = require('../services/orderService');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity = 1, items } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    let cartItems = [];
    if (items && Array.isArray(items) && items.length) {
      for (const item of items) {
        const product = await userService.getProductById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.productId}` });
        }
        cartItems.push({
          product,
          quantity: Number(item.quantity) || 1,
        });
      }
    } else if (productId) {
      const product = await userService.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      cartItems = [{ product, quantity: Number(quantity) || 1 }];
    } else {
      return res.status(400).json({ message: 'productId or items are required' });
    }

    const domain = process.env.FRONTEND_URL;
    if (!domain) {
      return res.status(500).json({ message: 'FRONTEND_URL is not configured' });
    }
    const lineItems = cartItems.map(({ product, quantity }) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: product.name || 'Product',
          images: product.images?.length ? [product.images[0]] : [],
        },
        unit_amount: Math.round((product.salePrice || 0) * 100),
      },
      quantity: Number(quantity),
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${domain}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/checkout`,
      metadata: {
        cart: JSON.stringify(cartItems.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        }))),
        userId,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation failed', err);
    res.status(500).json({ message: err.message || 'Unable to create checkout session' });
  }
};

exports.getCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (err) {
    console.error('Stripe session retrieval failed', err);
    res.status(500).json({ message: err.message || 'Unable to retrieve checkout session' });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    let cartItems = [];

    if (metadata.cart) {
      try {
        cartItems = JSON.parse(metadata.cart);
      } catch (err) {
        console.warn('Unable to parse cart metadata from Stripe session', err.message);
      }
    }

    if (!cartItems.length && metadata.productId) {
      const quantity = Number(metadata.quantity || 1);
      cartItems = [{ productId: metadata.productId, quantity }]
    }

    if (userId && cartItems.length) {
      try {
        const orderItems = [];

        for (const item of cartItems) {
          const product = await userService.getProductById(item.productId);
          if (!product) {
            console.warn('Stripe webhook product not found', item.productId);
            continue;
          }
          orderItems.push({
            productId: product.id,
            name: product.name,
            quantity: Number(item.quantity) || 1,
            price: product.salePrice,
            total: product.salePrice * (Number(item.quantity) || 1),
          });
        }

        if (orderItems.length) {
          await orderService.createOrder({
            userId,
            items: orderItems,
            shippingAddress: {
              line1: '56 Connaught Place',
              city: 'Delhi',
              state: 'Delhi',
              zipcode: '110001',
              country: 'India',
            },
            paymentMethod: 'Card',
            paymentStatus: 'paid',
            shippingCharge: 29,
            offerSummary: [],
          });
        }
      } catch (err) {
        console.error('Failed to create order from Stripe webhook', err);
      }
    }
  }

  res.json({ received: true });
};
