import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmDialogProvider } from './contexts/ConfirmDialogContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Đảm bảo bạn có biến VITE_GOOGLE_CLIENT_ID trong file .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "missing-id";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID !== "missing-id" ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <WishlistProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </WishlistProvider>
            </ConfirmDialogProvider>
          </ToastProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    ) : (
      <AuthProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <WishlistProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </WishlistProvider>
          </ConfirmDialogProvider>
        </ToastProvider>
      </AuthProvider>
    )}
  </React.StrictMode>
);