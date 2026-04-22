import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, PencilSimple, Trash, ArrowLeft, FloppyDisk, X, Image as ImageIcon, Package,
  MagnifyingGlass, Star, UploadSimple
} from '@phosphor-icons/react';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import getProductImageUrl from '../../utils/getProductImageUrl';

// --- CONSTANTS ---
const API_URL = 'http://127.0.0.1:5000'; // Cổng server backend chuẩn

// --- HELPERS ---
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const getStatusBadge = (status) => {
  const config = {
    'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'inactive': 'bg-rose-100 text-rose-700 border-rose-200',
    'draft': 'bg-slate-100 text-slate-500 border-slate-200',
  } [status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${config}`}>{status}</span>;
};

// --- SUB-COMPONENTS ---
const ProductListView = ({ products, onEdit, onDelete, onAddNew, searchQuery, onSearchChange, onSearchSubmit, pagination, onPageChange }) => (
  <div className="space-y-6 animate-in fade-in duration-300 text-left">
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold text-gray-800">Quản lý kho sản phẩm</h3>
        <p className="text-sm text-gray-500">
          Tổng số {pagination.total} sản phẩm
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm tên sản phẩm, SKU..." 
            className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            value={searchQuery}
            onChange={onSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()}
          />
        </div>
        <button onClick={onAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        {/* ... table content giữ nguyên ... */}
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-sm font-semibold text-gray-600">Sản phẩm</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Danh mục</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Giá bán</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Tồn kho</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
            <th className="p-4 text-sm font-semibold text-gray-600 text-right">Tác vụ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map(product => (
            <tr key={product._id} className="hover:bg-gray-50/50 transition cursor-default">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden">
                    <img 
                        src={getProductImageUrl(product)} 
                        className="object-cover w-full h-full" 
                        alt={product.name} 
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                  </div>
                </div>
              </td>
              <td className="p-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">{product.category?.name || '---'}</span></td>
              <td className="p-4">
                <div className="font-bold text-gray-800 text-sm">{formatCurrency(product.discountPrice > 0 ? product.discountPrice : product.price)}</div>
              </td>
              <td className="p-4 text-sm font-bold text-gray-700">{product.stock}</td>
              <td className="p-4">{getStatusBadge(product.status)}</td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(product)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-all"><PencilSimple className="w-4 h-4"/></button>
                  <button onClick={() => onDelete(product._id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition-all"><Trash className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination UI */}
      {pagination.totalPages > 1 && (
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium italic">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <div className="flex gap-1">
            <button 
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1 border rounded bg-white text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i+1}
                onClick={() => onPageChange(i+1)}
                className={`w-8 h-8 rounded text-xs font-bold transition-all ${pagination.page === i+1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                {i+1}
              </button>
            ))}
            <button 
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1 border rounded bg-white text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

const newProductInitialState = {
  name: '', sku: '', slug: '', description: '', price: '', discountPrice: '', stock: '', category: '', status: 'draft', isFeatured: false, specifications: {}
};

const ProductFormView = ({ product: currentProduct, categories, onBack, onSave }) => {

  const getInitialFormData = useCallback((product) => {
    if (!product) {
      return newProductInitialState;
    }
    // Khi chỉnh sửa, chuyển đổi đối tượng category lồng nhau thành ID
    return {
      ...product,
      category: product.category?._id || ''
    };
  }, []);

  const [formData, setFormData] = useState(getInitialFormData(currentProduct));
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(currentProduct?.images || []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(getInitialFormData(currentProduct));
    setImagePreviews(currentProduct?.images || []);
    setImageFiles([]); 
    setErrors({}); 
  }, [currentProduct, getInitialFormData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSlugify = (e) => {
      const value = e.target.value;
      const slug = value.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      setFormData(prev => ({ ...prev, name: value, slug: slug }));
      if (errors.name) {
        setErrors(prev => ({ ...prev, name: null }));
      }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newImagePreviews);
    // Lưu ý: Logic xóa file trong imageFiles chưa hoàn chỉnh ở đây, nhưng tạm thời ổn cho preview
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên sản phẩm.';
    if (!formData.category) newErrors.category = 'Vui lòng chọn danh mục.';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Vui lòng nhập giá bán hợp lệ.';
    if (!formData.sku.trim()) newErrors.sku = 'Vui lòng nhập mã SKU.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveClick = async () => {
    if (!validateForm()) {
      return; 
    }
    const remainingImages = imagePreviews.filter(p => !p.startsWith('blob:'));
    const updatedFormData = { ...formData, images: remainingImages };

    await onSave(updatedFormData, imageFiles);
  }

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 text-left font-sans animate-in slide-in-from-right-4 duration-300 pb-24">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-200 shadow-sm sticky top-0 z-30 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">{currentProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h1>
            <p className="text-[13px] text-gray-500 font-medium">Điền thông tin sản phẩm để đăng bán</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"> Hủy </button>
          <button onClick={handleSaveClick} className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all active:scale-95">
            <FloppyDisk className="w-4 h-4" /> Lưu sản phẩm
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
             <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-4 border-b border-gray-50">
               <Package className="w-5 h-5 text-blue-600"/> Thông tin cơ bản
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleSlugify} className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:ring-1 focus:border-blue-500 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`} placeholder="Ví dụ: Áo thun nam Cotton..." />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div className="space-y-1.5"><label className="block text-[13px] font-semibold text-gray-700">Đường dẫn (URL Slug)</label><div className="flex items-center border border-gray-200 rounded-lg overflow-hidden group focus-within:border-blue-500 transition-colors"><span className="px-4 py-3 bg-[#F9FAFB] text-gray-400 text-xs font-semibold border-r border-gray-200">/products/</span><input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="flex-1 px-4 py-3 bg-white text-sm text-blue-600 font-bold outline-none" placeholder="ten-san-pham" /></div></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[13px] font-semibold text-gray-700">Mã SKU <span className="text-red-500">*</span></label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className={`w-full px-4 py-3 bg-white border rounded-lg text-sm outline-none focus:border-blue-500 ${errors.sku ? 'border-red-500' : 'border-gray-200'}`} />
                   {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku}</p>}
                </div>
              </div>
              <div className="space-y-2"><label className="block text-[13px] font-semibold text-gray-700">Mô tả chi tiết</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full h-32 p-4 border border-gray-200 rounded-lg bg-white text-sm" placeholder="Mô tả chi tiết sản phẩm..."></textarea></div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-4 border-b border-gray-50"><ImageIcon className="w-5 h-5 text-purple-600"/> Hình ảnh & Video</h3>
            <input type="file" multiple accept="image/*,video/*" id="file-upload" className="hidden" onChange={handleFileChange} />
            <div className="grid grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => {
                let imageUrl = preview;
                if (!preview.startsWith('blob:') && !preview.startsWith('http')) {
                   imageUrl = `${API_URL}${preview.startsWith('/') ? preview : `/${preview}`}`;
                }
                return (
                  <div key={index} className="relative aspect-square border rounded-xl overflow-hidden group">
                    <img 
                      src={imageUrl} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {e.target.src = 'https://placehold.co/150'}}
                    />
                    <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  </div>
                );
              })}
              <label htmlFor="file-upload" className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all group text-gray-500 hover:text-blue-600">
                <UploadSimple size={32} className="mb-2" />
                <p className="text-xs font-semibold text-center">Tải lên</p>
              </label>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-4 border-b border-gray-50">Giá & Kho hàng</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Giá bán <span className="text-red-500">*</span></label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg text-sm ${errors.price ? 'border-red-500' : 'border-gray-200'}`} placeholder="0" />
                  {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
                </div>
                <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Giá khuyến mãi</label><input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm" placeholder="0" /></div>
              </div>
              <div className="space-y-4">
                <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Tổng tồn kho</label><input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-bold" placeholder="0" /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
            <h4 className="text-base font-bold text-gray-800">Trạng thái</h4>
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none cursor-pointer focus:border-blue-500 transition-all shadow-sm">
                <option value="active">Đang bán</option>
                <option value="draft">Bản nháp</option>
                <option value="inactive">Ngừng kinh doanh</option>
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
            <h4 className="text-base font-bold text-gray-800">Phân loại</h4>
            <div className="space-y-5">
              <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-gray-700">Danh mục sản phẩm <span className="text-red-500">*</span></label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg text-sm outline-none focus:border-blue-500 bg-white ${errors.category ? 'border-red-500' : 'border-gray-200'}`}>
                      <option value="">Chọn danh mục...</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                             {/* Hiển thị phân cấp bằng khoảng trắng */}
                             {'\u00A0\u00A0'.repeat(cat.level * 2)} 
                             {cat.level > 0 ? '↳ ' : ''}
                             {cat.name}
                        </option>
                      ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</label>
              </div>

              {/* Thêm trường mới khi isFeatured là true */}
              {formData.isFeatured && (
                <div className="space-y-4 pt-4 animate-in fade-in duration-300">
                   <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-gray-700">Lợi ích chính (1 dòng)</label>
                      <input 
                        type="text" 
                        name="keyBenefit" 
                        value={formData.keyBenefit || ''} 
                        onChange={handleInputChange} 
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-white"
                        placeholder="Ví dụ: Thời lượng pin lên đến 18 giờ"
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-gray-700">Lý do nổi bật (Tooltip)</label>
                      <input 
                        type="text" 
                        name="featuredReason" 
                        value={formData.featuredReason || ''} 
                        onChange={handleInputChange} 
                        className="w-full px-4 py-3 border rounded-lg text-sm bg-white"
                        placeholder="Ví dụ: Bán chạy nhất tháng"
                      />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const ProductPage = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'form'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Chỉnh xuống 5 để dễ thấy phân trang
    total: 0,
    totalPages: 1
  });

  const fetchData = async (page = 1) => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getAll({ 
          status: 'all', 
          page, 
          limit: 5, // Đồng bộ với limit ở trên
          search: searchQuery 
        }), 
        categoryApi.getAll()
      ]);

      // Xử lý sản phẩm
      const productsData = productsRes.data || [];
      setProducts(productsData);
      
      if (productsRes.pagination) {
        setPagination(productsRes.pagination);
      }
      
      // Xử lý categories
      let rawCategories = categoriesRes.data || categoriesRes || [];
      const flattenCategories = (cats, level = 0) => {
          if (!cats || !Array.isArray(cats)) return [];
          let flatList = [];
          cats.forEach(cat => {
              flatList.push({ ...cat, level });
              if (cat.children && cat.children.length > 0) {
                  flatList = flatList.concat(flattenCategories(cat.children, level + 1));
              }
          });
          return flatList;
      };
      setCategories(flattenCategories(rawCategories));

    } catch (error) {
      console.error("Failed to fetch data:", error);
      setProducts([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page);
  }, [pagination.page]);

  // Tìm kiếm (Trigger fetch mới thay vì dùng useMemo để filter client-side)
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };


  const handleAddNew = () => {
    setCurrentProduct(null);
    setActiveTab('form');
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setActiveTab('form');
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.')) {
      try {
        await productApi.delete(productId);
        alert('Đã xóa sản phẩm thành công.');
        fetchData(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert('Lỗi: Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    }
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setCurrentProduct(null);
  };
  
  const handleSave = async (productData, imageFiles) => {
    const isEditing = !!currentProduct;
    const actionText = isEditing ? 'cập nhật' : 'tạo';
    
    try {
      console.log(`Saving (${actionText}) product...`, { productData, imageFiles });
      let response;

      if (isEditing) {
        response = await productApi.update(currentProduct._id, productData, imageFiles);
        if (response.status === 200) { 
          alert('Sản phẩm đã được cập nhật thành công!');
        }
      } else {
        response = await productApi.create(productData, imageFiles);
        if (response.status === 201) { 
          alert('Sản phẩm đã được tạo thành công!');
        }
      }
      
      fetchData(); 
      handleBackToList(); 

    } catch (error) {
        const errorData = error.response?.data;
        console.error(`Failed to ${actionText} product:`, errorData || error);
        
        if (error.response?.status === 404) {
             alert(`Lỗi: Không tìm thấy sản phẩm để ${actionText}.`);
        } else if (typeof errorData?.error === 'string' && errorData.error.includes('E11000')) {
            alert('Lỗi: Sản phẩm với tên/slug hoặc SKU này đã tồn tại. Vui lòng chọn một tên khác.');
        } else {
            alert(`Lỗi: ${errorData?.message || `Không thể ${actionText} sản phẩm.`}`);
        }
    }
  };

  if(isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gray-50">
      {activeTab === 'list' && (
        <ProductListView
          products={products}
          pagination={pagination}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onSearchSubmit={handleSearch}
          onPageChange={handlePageChange}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {activeTab === 'form' && (
        <ProductFormView
          product={currentProduct}
          categories={categories}
          onBack={handleBackToList}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProductPage;
