import React from 'react';
import CaraHero from '../../components/user/cara-sections/CaraHero';
import CaraBento from '../../components/user/cara-sections/CaraBento';
import CaraFeaturedProducts from '../../components/user/cara-sections/CaraFeaturedProducts';
import CaraProcess from '../../components/user/cara-sections/CaraProcess';
import CaraStats from '../../components/user/cara-sections/CaraStats';
import CaraCTA from '../../components/user/cara-sections/CaraCTA';
import ComparisonMatrix from '../../components/user/home-sections/ComparisonMatrix';
import CustomerReviews from '../../components/user/home-sections/CustomerReviews';
import FAQSection from '../../components/user/home-sections/FAQSection';
import RecentlyViewed from '../../components/user/home-sections/RecentlyViewed';
import SupportEntry from '../../components/user/home-sections/SupportEntry';
import FloatingTrustBanner from '../../components/user/home-sections/FloatingTrustBanner';
import PromoBanner from '../../components/user/home-sections/PromoBanner';
import CategoryHighlight from '../../components/user/home-sections/CategoryHighlight';
import QualitySection from '../../components/user/home-sections/QualitySection';

const HomePage = () => {
  return (
    <>
      {/* 1. Cara Premium Hero with Split-Text & Parallax */}
      <CaraHero />

      {/* Floating Trust Banner overlapping Hero and next section */}
      <FloatingTrustBanner />

      {/* 2. Bento Grid for Categories & AI Genius with 3D Mouse Tilt */}
      <CaraBento />

      {/* 3. Featured Products with Staggered Scroll Reveals & Original Card Transition */}
      <CaraFeaturedProducts />

      {/* 4. Comparison Matrix (Decision support) */}
      <div className="bg-cara-surface border-t border-black/5">
        <ComparisonMatrix />
      </div>

      {/* 6. Experience Journey Process with Line Fill Progress */}
      <CaraProcess />

      {/* 8. Statistical Highlights with count-up animation */}
      <CaraStats />

      {/* 9. Customer Reviews (tmaybe.click styled slider) */}
      <div className="bg-cara-surface border-t border-black/5">
        <CustomerReviews />
      </div>

      {/* 10. Guided CTA (AI & Compare) with Magnetic Buttons */}
      <CaraCTA />

      {/* 11. FAQ Section */}
      <div className="bg-cara-surface border-t border-black/5">
        <FAQSection />
      </div>

      {/* 12. Quality / Value Section */}
      <QualitySection />

      {/* 13. Recently Viewed & Support Entry */}
      <div className="bg-white border-t border-slate-100">
        <RecentlyViewed />
        <SupportEntry />
      </div>
    </>
  );
};

export default HomePage;