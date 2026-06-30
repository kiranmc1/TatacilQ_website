import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const initialForm = {
  categoryName: '',
  brand: '',
  name: '',
  originalPrice: '',
  salePrice: '',
  discount: '',
  ratings: '',
  reviews: '',
  offers: '',
  ratingText: '',
  images: '',
}

function VendorPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [statusList, setStatusList] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitStatus, setSubmitStatus] = useState('')

  useEffect(() => {
    const storedUser = window.localStorage.getItem('cliqUser')
    if (!storedUser) {
      navigate('/')
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      if (!parsedUser?.token) {
        navigate('/')
        return
      }

      const verifyAccess = async () => {
        try {
          const response = await fetch('http://127.0.0.1:2000/Users/me', {
            headers: {
              Authorization: `Bearer ${parsedUser.token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Unauthorized')
          }

          const data = await response.json()
          if (!data.user?.isVendor) {
            navigate('/')
            return
          }

          setUser({ ...parsedUser, ...data.user })
          await loadVendorProducts(parsedUser.token)
        } catch (error) {
          console.warn('Vendor access validation failed', error)
          navigate('/')
        }
      }

      verifyAccess()
    } catch (error) {
      console.warn('Unable to parse stored user', error)
      navigate('/')
    }
  }, [navigate])

  const loadVendorProducts = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:2000/Users/vendor/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Unable to load vendor products')
      }
      const data = await response.json()
      setStatusList(data)
    } catch (error) {
      console.warn(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitStatus('')

    const storedUser = window.localStorage.getItem('cliqUser')
    const parsedUser = storedUser ? JSON.parse(storedUser) : null
    if (!parsedUser?.token) {
      setSubmitStatus('Please log in again.')
      return
    }

    const payload = {
      categoryName: form.categoryName.trim(),
      brand: form.brand.trim(),
      name: form.name.trim(),
      originalPrice: Number(form.originalPrice),
      salePrice: Number(form.salePrice),
      discount: Number(form.discount || 0),
      ratings: Number(form.ratings || 0),
      reviews: Number(form.reviews || 0),
      offers: form.offers.split(',').map((o) => o.trim()).filter(Boolean),
      ratingText: form.ratingText.trim(),
      images: form.images.split(',').map((i) => i.trim()).filter(Boolean),
    }

    try {
      const response = await fetch('http://127.0.0.1:2000/Users/vendor/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${parsedUser.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await response.json() : null
      if (!response.ok) {
        const message = data?.message || (await response.text()) || 'Unable to submit product'
        throw new Error(message)
      }

      setSubmitStatus('Product submitted for approval.')
      setForm(initialForm)
      await loadVendorProducts(parsedUser.token)
    } catch (error) {
      setSubmitStatus(error.message)
    }
  }

  return (
    <div style={{ padding: '2rem', minHeight: '70vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: '#0f766e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.35rem' }}>Vendor Portal</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Submit Products for Approval</h1>
            <p style={{ color: '#4b5563', margin: 0 }}>Submit new brand products and track approval status here.</p>
          </div>
          <Link to="/" style={{ textDecoration: 'none', color: 'white', background: '#0f766e', padding: '0.85rem 1.25rem', borderRadius: '999px', fontWeight: 700 }}>Back to Home</Link>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1.2fr 0.8fr' }}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={labelStyle}>
                  Category Name
                  <input name="categoryName" value={form.categoryName} onChange={handleChange} style={inputStyle} placeholder="Men" />
                </label>
                <label style={labelStyle}>
                  Brand
                  <input name="brand" value={form.brand} onChange={handleChange} style={inputStyle} placeholder="U.S. Polo Assn." />
                </label>
              </div>
              <label style={labelStyle}>
                Product Name
                <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="Blue Cotton Striped T-Shirt" />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={labelStyle}>
                  Original Price
                  <input name="originalPrice" value={form.originalPrice} onChange={handleChange} style={inputStyle} type="number" placeholder="2499" />
                </label>
                <label style={labelStyle}>
                  Sale Price
                  <input name="salePrice" value={form.salePrice} onChange={handleChange} style={inputStyle} type="number" placeholder="1749" />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={labelStyle}>
                  Discount
                  <input name="discount" value={form.discount} onChange={handleChange} style={inputStyle} type="number" placeholder="30" />
                </label>
                <label style={labelStyle}>
                  Ratings
                  <input name="ratings" value={form.ratings} onChange={handleChange} style={inputStyle} type="number" step="0.1" placeholder="4.4" />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={labelStyle}>
                  Reviews
                  <input name="reviews" value={form.reviews} onChange={handleChange} style={inputStyle} type="number" placeholder="26" />
                </label>
                <label style={labelStyle}>
                  Rating Text
                  <input name="ratingText" value={form.ratingText} onChange={handleChange} style={inputStyle} placeholder="Popular: Recently wishlisted 55 times" />
                </label>
              </div>
              <label style={labelStyle}>
                Offers (comma separated)
                <input name="offers" value={form.offers} onChange={handleChange} style={inputStyle} placeholder="Buy 2 get 10% off, Buy 3 or more and get 15% off" />
              </label>
              <label style={labelStyle}>
                Image URLs (comma separated)
                <input name="images" value={form.images} onChange={handleChange} style={inputStyle} placeholder="https://...jpg, https://...jpg" />
              </label>
              <button type="submit" style={buttonStyle}>Submit Product for Approval</button>
              {submitStatus && <div style={{ color: '#0f766e', fontWeight: 600 }}>{submitStatus}</div>}
            </form>

            <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Approval status tracker</h2>
              {loading ? (
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your submissions…</p>
              ) : statusList.length === 0 ? (
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>No submitted products yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem' }}>
                  {statusList.map((product) => (
                    <div key={product._id || product.id} style={{ background: 'white', padding: '1rem', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <strong>{product.name}</strong>
                        <span style={{ color: product.status === 'approved' ? '#047857' : '#b45309', fontWeight: 700 }}>{product.status}</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', color: '#4b5563' }}>
                        Brand: {product.brand} • Category: {product.categoryid || product.categoryId || 'Unknown'}
                      </div>
                      <div style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                        Submitted: {new Date(product.submittedAt || product.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'grid',
  gap: '0.35rem',
  fontWeight: 600,
  color: '#111827'
}

const inputStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '0.85rem 0.95rem',
  fontSize: '0.95rem',
  outline: 'none'
}

const buttonStyle = {
  border: 'none',
  background: '#0f766e',
  color: 'white',
  padding: '0.95rem 1.2rem',
  borderRadius: '999px',
  fontWeight: 700,
  cursor: 'pointer'
}

export default VendorPage
