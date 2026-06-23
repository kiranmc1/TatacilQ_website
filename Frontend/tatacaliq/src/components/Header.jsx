import { useEffect, useRef, useState } from 'react'
import './Header.css'

function Header() {
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [authMethod, setAuthMethod] = useState('mobile')
  const [authValue, setAuthValue] = useState('')
  const recognitionRef = useRef(null)

  const isContinueEnabled = authMethod === 'mobile'
    ? /^\d{10}$/.test(authValue)
    : /^\S+@\S+\.\S+$/.test(authValue)

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
    }
  }, [showLoginModal])

  const toggleAuthMethod = () => {
    setAuthMethod((prev) => (prev === 'mobile' ? 'email' : 'mobile'))
    setAuthValue('')
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
  }

  const handleContinue = async () => {
    try {
      const payload = {
        [authMethod === 'mobile' ? 'phone' : 'email']: authValue,
      }

      const response = await fetch('http://127.0.0.1:2000/Users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Login successful:', data)
        // Handle success - close modal or proceed to next step
        setShowLoginModal(false)
      } else {
        console.error('Login failed:', data.message)
        alert(data.message || 'Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Error sending login data:', error)
      alert('An error occurred. Please try again.')
    }
  }

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
                  <li className="nav-item">
                    <button
                      className="nav-link text-white header-login-button"
                      type="button"
                      onClick={() => setShowLoginModal(true)}
                    >
                      Login / Register
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
        <div className='container left-margin'>
          <div className='row'>
            <div className='col-md-3'>Category</div>
            <div className='col-md-3'>Brands</div>
            <div className='col-md-3'>
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
            <div className='col-md-3'>icons</div>
          </div>
        </div>
      </div>

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
              <button
                className="login-modal-primary"
                type="button"
                disabled={!isContinueEnabled}
                onClick={handleContinue}
              >
                Continue
              </button>
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
