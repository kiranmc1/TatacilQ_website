import { useState } from 'react'
import './BankOffers.css'

const bankOffers = [
  {
    id: 'bobcard',
    name: 'BOBCARD EMI',
    imageUrl:
      'https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/3tP4jVE3jtQ7RImN0AVXyx/04f778cafb5848329e057bd4d23d02a4/APP_SplitBankOffer_BOB_May_1_1_1.jpg'
  },
  {
    id: 'jkm',
    name: 'HDFC Bank Offer',
    imageUrl:
      'https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/2HXhMxaellQt9ojNJzmxZl/91216d38345f5b2ded201feb40240a63/APP_SplitBankOffer_J_K_May_1_1.jpg'
  },
  {
    id: 'amex',
    name: 'AMEX Offer',
    imageUrl:
      'https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/28xgrEitlSBUWKiBJllfFQ/7a95c533bc5cf3537916686676d93703/APP_SplitBankOffer_AMEX_July_1.jpg'
  },
  {
    id: 'dbs',
    name: 'DBS Offer',
    imageUrl:
      'https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/6fYOVVsQfiXW04toNL8nFw/505763599ab3ec489ead36442491c290/APP_SplitBankOffer_DBS_April_1.jpg'
  },
  {
    id: 'icici',
    name: 'ICICI Offer',
    imageUrl:
      'https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/1AL3K7J9JwCQsVQGyPkFDB/b378da2b461208514222d783e6e97598/APP_SplitBankOffer_ICICI_April_1_1.jpg'
  },
  {
    id: 'hdfc',
    name: 'HDFC Offer',
    imageUrl:
      'https://ctfassetsprod.tatacliq.com/?url=https://images.ctfassets.net/69qx72t49ip2/7tD0GYLjbHTyyptz8ezWm8/4d06a1116aff935f85caecb4d713a52c/APP_SplitBankOffer_HDFC_April_1__1_.jpg'
  }
]

const details = {
  title: 'Terms and Conditions for EMI Offer 2026 | CLiQ Fashion',
  subtitle: 'BOBCARD Ltd',
  offerPeriod: '01st April to 30th June 2026',
  overview:
    'Offer: 12% instant discount | Minimum transaction Rs.5000 | Maximum discount Rs.1500 on BOBCARD EMI only | Use Coupon Code: BOBCFEMI',
  terms: [
    'Instant discount on using BOBCARD EMI only on all purchases made on Tata CLiQ Fashion E-commerce site, their respective Mobile site and mobile application during the promotion period for a Net Transaction Value of Rs.5000.',
    'The Net Cart Value is the total cart value arrived at after all applicable discounts including coupon code but before availing discounts under this Offer. In case CLiQ Cash, NeuCoin or other similar instrument is being used to make a partial payment, Net Cart Value will be calculated after reducing the amount being paid by using CLiQ Cash, NeuCoin or another similar instrument. To avail of the offer the amount being paid through BOBCARD EMI only must be more than the min purchase price of the respective offer. The customer is advised to check the applicability of the discount before proceeding for payment.',
    'Offer valid once per card per customer per month during the offer period.',
    'To avail the instant discount the total payment of the transaction needs to be made using a valid BOBCARD EMI only.'
  ]
}

function BankOffers() {
  const [activeOffer, setActiveOffer] = useState(null)

  return (
    <section className="bank-offers-section">
      <div className="bank-offers-grid">
        {bankOffers.map((offer) => (
          <button
            key={offer.id}
            type="button"
            className="bank-offer-card"
            onClick={() => setActiveOffer(offer)}
          >
            <img src={offer.imageUrl} alt={offer.name} />
          </button>
        ))}
      </div>

      {activeOffer && (
        <div className="bank-offer-modal-backdrop" role="dialog" aria-modal="true">
          <div className="bank-offer-modal">
            <button
              type="button"
              className="bank-offer-modal-close"
              onClick={() => setActiveOffer(null)}
              aria-label="Close offer details"
            >
              ×
            </button>
            <div className="bank-offer-modal-content">
              <div className="bank-offer-summary">
                <h3>{activeOffer.name}</h3>
                <p>{details.offerPeriod}</p>
                <p>{details.overview}</p>
              </div>
              <div className="bank-offer-terms">
                <h4>{details.title}</h4>
                <p><strong>{details.subtitle}</strong></p>
                <ul>
                  {details.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default BankOffers
