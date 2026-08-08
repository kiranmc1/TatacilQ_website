import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { apiUrl } from '../utils/api'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState('Loading payment details...')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setMessage('No payment session found.')
      return
    }

    const fetchSession = async () => {
      try {
        const response = await fetch(apiUrl(`/Users/payments/checkout-session/${sessionId}`))
        if (!response.ok) {
          throw new Error('Unable to retrieve payment details')
        }
        const session = await response.json()
        setMessage(`Payment successful! Session status: ${session.payment_status}. Order receipt will be sent to your email.`)
      } catch (err) {
        setMessage(err.message || 'Failed to load payment status')
      }
    }

    fetchSession()
  }, [sessionId])

  return (
    <div className="payment-success-page">
      <div className="payment-success-card">
        <h1>Payment Success</h1>
        <p>{message}</p>
        <Link to="/" className="primary-action-btn">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default PaymentSuccess
