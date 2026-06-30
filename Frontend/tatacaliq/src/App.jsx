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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/approvals" element={<AdminVendorApprovalPage />} />
        <Route path="/vendor" element={<VendorPage />} />
      </Routes>
    </div>
  )
}

export default App
