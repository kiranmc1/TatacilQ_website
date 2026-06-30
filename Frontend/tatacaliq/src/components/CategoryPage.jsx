import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './CategoryPage.css'

function CategoryPage() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFilters, setSelectedFilters] = useState({
    discount: [],
    category: [],
    priceRange: [],
  })
  const [sortBy, setSortBy] = useState('popularity')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
        const response = await fetch(`http://localhost:2000/Users/products${query}`)
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load products', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [categoryId])

  const discountRanges = [
    { label: '30% - 50%', range: [30, 50] },
    { label: '50% - 70%', range: [50, 70] },
    { label: '70% and more', range: [70, 100] },
  ]

  const categories = [
    { label: 'Ethnic Wear', count: 8333 },
    { label: 'Inner & Nightwear', count: 1225 },
    { label: 'Casual Wear', count: 47538 },
    { label: 'Formal Wear', count: 12450 },
    { label: 'Activewear', count: 5678 },
  ]

  const handleDiscountFilter = (range) => {
    setSelectedFilters((prev) => {
      const newDiscounts = prev.discount.includes(range)
        ? prev.discount.filter((r) => r !== range)
        : [...prev.discount, range]
      return { ...prev, discount: newDiscounts }
    })
  }

  const handleCategoryFilter = (category) => {
    setSelectedFilters((prev) => {
      const newCategories = prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category]
      return { ...prev, category: newCategories }
    })
  }

  const handleClearFilters = () => {
    setSelectedFilters({ discount: [], category: [], priceRange: [] })
  }

  const filteredProducts = products.filter((product) => {
    if (selectedFilters.discount.length > 0) {
      const matchesDiscount = selectedFilters.discount.some(([min, max]) => {
        return product.discount >= min && product.discount <= max
      })
      if (!matchesDiscount) return false
    }
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return 0
      case 'price-low-to-high':
        return a.salePrice - b.salePrice
      case 'price-high-to-low':
        return b.salePrice - a.salePrice
      case 'newest':
        return Number(b.id) - Number(a.id)
      case 'discount':
        return b.discount - a.discount
      default:
        return 0
    }
  })

  return (
    <div className="category-page">
      {(selectedFilters.discount.length > 0 || selectedFilters.category.length > 0) && (
        <div className="active-filters-row">
          <div className="active-filters-container">
            {selectedFilters.discount.map((range, idx) => {
              const label = discountRanges.find((d) => d.range === range)?.label
              return (
                <span key={idx} className="filter-badge">
                  {label}
                  <button
                    className="filter-badge-close"
                    onClick={() => handleDiscountFilter(range)}
                  >
                    ×
                  </button>
                </span>
              )
            })}
            {selectedFilters.category.map((cat, idx) => (
              <span key={idx} className="filter-badge">
                {cat}
                <button
                  className="filter-badge-close"
                  onClick={() => handleCategoryFilter(cat)}
                >
                  ×
                </button>
              </span>
            ))}
            <button className="clear-all-filters" onClick={handleClearFilters}>
              Clear All
            </button>
          </div>
        </div>
      )}

      <div className="category-container">
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            {(selectedFilters.discount.length > 0 || selectedFilters.category.length > 0) && (
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                Clear All
              </button>
            )}
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Discount</h4>
            <div className="filter-options">
              {discountRanges.map((range, idx) => (
                <label key={idx} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFilters.discount.includes(range.range)}
                    onChange={() => handleDiscountFilter(range.range)}
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Category</h4>
            <div className="filter-options">
              {categories.map((category, idx) => (
                <label key={idx} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFilters.category.includes(category.label)}
                    onChange={() => handleCategoryFilter(category.label)}
                  />
                  <span className="filter-label-text">
                    {category.label}
                    <span className="filter-count">{category.count}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="main-content">
          <div className="top-bar">
            <div className="product-count">
              <span>{sortedProducts.length} Products</span>
            </div>
            <div className="sort-and-view">
              <div className="sort-section">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low-to-high">Price: Low to High</option>
                  <option value="price-high-to-low">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>
              <div className="view-options">
                <button className="view-btn grid-view active" title="Grid view">
                  ⊞
                </button>
                <button className="view-btn list-view" title="List view">
                  ☰
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="no-products">
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((product) => {
                const productImage = product.images?.[0] || product.image

                return (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        navigate(`/product/${product.id}`)
                      }
                    }}
                  >
                    <div className="product-image-container">
                      <img src={productImage} alt={product.name} className="product-image" />
                      {product.discount > 0 && (
                        <span className="discount-badge">{product.discount}% off</span>
                      )}
                      <div className="product-actions">
                        <button className="action-btn wishlist-btn" title="Add to wishlist" type="button">
                          ♡
                        </button>
                        <button className="action-btn compare-btn" title="Compare" type="button">
                          ⇄
                        </button>
                      </div>
                    </div>
                    <div className="product-info">
                      <p className="product-brand">{product.brand}</p>
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">
                        <span className="sale-price">₹{product.salePrice}</span>
                        <span className="original-price">₹{product.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && sortedProducts.length === 0 && (
            <div className="no-products">
              <p>No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
