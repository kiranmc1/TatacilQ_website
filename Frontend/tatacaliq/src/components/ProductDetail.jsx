import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './ProductDetail.css'

function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('M')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:2000/Users/products/${productId}`)
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
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/category/mens-clothing">Men's Clothing</Link>
        <span>›</span>
        <Link to="/category/mens-clothing">Casual Wear</Link>
        <span>›</span>
        <span>{product.name}</span>
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

          <div className="product-detail-actions">
            <button type="button" className="icon-action-btn" title="Share">
              ↗
            </button>
            <button type="button" className="icon-action-btn" title="Wishlist">
              ♡
            </button>
            <button type="button" className="primary-action-btn">Buy Now</button>
            <button type="button" className="secondary-action-btn">Add To Bag</button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductDetail
