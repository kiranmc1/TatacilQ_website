import React, { useState } from 'react'
import './Care.css'

const topics = [
    { key: 'shopping', title: 'Shopping', desc: 'Place order, payment types, delivery modes, etc.', icon: '🛍️' },
    { key: 'offers', title: 'Offers & Promotions', desc: 'Deals & offers, redeem offer & coupon, etc.', icon: '🔖' },
    { key: 'payments', title: 'Payments', desc: 'Payment options, CoD, UPI, EMI options, etc.', icon: '💳' },
    { key: 'orders', title: 'Orders', desc: 'Manage your orders, order status, etc.', icon: '📦' },
    { key: 'account', title: 'Manage Your Account', desc: 'Create account, password, profile settings, etc.', icon: '👤' },
]

const images = [
    'https://www.tatacliq.com/src/account/components/img/Product.svg',
    'https://www.tatacliq.com/src/account/components/img/Website.svg',
    'https://www.tatacliq.com/src/account/components/img/Selling.svg',
    'https://www.tatacliq.com/src/account/components/img/Buying.svg',
    'https://www.tatacliq.com/src/account/components/img/Promotions.svg',
    'https://www.tatacliq.com/src/account/components/img/egv-cliq-point.svg',
]

const otherIssues = [
    { key: 'product', title: 'Product related', image: images[0] },
    { key: 'website', title: 'Website related', image: images[1] },
    { key: 'selling', title: 'Selling', image: images[2] },
    { key: 'buying', title: 'Buying', image: images[3] },
    { key: 'promotions', title: 'Promotions & Offers', image: images[4] },
    { key: 'egv', title: 'EGV / CLiQ Point', image: images[5] },
]

const topicDetails = {
    shopping: {
        title: 'Shopping',
        summary: 'Everything you need to know about browsing products, placing orders, and choosing delivery options.',
        sections: [
            {
                heading: 'How to place an order',
                items: ['Search and select your product', 'Choose size, colour, or variant', 'Review the cart and complete payment'],
            },
            {
                heading: 'Delivery options',
                items: ['Choose standard or express delivery', 'Track your shipment from the order page', 'Update your delivery address before dispatch'],
            },
        ],
    },
    offers: {
        title: 'Offers & promotions',
        summary: 'Find active deals, coupon codes, and the best ways to save on your order.',
        sections: [
            {
                heading: 'How to use offers',
                items: ['Apply valid coupon codes at checkout', 'Check bank offers before payment', 'Use loyalty rewards where available'],
            },
            {
                heading: 'Offer terms',
                items: ['Some offers are valid for selected products only', 'Offers cannot be combined unless stated', 'Offer validity is shown on the offer banner'],
            },
        ],
    },
    payments: {
        title: 'Payments',
        summary: 'Choose supported payment methods and understand available checkout options.',
        sections: [
            {
                heading: 'Payment methods',
                items: ['Pay with cards, UPI, wallets, or net banking', 'Use COD where available', 'Choose EMI for eligible orders'],
            },
            {
                heading: 'Payment issues',
                items: ['Retry payment if the transaction fails', 'Contact support if the amount is deducted but order fails', 'Verify the billing address before final submission'],
            },
        ],
    },
    orders: {
        title: 'Orders',
        summary: 'Track your orders, manage returns, and stay updated on delivery progress.',
        sections: [
            {
                heading: 'Order management',
                items: ['View current and completed orders', 'Check the order status and shipment updates', 'Cancel or return eligible items'],
            },
            {
                heading: 'Delivery updates',
                items: ['Track your package with the tracking link', 'Contact support for delayed or damaged deliveries', 'Update address before the order is shipped'],
            },
        ],
    },
    account: {
        title: 'Manage your account',
        summary: 'Create or update your account details and secure your profile with ease.',
        sections: [
            {
                heading: 'Account access',
                items: ['Sign in to view saved addresses and orders', 'Reset your password if you forgot it', 'Update your phone number or email address'],
            },
            {
                heading: 'Profile settings',
                items: ['Manage your delivery addresses', 'Update notification preferences', 'Keep your personal details accurate'],
            },
        ],
    },
}

function Care() {
    const [activeTopic, setActiveTopic] = useState(null)
    const selectedTopic = activeTopic ? topicDetails[activeTopic] : null

    return (
        <div className="care-page">
            <div className="care-container">
                <aside className="help-sidebar">
                    <h3 className="help-heading">All Help Topics</h3>
                    <ul className="help-list">
                        {topics.map((t) => (
                            <li
                                key={t.key}
                                className={`help-item ${activeTopic === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTopic(t.key)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        setActiveTopic(t.key)
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="help-item-left">
                                    <span className="help-icon" aria-hidden>
                                        {t.icon}
                                    </span>
                                </div>
                                <div className="help-item-body">
                                    <div className="help-title">{t.title}</div>
                                    <div className="help-desc">{t.desc}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="care-main">
                    {!selectedTopic ? (
                        <>
                            <div className="CustomerIssue__cliqCareBox">
                                <div>
                                    <div className="CustomerIssue__cliqCareHeading">CLiQ Care</div>
                                    <div className="CustomerIssue__cliqCareSubHeading">Your one stop solution center. We are happy to help you.</div>
                                </div>
                                <div>
                                    <img src="https://www.tatacliq.com/src/account/components/img/cliqCare.svg" alt="CLiQ Care" />
                                </div>
                            </div>

                            <div className="other-issues-section">
                                <div className="other-issues-header">Other Issues</div>
                                <div className="other-issues-grid">
                                    {otherIssues.map((item) => (
                                        <div key={item.key} className="other-issue-card">
                                            <div className="other-issue-icon">
                                                <img src={item.image} alt={item.title} />
                                            </div>
                                            <div className="other-issue-title">{item.title}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <section className="topic-details-card">
                            <div className="topic-details-header">
                                <p className="topic-details-label">Selected topic</p>
                                <h3 className="topic-details-title">{selectedTopic.title}</h3>
                                <p className="topic-details-summary">{selectedTopic.summary}</p>
                            </div>
                            <div className="topic-details-grid">
                                {selectedTopic.sections.map((section) => (
                                    <div key={section.heading} className="topic-section">
                                        <h4>{section.heading}</h4>
                                        <ul>
                                            {section.items.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Care