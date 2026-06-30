import { useEffect, useState } from 'react'
import './ShopDrop.css'



function ShopDrop() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:2000/Users/categories')
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`)
        }

        const categoryData = await response.json()
        if (active) {
          setCategories(Array.isArray(categoryData) ? categoryData : [])
          console.log(categoryData)
        }
      } catch (err) {
        if (active) {
          setError('Unable to load categories. Showing featured picks.')
          console.error(err)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchCategories()
    return () => {
      active = false
    }
  }, [])

  const categoryCards = categories

  return (
    <section className="shop-drop-section">
      <div className="section-header">
        <div className="shopHeading">
          <h2 >Shop Drop</h2>
        </div>
      </div>

      {loading && <div className="shop-drop-status">Loading categories…</div>}
      {error && <div className="shop-drop-status shop-drop-error">{error}</div>}

      <div className="category-grid">
        {categoryCards.map((category, index) => (
          <div className="category-card-image" key={category.id || index}>
            {category.imageUrl ? (
              <a href={`/category/${category.id}`} className="category-image-link">
                <img src={category.imageUrl} alt={category.name} />
              </a>
            ) : (
              <a href={`/category/${category.id}`} className="category-image-link">
                <span>{category.name?.[0] || '?'}</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default ShopDrop
