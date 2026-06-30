import { useEffect, useState } from 'react'
import './CategoryDropdown.css'

function CategoryDropdown() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryProducts, setCategoryProducts] = useState([])
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:2000/Users/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch products for selected category
  const handleCategoryHover = async (category) => {
    setHoveredCategoryId(category.id)
    setSelectedCategory(category)

    try {
      const response = await fetch(`http://127.0.0.1:2000/Users/products?categoryId=${category.id}`)
      if (response.ok) {
        const data = await response.json()
        setCategoryProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setCategoryProducts([])
    }
  }

  // Group products by type/brand
  const groupedProducts = categoryProducts.reduce((acc, product) => {
    const type = product.type || product.brand || 'More Items'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(product)
    return acc
  }, {})

  return (
    <div className="category-dropdown-wrapper" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
      <div className="category-trigger">
        <span className="category-label">Categories</span>
        <span className="category-arrow">▼</span>
      </div>

      {isDropdownOpen && (
        <div className="category-dropdown-menu">
          <div className="category-list">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-item ${hoveredCategoryId === category.id ? 'active' : ''}`}
                  onMouseEnter={() => handleCategoryHover(category)}
                >
                  {category.name}
                  <span className="category-arrow-right">›</span>
                </div>
              ))
            ) : (
              <div className="category-item">No categories</div>
            )}
          </div>

          {selectedCategory && categoryProducts.length > 0 && (
            <div className="product-submenu">
              <div className="submenu-header">Shop All {selectedCategory.name}</div>
              <div className="product-sections">
                {Object.entries(groupedProducts).map(([type, products]) => (
                  <div key={type} className="product-type-section">
                    <h4 className="product-type-heading">{type}</h4>
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

export default CategoryDropdown
