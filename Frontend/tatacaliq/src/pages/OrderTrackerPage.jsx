import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function OrderTrackerPage() {
  const [orderId, setOrderId] = useState('')
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState(null)

  useEffect(() => {
    const storedUser = window.localStorage.getItem('cliqUser')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setToken(parsed?.token || null)
      } catch {
        setToken(null)
      }
    }

    const storedOrderId = window.localStorage.getItem('lastOrderId')
    if (storedOrderId) {
      setOrderId(storedOrderId)
    }
  }, [])

  const handleTrackOrder = async () => {
    if (!orderId) {
      setError('Please enter an order ID to track.')
      return
    }

    if (!token) {
      setError('Please log in first to track your order.')
      return
    }

    setError('')
    setLoading(true)
    setTracking(null)

    try {
      const response = await fetch(`http://localhost:2000/Users/orders/${orderId}/track`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.message || 'Unable to fetch tracking details')
      }

      const data = await response.json()
      setTracking(data)
    } catch (err) {
      setError(err.message || 'Unable to track order')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = (step, index) => {
    const stepClass = step.completed ? 'tracker-step completed' : 'tracker-step'
    return (
      <div key={step.id || index} className={stepClass}>
        <div className="tracker-icon">{step.icon}</div>
        <div className="tracker-content">
          <strong>{step.title}</strong>
          <p>{step.description}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="order-tracker-page">
      <div className="order-tracker-card">
        <h1>Track Your Order</h1>
        <p>Enter the order ID to see the current shipment status with icons.</p>

        <div className="order-tracker-input-row">
          <input
            type="text"
            value={orderId}
            placeholder="Enter order ID"
            onChange={(event) => setOrderId(event.target.value)}
          />
          <button type="button" className="primary-action-btn" onClick={handleTrackOrder} disabled={loading}>
            {loading ? 'Loading…' : 'Track Order'}
          </button>
        </div>

        {error && <p className="tracker-error">{error}</p>}

        {tracking && (
          <div className="tracking-result">
            <div className="tracking-summary">
              <div>
                <strong>Order Number</strong>
                <p>{tracking.orderNumber}</p>
              </div>
              <div>
                <strong>Current Status</strong>
                <p>{tracking.status}</p>
              </div>
              <div>
                <strong>Carrier</strong>
                <p>{tracking.delivery?.carrier || 'Tata CLiQ Logistics'}</p>
              </div>
              <div>
                <strong>Tracking ID</strong>
                <p>{tracking.delivery?.trackingId || 'Not assigned yet'}</p>
              </div>
              <div>
                <strong>Estimated Delivery</strong>
                <p>{tracking.estimatedDelivery || 'Not available'}</p>
              </div>
            </div>

            <div className="tracking-steps">
              {(tracking.shipmentSteps || []).map(renderStep)}
            </div>
          </div>
        )}

        <div className="tracker-help-row">
          <p>If you do not know your order ID, you can find it on the checkout success page or in your order confirmation email.</p>
          <Link to="/" className="secondary-action-btn">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

export default OrderTrackerPage
