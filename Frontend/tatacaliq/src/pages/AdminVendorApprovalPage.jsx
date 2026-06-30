import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function AdminVendorApprovalPage() {
  const [pendingProducts, setPendingProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const storedUser = window.localStorage.getItem('cliqUser')
        const parsedUser = storedUser ? JSON.parse(storedUser) : null
        if (!parsedUser?.token) {
          return
        }

        const response = await fetch('http://127.0.0.1:2000/Users/admin/vendor-products', {
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || 'Unable to fetch pending products')
        }

        const data = await response.json()
        setPendingProducts(data)
      } catch (error) {
        console.warn(error)
        setMessage(error.message || 'Unable to load pending products')
      } finally {
        setLoading(false)
      }
    }

    fetchPending()
  }, [])

  const handleApprove = async (productId) => {
    try {
      setMessage('')
      const storedUser = window.localStorage.getItem('cliqUser')
      const parsedUser = storedUser ? JSON.parse(storedUser) : null
      if (!parsedUser?.token) {
        setMessage('Unable to approve without login.')
        return
      }

      const response = await fetch(`http://127.0.0.1:2000/Users/admin/vendor-products/${productId}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${parsedUser.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Approval failed')
      }

      setPendingProducts((prev) => prev.filter((product) => product._id !== productId && product.id !== productId))
      setMessage('Product approved successfully.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div style={{ padding: '2rem', minHeight: '70vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: '#d70b5c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.35rem' }}>Admin Approval</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Vendor Product Review</h1>
            <p style={{ color: '#4b5563', margin: 0 }}>Approve or reject submitted vendor products before they become public.</p>
          </div>
          <Link to="/" style={{ textDecoration: 'none', color: 'white', background: '#d70b5c', padding: '0.85rem 1.25rem', borderRadius: '999px', fontWeight: 700 }}>Back to Home</Link>
        </div>

        {message && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '14px', background: '#fef3c7', color: '#92400e' }}>
            {message}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1.5rem', color: '#6b7280' }}>Loading pending vendor products…</p>
        ) : pendingProducts.length === 0 ? (
          <p style={{ marginTop: '1.5rem', color: '#6b7280' }}>No pending vendor products.</p>
        ) : (
          <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
            {pendingProducts.map((product) => (
              <div key={product._id || product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '18px', padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{product.name}</h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#4b5563' }}>Brand: {product.brand}</p>
                    <p style={{ margin: '0.25rem 0 0', color: '#4b5563' }}>Category: {product.categoryid || product.categoryId || 'Unknown'}</p>
                    <p style={{ margin: '0.25rem 0 0', color: '#4b5563' }}><strong>Status:</strong> {product.status}</p>
                  </div>
                  <button
                    onClick={() => handleApprove(product._id || product.id)}
                    style={{ border: 'none', borderRadius: '999px', background: '#16a34a', color: 'white', padding: '0.85rem 1.25rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminVendorApprovalPage
