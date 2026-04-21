import { useState, useEffect } from 'react';
import productApi from '../api/productApi';

const useProductDetail = (slugOrId) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slugOrId) {
      setIsLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      setProduct(null);
      
      try {
        // axiosClient interceptor returns response.data, which is our { success, data } object
        const response = await productApi.getBySlug(slugOrId);

        if (response && response.success && response.data) {
          // Success case: we got a valid product object
          setProduct(response.data);
        } else {
          // Handled failure case: API returned a 200 OK but with success: false
          // Or the response format is unexpected.
          throw new Error(response.message || "Không tìm thấy dữ liệu sản phẩm.");
        }
      } catch (err) {
        // This catches both network errors from axios and the error thrown above.
        console.error("Failed to fetch product detail:", err);
        // The error object from axios might have a more specific message
        const errorMessage = err.response?.data?.message || err.message || "Lỗi khi tải sản phẩm.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [slugOrId]);

  return { product, isLoading, error };
};

export default useProductDetail;