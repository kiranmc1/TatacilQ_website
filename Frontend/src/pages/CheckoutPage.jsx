import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import './CheckoutPage.css'

function CheckoutPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true)
        if (productId) {
          const response = await fetch(apiUrl(`/Users/products/${productId}`))
          if (!response.ok) {
            throw new Error('Failed to load product')
          }
          const data = await response.json()
          setCartItems([
            {
              id: data.id,
              productId: data.id,
              name: data.name,
              brand: data.brand,
              price: data.salePrice,
              quantity: 1,
              image: data.image || data.images?.[0],
            },
          ])
        } else {
          const storedCart = window.localStorage.getItem('cliqCart')
          const parsedCart = storedCart ? JSON.parse(storedCart) : []
          setCartItems(Array.isArray(parsedCart) ? parsedCart : [])
        }
      } catch (err) {
        setError(err.message || 'Unable to load checkout details')
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [productId])

  const getAuthToken = () => {
    try {
      const storedUser = window.localStorage.getItem('cliqUser')
      if (!storedUser) return null
      const parsed = JSON.parse(storedUser)
      return parsed?.token
    } catch {
      return null
    }
  }

  const orderTotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
  const shippingCharge = cartItems.length ? 29 : 0
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 5)
  const deliveryDateString = deliveryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })

  const handlePayment = async () => {
    if (!cartItems.length) {
      setError('Your cart is empty.')
      return
    }

    const token = getAuthToken()
    if (!token) {
      alert('Please login first to complete payment.')
      navigate('/')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const body = {
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity || 1,
        })),
      }

      if (paymentMethod === 'Stripe') {
        const response = await fetch(apiUrl('/Users/payments/create-checkout-session'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || 'Failed to create payment session')
        }

        const data = await response.json()
        window.location.href = data.url
        return
      }

      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price,
          total: (item.price || 0) * (item.quantity || 1),
        })),
        shippingAddress: {
          line1: '56 Connaught Place',
          city: 'Delhi',
          state: 'Delhi',
          zipcode: '110001',
          country: 'India',
        },
        paymentMethod,
        paymentStatus: 'paid',
        shippingCharge,
        offerSummary: [],
      }

      const response = await fetch(apiUrl('/Users/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to place order')
      }

      const order = await response.json()
      window.localStorage.setItem('cliqCart', JSON.stringify([]))
      window.dispatchEvent(new Event('cartUpdated'))
      setSuccessMessage('Your order has been placed successfully!')
      setOrderId(order.id)
    } catch (err) {
      setError(err.message || 'Unable to complete payment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-card">
          <div className="checkout-topbar">
            <div>
              <h1>Checkout</h1>
              <p>Preparing your order details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cartItems.length) {
    return (
      <div className="checkout-page">
        <div className="checkout-card">
          <div className="checkout-topbar">
            <div>
              <h1>Checkout</h1>
              <p>Your cart is empty. Add items and return to checkout.</p>
            </div>
          </div>
          <Link to="/" className="back-to-home">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <div className="checkout-topbar">
          <div>
            <h1>Checkout</h1>
            <p>Review your cart and complete the payment in seconds.</p>
          </div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-left">
            <section className="checkout-section">
              <div className="section-header">
                <h2>Order Summary</h2>
                <p>Items in your bag are ready for checkout.</p>
              </div>
              {cartItems.map((item) => (
                <div key={item.productId || item.id} className="checkout-product-card">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-product-info">
                    <h3>{item.name}</h3>
                    <p>{item.brand}</p>
                    <div className="checkout-price-qty">
                      <span>Qty: {item.quantity}</span>
                      <span>₹{item.price}</span>
                    </div>
                  </div>
                  <div className="checkout-product-meta">
                    <p className="checkout-product-price">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}

              <div className="checkout-pricing">
                <div className="checkout-pricing-row">
                  <span>Subtotal</span>
                  <span className="price-highlight">₹{orderTotal}</span>
                </div>
                <div className="checkout-pricing-row">
                  <span>Shipping</span>
                  <span>₹{shippingCharge}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Total</span>
                  <span>₹{orderTotal + shippingCharge}</span>
                </div>
              </div>
            </section>

            <section className="checkout-section shipping-card">
              <div className="section-header">
                <h3>Delivery Address</h3>
              </div>
              <p>56 Connaught Place</p>
              <p>Delhi, Delhi 110001</p>
              <p>India</p>
              <div className="shipping-badge">Cash on Delivery available</div>
              <div className="shipping-delivery-date">
                <span className="delivery-icon">🚚</span>
                <span>Estimated delivery by {deliveryDateString}</span>
              </div>
            </section>
          </div>

          <aside className="checkout-right payment-panel">
            <section className="checkout-section payment-summary">
              <div className="section-header">
                <h2>Payment</h2>
                <p>Select a payment method to continue.</p>
              </div>
              <div className="payment-methods">
                {['Stripe', 'Dummy'].map((method) => (
                  <label key={method} className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    {method}
                  </label>
                ))}
              </div>
              <div className="payment-summary-row">
                <span>Selected flow</span>
                <strong>{paymentMethod === 'Stripe' ? 'Stripe Checkout' : 'Dummy test order'}</strong>
              </div>
              <div className="payment-summary-row">
                <span>Items</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="payment-summary-total">
                <span>Payable</span>
                <span>₹{orderTotal + shippingCharge}</span>
              </div>
            </section>

            <div className="checkout-action-row">
              <button
                type="button"
                className="primary-action-btn"
                onClick={handlePayment}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : paymentMethod === 'Dummy' ? `Pay ₹${orderTotal + shippingCharge} (Dummy)` : `Pay ₹${orderTotal + shippingCharge}`}
              </button>
              <button type="button" className="secondary-action-btn" onClick={() => navigate(-1)}>
                Back to Shopping
              </button>
            </div>

            {error && <p className="checkout-error">{error}</p>}
            {successMessage && (
              <div className="checkout-success">
                <p>{successMessage}</p>
                <p>Your order ID is <strong>{orderId}</strong></p>
                <button type="button" className="primary-action-btn" onClick={() => navigate('/')}>Continue Shopping</button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
