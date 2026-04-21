import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/user/Header';
import MobileMenu from '../components/user/MobileMenu';
import Footer from '../components/user/Footer';
import AnnouncementBar from '../components/user/AnnouncementBar';
import AiChatbox from '../components/common/AiChatbox';
import '../styles/UserLayout.css';

const UserLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showAnnouncement, setShowAnnouncement] = React.useState(true);
  const [cart] = React.useState([]);

  return (
    <div 
      className="min-h-screen bg-white font-sans text-slate-900 selection:bg-black selection:text-white user-layout"
      style={{ paddingTop: showAnnouncement ? '36px' : '0' }}
    >
      {showAnnouncement && (
        <AnnouncementBar onClose={() => setShowAnnouncement(false)} />
      )}
      
      <Header 
        cartCount={cart.length} 
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        topOffset={showAnnouncement ? 36 : 0}
      />

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <main>
        <Outlet />
      </main>

      <Footer />
      <AiChatbox />
    </div>
  );
};

export default UserLayout;
