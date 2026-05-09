import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, ArrowLeft, Save, X, Image as ImageIcon, Package,
  Search, Star, Upload, ChevronLeft, ChevronRight, FileText, LayoutGrid
} from 'lucide-react';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import getProductImageUrl from '../../utils/getProductImageUrl';

// --- CONSTANTS ---
const API_URL = 'http://127.0.0.1:5000'; 

// --- HELPERS ---
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const getStatusBadge = (status) => {
  const config = {
    'active': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'inactive': 'bg-rose-50 text-rose-600 border-rose-100',
    'draft': 'bg-slate-50 text-slate-500 border-slate-100',
  } [status] || 'bg-slate-50 text-slate-600 border-slate-100';
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${config}`}>{status}</span>;
};

// --- SUB-COMPONENTS ---
const ProductListView = ({ products, onEdit, onDelete, onAddNew, searchQuery, onSearchChange, onSearchSubmit, pagination, onPageChange }) => (
  <div className="space-y-6 animate-in fade-in duration-500 text-left">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Kho sản phẩm</h1>
        <p className="text-sm text-slate-500 font-medium">
          Hệ thống đang quản lý <span className="text-brand-600 font-bold">{pagination.total}</span> sản phẩm
        </p>
      </div>
      <button 
        onClick={onAddNew} 
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 text-sm font-bold shadow-lg shadow-brand-200 transition-all active:scale-95"
      >
        <Plus className="w-5 h-5" /> Thêm sản phẩm mới
      </button>
    </div>

    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="relative flex-1 max-w-md w-full group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Tìm tên sản phẩm, mã SKU..." 
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          value={searchQuery}
          onChange={onSearchChange}
          onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()}
        />
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all">
          <FileText className="w-5 h-5" />
        </button>
        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all">
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Sản phẩm</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Danh mục</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Giá bán</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tồn kho</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Tác vụ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {products.length > 0 ? products.map(product => (
            <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    <img 
                        src={getProductImageUrl(product)} 
                        className="object-cover w-full h-full" 
                        alt={product.name} 
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{product.name}</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">SKU: {product.sku}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-[11px] font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 uppercase tracking-tight border border-slate-200">
                  {product.category?.name || '---'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="font-black text-slate-800 text-sm">{formatCurrency(product.discountPrice > 0 ? product.discountPrice : product.price)}</div>
                {product.discountPrice > 0 && (
                   <div className="text-[10px] text-slate-400 line-through font-medium">{formatCurrency(product.price)}</div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className={`text-sm font-black ${product.stock <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                  {product.stock}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">đơn vị</div>
              </td>
              <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(product)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                    <Pencil className="w-4.5 h-4.5" />
                  </button>
                  <button onClick={() => onDelete(product._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                Không tìm thấy sản phẩm nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination UI */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
          Trang {pagination.page} / {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button 
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i+1}
                onClick={() => onPageChange(i+1)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                  pagination.page === i+1 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {i+1}
              </button>
            ))}
          </div>

          <button 
            disabled={pagination.page === pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
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
      if (errors[name]) {
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
    <div className="animate-in slide-in-from-bottom-4 duration-500 text-left pb-24">
      {/* Header Form */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentProduct ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Điền thông tin chi tiết để {currentProduct ? 'cập nhật' : 'đăng bán'} sản phẩm
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onBack} 
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSaveClick} 
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Lưu sản phẩm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Basic Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Package className="w-5 h-5"/>
               </div>
               <h3 className="text-lg font-bold text-slate-800">Thông tin cơ bản</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tên sản phẩm <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleSlugify} 
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-1 transition-all outline-none ${errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500 focus:border-brand-500'}`} 
                  placeholder="Ví dụ: iPhone 16 Pro Max 256GB..." 
                />
                {errors.name && <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mã SKU <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="sku" 
                    value={formData.sku} 
                    onChange={handleInputChange} 
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:bg-white focus:ring-1 transition-all outline-none ${errors.sku ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500 focus:border-brand-500'}`}
                    placeholder="VD: IP16PM-256-VN"
                  />
                  {errors.sku && <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">{errors.sku}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Đường dẫn (Slug)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                    <span className="px-3 text-xs font-bold text-slate-400 border-r border-slate-200">/products/</span>
                    <input 
                      type="text" 
                      name="slug" 
                      value={formData.slug} 
                      onChange={handleInputChange} 
                      className="flex-1 px-4 py-3 bg-transparent text-sm font-bold text-brand-600 outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mô tả sản phẩm</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="w-full h-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none" 
                  placeholder="Mô tả chi tiết về đặc điểm, tính năng sản phẩm..."
                />
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
               <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <ImageIcon className="w-5 h-5"/>
               </div>
               <h3 className="text-lg font-bold text-slate-800">Hình ảnh & Video</h3>
            </div>

            <input type="file" multiple accept="image/*" id="file-upload" className="hidden" onChange={handleFileChange} />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => {
                let imageUrl = preview;
                if (!preview.startsWith('blob:') && !preview.startsWith('http')) {
                   imageUrl = `${API_URL}${preview.startsWith('/') ? preview : `/${preview}`}`;
                }
                return (
                  <div key={index} className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    <img 
                      src={imageUrl} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      onError={(e) => {e.target.src = 'https://placehold.co/300x300?text=No+Image'}}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleRemoveImage(index)} 
                        className="w-8 h-8 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <label 
                htmlFor="file-upload" 
                className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-brand-300 transition-all group"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors mb-2">
                  <Upload size={20} />
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Tải lên</p>
              </label>
            </div>
            <p className="mt-4 text-[11px] text-slate-400 font-medium">Hỗ trợ định dạng JPG, PNG, WEBP. Tối đa 5MB mỗi file.</p>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Star className="w-5 h-5"/>
               </div>
               <h3 className="text-lg font-bold text-slate-800">Giá & Kho hàng</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Giá bán lẻ <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    className={`w-full pl-4 pr-12 py-3 bg-slate-50 border rounded-xl text-sm font-black focus:bg-white focus:ring-1 transition-all outline-none ${errors.price ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500'}`} 
                    placeholder="0" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫</span>
                </div>
                {errors.price && <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Giá khuyến mãi</label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="discountPrice" 
                    value={formData.discountPrice} 
                    onChange={handleInputChange} 
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none transition-all" 
                    placeholder="0" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Số lượng tồn kho</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={formData.stock} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700 focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none transition-all" 
                  placeholder="0" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Status Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Trạng thái hiển thị</h4>
            <div className="space-y-4">
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange} 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              >
                <option value="active">🟢 Đang kinh doanh</option>
                <option value="draft">🟡 Bản nháp / Chờ duyệt</option>
                <option value="inactive">🔴 Ngừng kinh doanh</option>
              </select>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                  * Trạng thái "Đang kinh doanh" sẽ cho phép khách hàng nhìn thấy và đặt mua sản phẩm này trên website.
                </p>
              </div>
            </div>
          </div>

          {/* Classification Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Phân loại & Đặc điểm</h4>
            <div className="space-y-6">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Danh mục sản phẩm <span className="text-rose-500">*</span></label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-1 transition-all ${errors.category ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500'}`}
                  >
                      <option value="">Chọn danh mục...</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                             {'\u00A0\u00A0'.repeat(cat.level * 2)} 
                             {cat.level > 0 ? '↳ ' : ''}
                             {cat.name}
                        </option>
                      ))}
                  </select>
                  {errors.category && <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">{errors.category}</p>}
              </div>

              <div className="pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 transition-colors cursor-pointer group">
                  <label htmlFor="isFeatured" className="flex items-center gap-3 cursor-pointer">
                    <div className={`p-2 rounded-lg transition-colors ${formData.isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 group-hover:bg-amber-50'}`}>
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Sản phẩm nổi bật</span>
                  </label>
                  <input 
                    type="checkbox" 
                    id="isFeatured" 
                    name="isFeatured" 
                    checked={formData.isFeatured} 
                    onChange={handleInputChange} 
                    className="w-5 h-5 text-brand-600 bg-white border-slate-300 rounded-lg focus:ring-brand-500" 
                  />
                </div>
              </div>

              {formData.isFeatured && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lợi ích chính (Badge)</label>
                      <input 
                        type="text" 
                        name="keyBenefit" 
                        value={formData.keyBenefit || ''} 
                        onChange={handleInputChange} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        placeholder="Ví dụ: Pin 18 tiếng liên tục"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lý do nổi bật (Caption)</label>
                      <input 
                        type="text" 
                        name="featuredReason" 
                        value={formData.featuredReason || ''} 
                        onChange={handleInputChange} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        placeholder="Ví dụ: Lựa chọn tốt nhất cho sinh viên"
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="scroll-smooth">
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
