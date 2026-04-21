import React from 'react';
import HeroSlider from '../../components/user/HeroSlider';
import QuickNav from '../../components/user/home-sections/QuickNav';
import TrustSignalsSection from '../../components/user/home-sections/TrustSignalsSection';
import PromoBanner from '../../components/user/home-sections/PromoBanner';
import FeaturedProducts from '../../components/user/home-sections/FeaturedProducts';
import CategoryHighlight from '../../components/user/home-sections/CategoryHighlight';
import CustomerReviews from '../../components/user/home-sections/CustomerReviews';
import GuidedCTA from '../../components/user/home-sections/GuidedCTA';
import FAQSection from '../../components/user/home-sections/FAQSection';
import QualitySection from '../../components/user/home-sections/QualitySection';
import RecentlyViewed from '../../components/user/home-sections/RecentlyViewed';
import SupportEntry from '../../components/user/home-sections/SupportEntry';

const HomePage = () => {
  return (
    <>
      {/* 1. Hero / Banner chính */}
      <HeroSlider />
      
      {/* 2. Quick Entry / User Intent */}
      <QuickNav />

      {/* 3. Trust / Assurance Strip */}
      <TrustSignalsSection />
      
      {/* 4. Campaign Lớn */}
      <PromoBanner />

      {/* 5. Featured Products */}
      <FeaturedProducts />

      {/* 6. Danh mục sản phẩm (Category Highlight) */}
      <CategoryHighlight />

      {/* 7. Đánh giá khách hàng (Customer Reviews) */}
      <CustomerReviews />

      {/* 8. Guided CTA (Soft Action) */}
      <GuidedCTA />

      {/* 9. FAQ Section / Pre-purchase Info */}
      <FAQSection />

      {/* 10. Content / Value Section */}
      <QualitySection />

      {/* 11. Recently Viewed (Context Retention) */}
      <RecentlyViewed />

      {/* 12. Support / Help Entry */}
      <SupportEntry />
    </>
  );
};

export default HomePage;