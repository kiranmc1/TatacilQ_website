import './BrandSpotlight.css'

const brands = [
  { id: 'gucci', name: 'Gucci', tagline: 'Bold luxury fashion' },
  { id: 'louis-vuitton', name: 'Louis Vuitton', tagline: 'Classic leather pieces' },
  { id: 'prada', name: 'Prada', tagline: 'Modern accessories' },
  { id: 'armani', name: 'Armani', tagline: 'Refined Italian style' },
  { id: 'michael-kors', name: 'Michael Kors', tagline: 'Weekend ready looks' },
]

function BrandSpotlight() {
  return (
    <section className="brand-spotlight-section">
      <div className="brand-spotlight-header">
        <div>
          <span className="eyebrow">Brand Spotlight</span>
          <h2>Brands you love</h2>
        </div>
        <a className="section-link" href="#">Explore brands</a>
      </div>

      <div className="brand-grid">
        {brands.map((brand) => (
          <article className="brand-card" key={brand.id}>
            <div className="brand-card-badge">{brand.name[0]}</div>
            <div className="brand-card-body">
              <h3>{brand.name}</h3>
              <p>{brand.tagline}</p>
            </div>
            <button type="button">View collection</button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default BrandSpotlight
