import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiUrl } from '../utils/api'
import './ProductDetail.css'

function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [loading, setLoading] = useState(true)
  const [cartMessage, setCartMessage] = useState('')

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.salePrice,
      quantity: 1,
      image: product.image || product.images?.[0],
    }

    try {
      const existingCart = JSON.parse(window.localStorage.getItem('cliqCart') || '[]')
      const updatedCart = Array.isArray(existingCart) ? [...existingCart] : []
      const existingIndex = updatedCart.findIndex((item) => item.id === cartItem.id)

      if (existingIndex >= 0) {
        updatedCart[existingIndex].quantity = (updatedCart[existingIndex].quantity || 1) + 1
      } else {
        updatedCart.push(cartItem)
      }

      window.localStorage.setItem('cliqCart', JSON.stringify(updatedCart))
      window.dispatchEvent(new Event('cartUpdated'))
      setCartMessage(`${product.name} added to cart.`)
      setTimeout(() => setCartMessage(''), 3000)
    } catch (error) {
      console.error('Unable to add item to cart', error)
      setCartMessage('Unable to add to cart. Please try again.')
      setTimeout(() => setCartMessage(''), 3000)
    }
  }

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(apiUrl(`/Users/products/${productId}`))
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error('Failed to load product', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  useEffect(() => {
    setSelectedImageIndex(0)
  }, [productId])

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-empty">
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-empty">
          <p>Product not found.</p>
          <Link to="/category/mens-clothing" className="back-to-category">
            Back to category
          </Link>
        </div>
      </div>
    )
  }

  const displayImages = product.images?.length ? product.images : (product.image ? [product.image] : [])
  const mainImage = displayImages[selectedImageIndex] || displayImages[0]

  return (
    <div className="product-detail-page">
      <div className="product-detail-breadcrumbs">
        {(() => {
          const crumbs = []
          crumbs.push({ label: 'Home', to: '/' })

          // prefer array paths (categoryPath, breadcrumbs), fall back to single category
          const pathArray = product.categoryPath || product.breadcrumbs || null
          if (Array.isArray(pathArray) && pathArray.length) {
            pathArray.forEach((p) => {
              crumbs.push({ label: p, to: `/category/${encodeURIComponent(String(p).toLowerCase().replace(/\s+/g, '-'))}` })
            })
          } else if (product.category) {
            crumbs.push({ label: product.category, to: `/category/${encodeURIComponent(String(product.category).toLowerCase().replace(/\s+/g, '-'))}` })
          }

          crumbs.push({ label: product.name })

          return crumbs.map((c, i) => (
            <span key={i}>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
              {i < crumbs.length - 1 && <span>›</span>}
            </span>
          ))
        })()}
      </div>

      <div className="product-detail-grid">
        <section className="product-detail-images">
          <div className="product-detail-main-image">
            <img src={mainImage} alt={product.name} />
            <span className="product-detail-sale-badge">{product.discount}% off</span>
          </div>

          <div className="product-detail-thumbnails">
            {displayImages.map((image, index) => (
              <button
                key={image}
                type="button"
                className={`thumbnail-button ${selectedImageIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img src={image} alt={`${product.name} view ${index + 1}`} />
              </button>
            ))}
          </div>
        </section>

        <section className="product-detail-info">
          <div className="product-detail-meta">
            <span className="meta-pill">{product.ratingText}</span>
          </div>

          <h1>{product.brand}</h1>
          <p className="product-detail-title">{product.name}</p>

          <div className="product-detail-prices">
            <span className="detail-price">₹{product.salePrice}</span>
            <span className="detail-mrp">MRP: ₹{product.originalPrice}</span>
            <span className="detail-discount">{product.discount}% Off</span>
          </div>
          <p className="inclusive-text">Inclusive of all taxes</p>

          <div className="product-detail-offers">
            {product.offers?.map((offer) => (
              <p key={offer}>{offer}</p>
            ))}
          </div>

          <div className="product-detail-rating-card">
            <span className="rating-score">{Number(product.ratings || 0).toFixed(1)} ★</span>
            <span>{product.reviews} Ratings &amp; Reviews</span>
          </div>

          <div className="product-detail-perks">
            <span>CLiQ Perks | Login to view your benefits</span>
          </div>

          <div className="product-detail-deal-row">
            <span>Get this for only ₹{Math.max(product.salePrice - 150, 0)}</span>
            <button type="button" className="view-offers-button">View Offers</button>
          </div>

          <div className="product-detail-size-row">
            <div>
              <div className="detail-section-label">Select Size</div>
              <div className="size-guide">Size Guide</div>
            </div>
          </div>

          <div className="product-detail-size-buttons">
            {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <button
                key={size}
                type="button"
                className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="product-detail-buy-info">
            <div className="product-detail-buy-row">
              <div>
                <span className="buy-info-label">Ship To</span>
                <span className="buy-info-value">110001, Delhi</span>
              </div>
              <button type="button" className="change-pincode-btn">Change Pincode</button>
            </div>
            <div className="product-detail-buy-row">
              <span>Delivery by 11th Jul</span>
              <span>Cash on Delivery <strong>Available</strong></span>
            </div>
            <div className="product-detail-buy-row">
              <span>7 Days Easy Return</span>
              <button type="button" className="know-more-btn">Know More</button>
            </div>
            <div className="product-detail-sold-by">Sold By {product.soldBy || 'Levi Strauss India PVT LTD'}</div>
          </div>

          <div className="product-detail-attributes-panel">
            <div className="product-detail-attributes-heading">Product Details</div>
            <div className="product-detail-attribute-row">
              <span className="attribute-label">Fit</span>
              <span className="attribute-value">{product.fit || 'Slim'}</span>
            </div>
            <div className="product-detail-attribute-row">
              <span className="attribute-label">Pattern</span>
              <span className="attribute-value">{product.pattern || 'Solid'}</span>
            </div>
          </div>

          <div className="product-detail-actions">
            <button type="button" className="icon-action-btn" title="Share">
              ↗
            </button>
            <button type="button" className="icon-action-btn" title="Wishlist">
              ♡
            </button>
            <Link to={`/checkout/${product.id}`} className="primary-action-btn product-buy-link">
              Buy Now
            </Link>
            <button type="button" className="secondary-action-btn" onClick={handleAddToCart}>
              Add To Bag
            </button>
          </div>
          {cartMessage && <div className="product-detail-cart-message">{cartMessage}</div>}
        </section>
      </div>
    </div>
  )
}

export default ProductDetail
