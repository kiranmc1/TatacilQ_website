import './App.css'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Slider from './components/Slider'
import ShopDrop from './components/ShopDrop'
import BankOffers from './components/BankOffers'
import CategoryPage from './components/CategoryPage'
import ProductDetail from './components/ProductDetail'
import AdminPage from './pages/AdminPage'
import VendorPage from './pages/VendorPage'
import AdminVendorApprovalPage from './pages/AdminVendorApprovalPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentSuccess from './pages/PaymentSuccess'
import OrderTrackerPage from './pages/OrderTrackerPage'
import CartPage from './pages/CartPage'
import Care from './pages/Care'
import AccountPage from './pages/AccountPage'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={
          <>
            <Slider />
            <ShopDrop />
            <BankOffers />
          </>
        } />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/checkout/:productId" element={<CheckoutPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/track-order" element={<OrderTrackerPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/approvals" element={<AdminVendorApprovalPage />} />
        <Route path="/vendor" element={<VendorPage />} />
        <Route path="/care" element={<Care />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </div>
  )
}

export default App
