import { useParams } from 'react-router-dom'

function ProductPage() {
  const { categoryId } = useParams()

  return (
    <div className="product-page">
      <div className="container py-5">
        <h1>Category: {categoryId}</h1>
        <p>Show products for this category here.</p>
      </div>
    </div>
  )
}

export default ProductPage
