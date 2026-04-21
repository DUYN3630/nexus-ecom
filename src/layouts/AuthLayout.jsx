import React from 'react';
import { Outlet } from 'react-router-dom';

// A basic layout for authentication pages (Login, Register, etc.)
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
