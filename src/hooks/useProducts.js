import { useState, useEffect, useCallback } from 'react';
import productApi from '../api/productApi';

const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = useCallback(async (filterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      // Merge current params with new filter params
      const queryParams = { ...params, ...filterParams };
      const response = await productApi.getAll(queryParams);
      
      // Backend trả về { data: [], pagination: {} } hoặc array trực tiếp
      const data = Array.isArray(response) ? response : (response.data || []);
      setProducts(data);

      // Lưu pagination info nếu có
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError(err.message || 'Lỗi tải dữ liệu sản phẩm');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  return { 
    products, 
    pagination,
    isLoading, 
    error, 
    refetch: fetchProducts,
    setFilter: (newParams) => setParams(prev => ({ ...prev, ...newParams }))
  };
};

export default useProducts;
