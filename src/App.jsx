import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from './store/slices/authSlice';
import { setCart } from './store/slices/cartSlice';

// Layouts
import { AdminLayout } from './layouts/AdminLayout.jsx';
import UserLayout from './layouts/UserLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// Helper Components
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import { Toaster } from 'react-hot-toast';
import './features/product-experience/ProductExperience.css';

// Auth Pages (Lazy loaded)
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const PhoneLoginPage = lazy(() => import('./pages/auth/PhoneLoginPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage.jsx'));

// Core User Pages (Lazy loaded)
const HomePage = lazy(() => import('./pages/user/HomePage.jsx'));
const StorePage = lazy(() => import('./pages/user/StorePage.jsx'));
const IPhoneListingPage = lazy(() => import('./pages/user/ListingPage.jsx'));
const MacListingPage = lazy(() => import('./pages/user/MacListingPage.jsx'));
const IPadListingPage = lazy(() => import('./pages/user/IPadListingPage.jsx'));
const WatchListingPage = lazy(() => import('./pages/user/WatchListingPage.jsx'));
const TVEntertainmentListingPage = lazy(() => import('./pages/user/TVEntertainmentListingPage.jsx'));
const AccessoriesListingPage = lazy(() => import('./pages/user/AccessoriesListingPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/user/product-detail/ProductDetailPage.jsx'));
const CartPage = lazy(() => import('./pages/user/CartPage.jsx'));
const WishlistPage = lazy(() => import('./pages/user/WishlistPage.jsx'));
const AboutPage = lazy(() => import('./pages/user/AboutPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage.jsx'));
const AccountPage = lazy(() => import('./pages/user/AccountPage.jsx'));
const PurchasedProductsPage = lazy(() => import('./pages/user/PurchasedProductsPage.jsx'));
const ComingSoonPage = lazy(() => import('./pages/user/ComingSoonPage.jsx'));
const OrderSuccessPage = lazy(() => import('./pages/user/OrderSuccessPage.jsx'));
const ExpertSupportPage = lazy(() => import('./pages/user/ExpertSupportPage.jsx'));
const MedicalRecordPage = lazy(() => import('./pages/user/MedicalRecordPage.jsx'));
const ComparePage = lazy(() => import('./pages/user/ComparePage.jsx'));
const SearchPage = lazy(() => import('./pages/user/SearchPage.jsx'));

// Special Experience Page (Lazy loaded)
const ProductExperience = lazy(() => import('./pages/user/ProductExperience.jsx'));

// Admin Pages (Lazy loaded)
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage.jsx').then(module => ({ default: module.DashboardPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage.jsx').then(module => ({ default: module.AnalyticsPage })));
const AdminProductPage = lazy(() => import('./pages/admin/ProductPage.jsx'));
const AdminOrderPage = lazy(() => import('./pages/admin/OrderPage.jsx').then(module => ({ default: module.OrderPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/CategoriesPage.jsx'));
const AccountManagementPage = lazy(() => import('./pages/admin/AccountManagementPage.jsx'));
const AdminMarketingPage = lazy(() => import('./pages/admin/MarketingPage.jsx'));
const AdminReviewsPage = lazy(() => import('./pages/admin/ReviewsPage.jsx'));
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage.jsx'));
const AIHubPage = lazy(() => import('./pages/admin/AIHubPage.jsx'));
const SupportTicketPage = lazy(() => import('./pages/admin/SupportTicketPage.jsx'));
const RepairManagementPage = lazy(() => import('./pages/admin/RepairManagementPage.jsx'));
const ExpertCalendarPage = lazy(() => import('./pages/admin/ExpertCalendarPage.jsx'));
const AdminProfilePage = lazy(() => import('./pages/admin/ProfilePage.jsx'));
const ExpertDashboard = lazy(() => import('./pages/admin/ExpertDashboard.jsx'));
const ExpertPerformancePage = lazy(() => import('./pages/admin/ExpertPerformancePage.jsx'));

const App = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  // Effect to load cart from localStorage on initial load or user change
  useEffect(() => {
    const cartKey = currentUser ? `nexus_cart_${currentUser._id || currentUser.id}` : 'nexus_cart_guest';
    try {
      const storedCart = localStorage.getItem(cartKey);
      const initialCart = storedCart ? JSON.parse(storedCart) : [];
      dispatch(setCart(initialCart));
    } catch (error) {
      console.error('Failed to load and set cart from localStorage', error);
      dispatch(setCart([])); // Reset to empty cart on error
    }
  }, [currentUser, dispatch]);

  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner />}>
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
            <Route path="/medical-record/:serialNumber" element={<MedicalRecordPage />} />
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
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="ai-hub" element={<AIHubPage />} />
            <Route path="expert-dashboard" element={<ExpertDashboard />} />
            <Route path="expert-performance" element={<ExpertPerformancePage />} />
            <Route path="tickets" element={<SupportTicketPage />} />
            <Route path="repairs" element={<RepairManagementPage />} />
            <Route path="calendar" element={<ExpertCalendarPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
    </>
  );
};

export default App;
