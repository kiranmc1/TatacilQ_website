import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function CartPage() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const storedCart = window.localStorage.getItem('cliqCart')
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart))
      } catch {
        setCartItems([])
      }
    }
  }, [])

  const updateQuantity = (productId, change) => {
    setCartItems((prevItems) => {
      const nextItems = prevItems.map((item) => {
        if (item.id !== productId) return item
        return { ...item, quantity: Math.max(1, item.quantity + change) }
      })
      window.localStorage.setItem('cliqCart', JSON.stringify(nextItems))
      window.dispatchEvent(new Event('cartUpdated'))
      return nextItems
    })
  }

  const removeItem = (productId) => {
    setCartItems((prevItems) => {
      const nextItems = prevItems.filter((item) => item.id !== productId)
      window.localStorage.setItem('cliqCart', JSON.stringify(nextItems))
      window.dispatchEvent(new Event('cartUpdated'))
      return nextItems
    })
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)

  return (
    <div className="cart-page">
      <div className="cart-page-card">
        <div className="cart-page-header">
          <div>
            <h1>Your Cart</h1>
            <p>{cartItems.length ? `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in cart` : 'Your cart is empty.'}</p>
          </div>
          <Link to="/" className="secondary-action-btn cart-continue-btn">Continue Shopping</Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <p>No items have been added to your cart yet.</p>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <img src={item.image || item.images?.[0]} alt={item.name} />
                  <div className="cart-item-details">
                    <h2>{item.name}</h2>
                    <p>{item.brand}</p>
                    <div className="cart-item-actions">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item-meta">
                    <p>₹{item.price}</p>
                    <button type="button" className="cart-remove-button" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>₹{totalPrice}</strong>
              </div>
              <p>Deliveries and payment options will be shown on checkout.</p>
              <button
                type="button"
                className="primary-action-btn"
                onClick={() => {
                  if (cartItems.length > 0) {
                    navigate('/checkout')
                  }
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
