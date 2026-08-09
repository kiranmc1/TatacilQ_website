import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl } from '../utils/api'

const emptyAddress = { line1: '', line2: '', city: '', state: '', zipcode: '', country: 'India' }

function AccountPage() {
  const navigate = useNavigate()
  const [address, setAddress] = useState(emptyAddress)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const getToken = () => { try { return JSON.parse(window.localStorage.getItem('cliqUser') || '{}').token } catch { return null } }

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken()
      if (!token) return navigate('/')
      try {
        const response = await fetch(apiUrl('/Users/me'), { headers: { Authorization: `Bearer ${token}` } })
        if (!response.ok) throw new Error('Unable to load your account')
        const data = await response.json()
        setAddress({ ...emptyAddress, ...(data.user?.address || {}) })
      } catch (err) { setError(err.message) } finally { setLoading(false) }
    }
    loadProfile()
  }, [navigate])

  const saveAddress = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const response = await fetch(apiUrl('/Users/me/address'), { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(address) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to save address')
      setAddress({ ...emptyAddress, ...data.user.address }); setMessage('Delivery address saved. Future orders will use this address.')
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  if (loading) return <main style={pageStyle}><p>Loading your account…</p></main>
  return <main style={pageStyle}><section style={cardStyle}><h1>My Account</h1><p style={{ color: '#64748b' }}>Manage the delivery address used for your orders.</p>
    <form onSubmit={saveAddress} style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
      <Field label="Address line 1" value={address.line1} onChange={(line1) => setAddress({ ...address, line1 })} required />
      <Field label="Address line 2 (optional)" value={address.line2} onChange={(line2) => setAddress({ ...address, line2 })} />
      <div style={rowStyle}><Field label="City" value={address.city} onChange={(city) => setAddress({ ...address, city })} required /><Field label="State" value={address.state} onChange={(state) => setAddress({ ...address, state })} required /></div>
      <div style={rowStyle}><Field label="Postal code" value={address.zipcode} onChange={(zipcode) => setAddress({ ...address, zipcode })} required /><Field label="Country" value={address.country} onChange={(country) => setAddress({ ...address, country })} required /></div>
      {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}{message && <p style={{ color: '#047857', margin: 0 }}>{message}</p>}
      <button type="submit" className="primary-action-btn" disabled={saving}>{saving ? 'Saving…' : 'Save delivery address'}</button>
    </form>
  </section></main>
}
function Field({ label, value, onChange, required = false }) { return <label style={{ display: 'grid', gap: '0.4rem', fontWeight: 600 }}>{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} /></label> }
const pageStyle = { maxWidth: '760px', margin: '2rem auto', padding: '0 1rem' }
const cardStyle = { background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)' }
const rowStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }
const inputStyle = { width: '100%', border: '1px solid #cbd5e1', borderRadius: '9px', padding: '0.7rem', font: 'inherit', boxSizing: 'border-box' }
export default AccountPage
