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

function AdminPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

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
          if (!data?.user?.isAdmin) {
            navigate('/')
            return
          }

          setUser({ ...parsedUser, isAdmin: true })
        } catch (error) {
          console.warn('Admin access validation failed', error)
          navigate('/')
        }
      }

      verifyAccess()
    } catch (error) {
      console.warn('Unable to parse stored user', error)
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:2000/Users/categories')
        if (!response.ok) {
          throw new Error('Unable to fetch categories')
        }
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      } catch (error) {
        console.warn('Unable to load categories', error)
      }
    }

    loadCategories()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback({ type: '', message: '' })

    if (!form.categoryName || !form.brand || !form.name || !form.originalPrice || !form.salePrice) {
      setFeedback({ type: 'error', message: 'Please fill the category, brand, name, original price and sale price fields.' })
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
      offers: form.offers
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      ratingText: form.ratingText.trim(),
      images: form.images
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('http://127.0.0.1:2000/Users/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to add product')
      }

      setFeedback({ type: 'success', message: 'Product added successfully to the Products collection.' })
      setForm(initialForm)
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to add product' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '2rem', minHeight: '70vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ color: '#d70b5c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.35rem' }}>Protected Portal</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Dashboard</h1>
            <p style={{ color: '#4b5563', margin: 0 }}>
              Add a product and the backend will resolve the matching category ID from the Categories collection before saving it.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'white', background: '#d70b5c', padding: '0.85rem 1.25rem', borderRadius: '999px', fontWeight: 700 }}>Back to Home</Link>
            <Link to="/admin/approvals" style={{ textDecoration: 'none', color: 'white', background: '#047857', padding: '0.85rem 1.25rem', borderRadius: '999px', fontWeight: 700 }}>Review Vendor Products</Link>
            <span style={{ color: '#6b7280', fontWeight: 600 }}>Signed in as {user?.email || user?.phone || 'admin'}</span>
          </div>
        </div>

        {feedback.message ? (
          <div style={{ marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '12px', background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2', color: feedback.type === 'success' ? '#047857' : '#b91c1c' }}>
            {feedback.message}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
                Category Name
                <input name="categoryName" value={form.categoryName} onChange={handleChange} placeholder="e.g. Men" style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
                Brand
                <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. U.S. Polo Assn." style={inputStyle} />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
              Product Name
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Blue Cotton Striped T-Shirt" style={inputStyle} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
                Original Price
                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="2499" style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
                Sale Price
                <input name="salePrice" type="number" value={form.salePrice} onChange={handleChange} placeholder="1749" style={inputStyle} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
                Discount (%)
                <input name="discount" type="number" value={form.discount} onChange={handleChange} placeholder="30" style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
                Ratings
                <input name="ratings" step="0.1" type="number" value={form.ratings} onChange={handleChange} placeholder="4.4" style={inputStyle} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
                Reviews Count
                <input name="reviews" type="number" value={form.reviews} onChange={handleChange} placeholder="26" style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
                Rating Text
                <input name="ratingText" value={form.ratingText} onChange={handleChange} placeholder="Popular: Recently wishlisted 55 times" style={inputStyle} />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
              Offers (comma separated)
              <input name="offers" value={form.offers} onChange={handleChange} placeholder="Buy 2 get 10% off, Buy 3 or more and get 15% off" style={inputStyle} />
            </label>

            <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 600, color: '#111827' }}>
              Image URLs (comma separated)
              <input name="images" value={form.images} onChange={handleChange} placeholder="https://example.com/1.jpg, https://example.com/2.jpg" style={inputStyle} />
            </label>

            <button type="submit" disabled={isSubmitting} style={{ border: 'none', background: '#d70b5c', color: 'white', borderRadius: '999px', padding: '0.9rem 1.25rem', fontWeight: 700, cursor: 'pointer' }}>
              {isSubmitting ? 'Saving product...' : 'Add Product'}
            </button>
          </form>

          <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Available categories</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categories.length > 0 ? categories.map((category) => (
                <span key={category.id || category._id} style={{ background: 'white', padding: '0.45rem 0.7rem', borderRadius: '999px', border: '1px solid #f3c6d7', color: '#b91c1c', fontSize: '0.9rem' }}>
                  {category.name}
                </span>
              )) : <span style={{ color: '#6b7280' }}>No categories found yet.</span>}
            </div>
            <div style={{ marginTop: '1.2rem', color: '#4b5563', lineHeight: 1.6 }}>
              The product will be stored in the Products collection with the resolved category reference under <strong>categoryid</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '0.8rem 0.95rem',
  fontSize: '0.95rem',
  outline: 'none',
}

export default AdminPage
