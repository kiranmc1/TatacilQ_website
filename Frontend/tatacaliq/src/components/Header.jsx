import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'
import CategoryDropdown from './CategoryDropdown'
import BrandsDropdown from './BrandsDropdown'

const normalizeFlag = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase()
    return trimmed === 'true' || trimmed === '1' || trimmed === 'yes' || trimmed === 'y'
  }
  return false
}

function Header() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [authMethod, setAuthMethod] = useState('mobile')
  const [authValue, setAuthValue] = useState('')
  const [authStage, setAuthStage] = useState('entry')
  const [otpCode, setOtpCode] = useState('')
  const [sentOtp, setSentOtp] = useState(null)
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null
    const storedUser = window.localStorage.getItem('cliqUser')
    if (!storedUser) return null
    try {
      return JSON.parse(storedUser)
    } catch (err) {
      console.warn('Unable to parse stored user', err)
      window.localStorage.removeItem('cliqUser')
      return null
    }
  })
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(() => normalizeFlag(user?.isAdmin))
  const [isVendorUser, setIsVendorUser] = useState(() => normalizeFlag(user?.isVendor))
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (user) {
      window.localStorage.setItem('cliqUser', JSON.stringify(user))
      setShowLoginModal(false)
    } else {
      window.localStorage.removeItem('cliqUser')
    }
  }, [user])

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!user?.token) {
        setIsAdminUser(false)
        setIsVendorUser(false)
        return
      }

      setIsAdminUser(normalizeFlag(user?.isAdmin))
      setIsVendorUser(normalizeFlag(user?.isVendor))

      try {
        const response = await fetch('http://127.0.0.1:2000/Users/me', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Unable to load profile')
        }

        const data = await response.json()
        setIsAdminUser(normalizeFlag(data?.user?.isAdmin))
        setIsVendorUser(normalizeFlag(data?.user?.isVendor))
      } catch (error) {
        console.warn('Unable to refresh profile flags', error)
        setIsAdminUser(false)
        setIsVendorUser(false)
      }
    }

    loadCurrentUser()
  }, [user])

  const isContinueEnabled = authMethod === 'mobile'
    ? /^\d{10}$/.test(authValue)
    : /^\S+@\S+\.\S+$/.test(authValue)

  const isVerifyEnabled = /^\d{6}$/.test(otpCode)

  const handleSearchSubmit = (event) => {
    event.preventDefault()
  }

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      window.alert('Voice search is not supported in this browser.')
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript
      setQuery(spokenText)
    }

    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  useEffect(() => {
    if (!showLoginModal) {
      setAuthMethod('mobile')
      setAuthValue('')
      setAuthStage('entry')
      setOtpCode('')
      setSentOtp(null)
    }
  }, [showLoginModal])

  const toggleAuthMethod = () => {
    setAuthMethod((prev) => (prev === 'mobile' ? 'email' : 'mobile'))
    setAuthValue('')
    setAuthStage('entry')
    setOtpCode('')
    setSentOtp(null)
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
  }

  const handleContinue = async () => {
    try {
      const payload = {
        [authMethod === 'mobile' ? 'phone' : 'email']: authValue,
      }

      const response = await fetch('http://127.0.0.1:2000/Users/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setAuthStage('verify')
        setOtpCode('')
        setSentOtp(data.code || data.otp?.code || null)
      } else {
        console.error('OTP request failed:', data.message)
        alert(data.message || 'Unable to request OTP. Please try again.')
      }
    } catch (error) {
      console.error('Error sending OTP request:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleVerifyOtp = async () => {
    try {
      const payload = {
        [authMethod === 'mobile' ? 'phone' : 'email']: authValue,
        code: otpCode,
      }

      const response = await fetch('http://127.0.0.1:2000/Users/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        const signedInUser = {
          ...(data.user || {}),
          token: data.token,
          email: data.user?.email || authValue,
          phone: data.user?.phone || authValue,
        }
        setUser(signedInUser)
        setShowLoginSuccess(true)
        setShowLoginModal(false)
      } else {
        console.error('OTP verification failed:', data.message)
        alert(data.message || 'OTP verification failed. Please try again.')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsAdminUser(false)
    setIsVendorUser(false)
    setProfileMenuOpen(false)
    setShowLoginSuccess(false)
    setShowLoginModal(false)
    window.localStorage.removeItem('cliqUser')
  }

  const handlePortalAccess = (path) => {
    if (!user?.token) {
      setShowLoginModal(true)
      setProfileMenuOpen(false)
      return
    }

    if (path === '/admin' && !isAdminUser) {
      alert('Only admin users can access this portal.')
      return
    }

    if (path === '/vendor' && !isVendorUser) {
      alert('Only vendor users can access this portal.')
      return
    }

    navigate(path)
    setProfileMenuOpen(false)
  }

  const handleCloseSuccess = () => {
    setShowLoginSuccess(false)
  }

  const profileMenuItems = [
    { label: 'My account', icon: '👤' },
    { label: 'Order History', icon: '🛒' },
    { label: 'My Wishlist', icon: '💖' },
    { label: 'Alerts & Coupon', icon: '🔔' },
    { label: 'Gift Card', icon: '🎁' },
    { label: 'CLiQ Cash', icon: '💰' }
  ]

  return (
    <>
      <div className='logo-handler'>
        <div className='logo'></div>
        <div className='Header-nav'>
          <nav className="navbar navbar-expand-lg navbar-light bg-black">
            <div className="container-fluid">
              <a className="navbar-brand text-white" href="#">Tata CLiQ Luxury</a>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a className="nav-link active text-white" aria-current="page" href="#">Home</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link text-white" href="#">CLIQ Cash</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link text-white" href="#">Gift Card</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link text-white" href="#">CLIQ Care</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link text-white" href="#">Track Orders</a>
                  </li>
                  {isAdminUser && (
                    <li className="nav-item">
                      <button
                        className="nav-link text-white header-nav-button"
                        type="button"
                        onClick={() => handlePortalAccess('/admin')}
                      >
                        Admin Portal
                      </button>
                    </li>
                  )}
                  {isVendorUser && (
                    <li className="nav-item">
                      <button
                        className="nav-link text-white header-nav-button"
                        type="button"
                        onClick={() => handlePortalAccess('/vendor')}
                      >
                        Vendor Portal
                      </button>
                    </li>
                  )}
                  <li className="nav-item">
                    {user ? (
                      <button
                        className="nav-link text-white header-profile-button"
                        type="button"
                        onClick={() => setProfileMenuOpen((open) => !open)}
                      >
                        <div className="profile-chip">
                          <span>{user.name ? user.name[0] : user.email?.[0] || 'U'}</span>
                          <div>
                          <strong>{user.name || user.email || user.phone || 'My Profile'}</strong>
                          <small>My Profile</small>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      className="nav-link text-white header-login-button"
                      type="button"
                      onClick={() => setShowLoginModal(true)}
                    >
                      Login / Register
                    </button>
                  )}
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          {profileMenuOpen && user && (
            <div className="profile-menu">
              <div className="profile-menu-card">
                <div className="profile-menu-header">
                  <span>{user.name ? user.name[0] : user.email?.[0] || 'U'}</span>
                  <div>
                    <strong>{user.name || user.email || user.phone || 'User'}</strong>
                    <p>Premium Member</p>
                  </div>
                </div>
                <div className="profile-menu-items">
                  {isAdminUser && (
                    <button type="button" className="profile-menu-item" onClick={() => handlePortalAccess('/admin')}>
                      <span className="profile-menu-icon">🛡️</span>
                      <span>Admin Portal</span>
                    </button>
                  )}
                  {isVendorUser && (
                    <button type="button" className="profile-menu-item" onClick={() => handlePortalAccess('/vendor')}>
                      <span className="profile-menu-icon">🏪</span>
                      <span>Vendor Portal</span>
                    </button>
                  )}
                  {profileMenuItems.map((item) => (
                    <button key={item.label} type="button" className="profile-menu-item">
                      <span className="profile-menu-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <button type="button" className="profile-menu-item profile-menu-logout" onClick={handleLogout}>
                    <span className="profile-menu-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className='container left-margin header-links-row'>
          <div className='row align-items-center'>
            <div className='col-md-2 col-6'>
              <CategoryDropdown />
            </div>
            <div className='col-md-2 col-6'>
              <BrandsDropdown />
            </div>
            <div className='col-md-5'>
              <form className="d-flex voice-search-form" onSubmit={handleSearchSubmit}>
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button
                  className={`btn voice-search-button ${isListening ? 'listening' : ''}`}
                  type="button"
                  onClick={handleVoiceSearch}
                  aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                  title={isListening ? 'Stop voice search' : 'Use voice search'}
                >
                  <span className="voice-search-icon" aria-hidden="true">
                    {isListening ? '■' : '🎤'}
                  </span>
                </button>
              </form>
            </div>
            <div className='col-md-3 col-6 text-end header-link-item'>icons</div>
          </div>
        </div>
      </div>

      {showLoginSuccess && (
        <div className="login-success-backdrop" role="dialog" aria-modal="true">
          <div className="login-success-modal">
            <button className="login-success-close" onClick={handleCloseSuccess} aria-label="Close">
              ×
            </button>
            <div className="login-success-illustration">
              <div className="login-success-image"></div>
            </div>
            <div className="login-success-content">
              <h2>You're Successfully Logged In</h2>
              <p>Start CLiQing</p>
              <button type="button" className="login-success-button" onClick={handleCloseSuccess}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {showLoginModal && (
        <div className="login-modal-backdrop" role="dialog" aria-modal="true">
          <div className="login-modal">
            <button className="login-modal-close" onClick={handleCloseModal} aria-label="Close login modal">
              ×
            </button>
            <div className="login-modal-title">
              <span className="login-modal-title-brand">TATA</span>
              <span className="login-modal-title-highlight">CLiQ</span>
              <span className="login-modal-title-suffix">FASHION</span>
            </div>
            <p className="login-modal-subtitle">Please enter your mobile number</p>
            <div className="login-modal-card">
              <div className="login-modal-input-row">
                {authMethod === 'mobile' && <div className="login-modal-country">+91</div>}
                <input
                  className="login-modal-input"
                  type={authMethod === 'mobile' ? 'tel' : 'email'}
                  value={authValue}
                  onChange={(event) => setAuthValue(event.target.value)}
                  placeholder={authMethod === 'mobile' ? 'Enter Mobile Number' : 'Enter Email Address'}
                  maxLength={authMethod === 'mobile' ? 10 : undefined}
                />
              </div>
              <button
                className="login-modal-secondary"
                type="button"
                onClick={toggleAuthMethod}
              >
                {authMethod === 'mobile' ? 'Use Email Address' : 'Use Mobile Number'}
              </button>
              {authStage === 'entry' ? (
                <button
                  className="login-modal-primary"
                  type="button"
                  disabled={!isContinueEnabled}
                  onClick={handleContinue}
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <div className="login-modal-input-row">
                    <input
                      className="login-modal-input"
                      type="tel"
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                  <button
                    className="login-modal-primary"
                    type="button"
                    disabled={!isVerifyEnabled}
                    onClick={handleVerifyOtp}
                  >
                    Verify OTP
                  </button>
                  <button
                    className="login-modal-secondary"
                    type="button"
                    onClick={() => setAuthStage('entry')}
                  >
                    Edit {authMethod === 'mobile' ? 'mobile' : 'email'}
                  </button>
                  {sentOtp && (
                    <p className="login-modal-otp-hint">
                      For development, OTP is: <strong>{sentOtp}</strong>
                    </p>
                  )}
                </>
              )}
              <p className="login-modal-terms">
                This site is protected by reCAPTCHA and the Google <span>Privacy Policy</span> and <span>Terms of Service</span> apply.
                By continuing, you agree to our <span>Terms of Use</span> and <span>Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
