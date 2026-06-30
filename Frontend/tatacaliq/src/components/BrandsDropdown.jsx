import { useEffect, useState } from 'react'
import './BrandsDropdown.css'

function BrandsDropdown() {
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [brandProducts, setBrandProducts] = useState([])
  const [hoveredBrandId, setHoveredBrandId] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://127.0.0.1:2000/Users/brands')
        if (response.ok) {
          const data = await response.json()
          setBrands(data)
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
      }
    }
    fetchBrands()
  }, [])

  // Fetch products for selected brand (if backend supports this)
  const handleBrandHover = async (brand) => {
    setHoveredBrandId(brand.id)
    setSelectedBrand(brand)

    try {
      const response = await fetch(`http://127.0.0.1:2000/Users/products?brand=${brand.name}`)
      if (response.ok) {
        const data = await response.json()
        setBrandProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setBrandProducts([])
    }
  }

  // Group products by category
  const groupedProducts = brandProducts.reduce((acc, product) => {
    const category = product.categoryid || product.categoryName || 'More Items'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {})

  return (
    <div className="brand-dropdown-wrapper" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
      <div className="brand-trigger">
        <span className="brand-label">Brands</span>
        <span className="brand-arrow">▼</span>
      </div>

      {isDropdownOpen && (
        <div className="brand-dropdown-menu">
          <div className="brand-list">
            {brands.length > 0 ? (
              brands.map((brand) => (
                <div
                  key={brand.id}
                  className={`brand-item ${hoveredBrandId === brand.id ? 'active' : ''}`}
                  onMouseEnter={() => handleBrandHover(brand)}
                >
                  {brand.name}
                  <span className="brand-arrow-right">›</span>
                </div>
              ))
            ) : (
              <div className="brand-item">No brands</div>
            )}
          </div>

          {selectedBrand && brandProducts.length > 0 && (
            <div className="product-submenu">
              <div className="submenu-header">Shop All {selectedBrand.name}</div>
              <div className="product-sections">
                {Object.entries(groupedProducts).map(([category, products]) => (
                  <div key={category} className="product-type-section">
                    <h4 className="product-type-heading">{category}</h4>
                    <ul className="product-values-list">
                      {products.map((product) => (
                        <li key={product.id || product._id} className="product-value">
                          {product.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BrandsDropdown
