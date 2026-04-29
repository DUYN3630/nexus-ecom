import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AdminLayout } from './layouts/AdminLayout.jsx';
import UserLayout from './layouts/UserLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import PhoneLoginPage from './pages/auth/PhoneLoginPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

// Core User Pages
import HomePage from './pages/user/HomePage.jsx';
import StorePage from './pages/user/StorePage.jsx';
import IPhoneListingPage from './pages/user/ListingPage.jsx';
import MacListingPage from './pages/user/MacListingPage.jsx';
import IPadListingPage from './pages/user/IPadListingPage.jsx';
import WatchListingPage from './pages/user/WatchListingPage.jsx';
import TVEntertainmentListingPage from './pages/user/TVEntertainmentListingPage.jsx';
import AccessoriesListingPage from './pages/user/AccessoriesListingPage.jsx';
import ProductDetailPage from './pages/user/product-detail/ProductDetailPage.jsx';
import CartPage from './pages/user/CartPage.jsx';
import WishlistPage from './pages/user/WishlistPage.jsx';
import AboutPage from './pages/user/AboutPage.jsx';
import CheckoutPage from './pages/user/CheckoutPage.jsx';
import AccountPage from './pages/user/AccountPage.jsx';
import PurchasedProductsPage from './pages/user/PurchasedProductsPage.jsx';
import ComingSoonPage from './pages/user/ComingSoonPage.jsx';
import OrderSuccessPage from './pages/user/OrderSuccessPage.jsx';
import ExpertSupportPage from './pages/user/ExpertSupportPage.jsx';
import ComparePage from './pages/user/ComparePage.jsx';
import SearchPage from './pages/user/SearchPage.jsx';

// Special Experience Page
import ProductExperience from './pages/user/ProductExperience.jsx';

// Admin Pages
import { DashboardPage as AdminDashboardPage } from './pages/admin/DashboardPage.jsx';
import { AnalyticsPage as AdminAnalyticsPage } from './pages/admin/AnalyticsPage.jsx';
import AdminProductPage from './pages/admin/ProductPage.jsx';
import { OrderPage as AdminOrderPage } from './pages/admin/OrderPage.jsx';
import AdminCategoriesPage from './pages/admin/CategoriesPage.jsx';
import AccountManagementPage from './pages/admin/AccountManagementPage.jsx';
import AdminMarketingPage from './pages/admin/MarketingPage.jsx';
import AdminReviewsPage from './pages/admin/ReviewsPage.jsx';
import AIHubPage from './pages/admin/AIHubPage.jsx';
import SupportTicketPage from './pages/admin/SupportTicketPage.jsx';
import RepairManagementPage from './pages/admin/RepairManagementPage.jsx';

// Helper Components
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import './features/product-experience/ProductExperience.css';

const App = () => {
  return (
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <ScrollToTop />
      <Routes>
        {/* ============================================= */}
        {/* User & Public Routes (Main Layout)            */}
        {/* ============================================= */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/iphone" element={<IPhoneListingPage />} />
          <Route path="/mac" element={<MacListingPage />} />
          <Route path="/ipad" element={<IPadListingPage />} />
          <Route path="/watch" element={<WatchListingPage />} />
          <Route path="/tv" element={<TVEntertainmentListingPage />} />
          <Route path="/accessories" element={<AccessoriesListingPage />} />
          
          <Route path="/products" element={<Navigate to="/iphone" replace />} />
          
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/iphone-experience" element={<ProductExperience />} />
          <Route path="/support" element={<ExpertSupportPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/purchased-products" element={<ProtectedRoute><PurchasedProductsPage /></ProtectedRoute>} />
          
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/user/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/user/account/:tab" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          <Route path="*" element={<ComingSoonPage />} />
        </Route>

        {/* ============================================= */}
        {/* Auth Routes (Login, Register)                 */}
        {/* ============================================= */}
        <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-phone" element={<PhoneLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* ============================================= */}
        {/* ADMIN ROUTES (Protected + Admin Layout)       */}
        {/* ============================================= */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="products" element={<AdminProductPage />} />
          <Route path="orders" element={<AdminOrderPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AccountManagementPage />} />
          <Route path="accounts" element={<AccountManagementPage />} />
          <Route path="marketing" element={<AdminMarketingPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="ai-hub" element={<AIHubPage />} />
          <Route path="tickets" element={<SupportTicketPage />} />
          <Route path="repairs" element={<RepairManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
