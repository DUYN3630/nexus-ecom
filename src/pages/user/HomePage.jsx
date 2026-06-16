import React, { useState, useEffect } from 'react';
import HeroSlider from '../../components/user/HeroSlider';
import RefinedHeroSection from '../../components/user/home-sections/RefinedHeroSection';
import FloatingTrustBanner from '../../components/user/home-sections/FloatingTrustBanner';
import QuickNav from '../../components/user/home-sections/QuickNav';
import TrustSignalsSection from '../../components/user/home-sections/TrustSignalsSection';
import PromoBanner from '../../components/user/home-sections/PromoBanner';
import FeaturedProducts from '../../components/user/home-sections/FeaturedProducts';
import ComparisonMatrix from '../../components/user/home-sections/ComparisonMatrix';
import EliteLifestyle from '../../components/user/home-sections/EliteLifestyle';
import CategoryHighlight from '../../components/user/home-sections/CategoryHighlight';
import CustomerReviews from '../../components/user/home-sections/CustomerReviews';
import GuidedCTA from '../../components/user/home-sections/GuidedCTA';
import FAQSection from '../../components/user/home-sections/FAQSection';
import QualitySection from '../../components/user/home-sections/QualitySection';
import RecentlyViewed from '../../components/user/home-sections/RecentlyViewed';
import SupportEntry from '../../components/user/home-sections/SupportEntry';

const HomePage = () => {
  const [heroLayout, setHeroLayout] = useState('static');

  useEffect(() => {
    const savedLayout = localStorage.getItem('nexus_hero_layout');
    if (savedLayout) {
      setHeroLayout(savedLayout);
    }
  }, []);

  return (
    <>
      {/* 1. Hero / Banner chính (Dynamic based on admin setting) */}
      {heroLayout === 'slider' ? <HeroSlider /> : <RefinedHeroSection />}

      {/* Floating Trust Banner overlapping Hero and next section */}
      <FloatingTrustBanner />

      {/* 2. Quick Entry / User Intent */}
      <QuickNav />

      {/* 3. Featured Products - Sản phẩm trọng tâm */}
      <FeaturedProducts />

      {/* 4. Comparison Matrix - Giúp khách hàng ra quyết định */}
      <ComparisonMatrix />

      {/* 5. Campaign Lớn */}
      <PromoBanner />

      {/* 6. Elite Lifestyle - Bán giải pháp & phong cách sống */}
      <EliteLifestyle />

      {/* 7. Danh mục sản phẩm (Category Highlight) */}
      <CategoryHighlight />

      {/* 8. Đánh giá khách hàng (Customer Reviews) */}
      <CustomerReviews />

      {/* 9. Guided CTA (AI Expert & Support) */}
      <GuidedCTA />

      {/* 10. FAQ Section / Pre-purchase Info */}
      <FAQSection />

      {/* 11. Content / Value Section */}
      <QualitySection />

      {/* 12. Recently Viewed & Support Entry (Consolidated) */}
      <div className="bg-slate-50 border-t border-slate-100">
        <RecentlyViewed />
        <SupportEntry />
      </div>

      {/* 13. Trust / Assurance Strip (Clean footer strip) */}
      <TrustSignalsSection isCompact={true} />
    </>
  );
};

export default HomePage;