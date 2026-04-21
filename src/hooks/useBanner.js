import { useState, useEffect } from 'react';
import marketingApi from '../api/marketingApi';
import { useNavigate } from 'react-router-dom';

const useBanner = (position) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await marketingApi.getPublicBanners(position);
        setBanners(response || []); // axiosClient returns data directly
      } catch (error) {
        console.error(`Error loading banners for ${position}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [position]);

  const handleBannerClick = async (banner) => {
    // 1. Track click (Fire & Forget)
    if (banner._id && !String(banner._id).startsWith('fallback')) {
        marketingApi.trackClick(banner._id);
    }

    // 2. Navigate logic
    if (banner.linkType === 'external' && banner.linkTarget?.url) {
        if (banner.linkTarget.url.startsWith('http')) {
            window.open(banner.linkTarget.url, '_blank');
        } else {
            navigate(banner.linkTarget.url);
        }
    } else if (banner.linkType === 'product' && banner.linkTarget?.productId) {
        // Safe Extraction: ID or Slug
        const product = banner.linkTarget.productId;
        const target = typeof product === 'object' ? (product.slug || product._id) : product;
        navigate(`/product/${target}`);
    } else if (banner.linkType === 'category' && banner.linkTarget?.categoryId) {
        const category = banner.linkTarget.categoryId;
        const target = typeof category === 'object' ? (category.slug || category._id) : category;
        
        // Custom logic for major categories to match our routes
        if (target === 'mac') navigate('/mac');
        else if (target === 'ipad') navigate('/ipad');
        else if (target === 'watch') navigate('/watch');
        else navigate('/iphone'); // Default listing
    } else {
        // Do nothing silently if banner has no link
    }
  };

  return { banners, loading, handleBannerClick };
};

export default useBanner;
