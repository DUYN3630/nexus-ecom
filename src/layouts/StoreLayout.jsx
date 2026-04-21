import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/user/Header'; // Assuming a generic header
import Footer from '../components/user/Footer'; // Assuming a generic footer

// A basic layout for general store pages.
// You can customize this to be different from UserLayout if needed.
const StoreLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header cartCount={0} /> */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default StoreLayout;
