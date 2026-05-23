import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Package,
  Search, Upload, ChevronLeft, ChevronRight, FileText, LayoutGrid, ShieldCheck,
  CreditCard, Star, Zap
} from 'lucide-react';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import getProductImageUrl from '../../utils/getProductImageUrl';

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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Quản lý Kho sản phẩm</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Hệ thống đang quản lý <span className="text-brand-600 font-bold">{pagination.total}</span> hồ sơ sản phẩm
        </p>
      </div>
      <button 
        onClick={onAddNew} 
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-200 transition-all active:scale-95"
      >
        <Plus className="w-4 h-4" /> Thêm sản phẩm mới
      </button>
    </div>

    <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="relative flex-1 max-w-md w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Tìm tên sản phẩm, mã SKU..." 
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-tight focus:border-brand-600 outline-none transition-all shadow-inner"
          value={searchQuery}
          onChange={onSearchChange}
          onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()}
        />
      </div>
      <div className="flex items-center gap-2">
        <button className="p-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl border-2 border-slate-100 transition-all">
          <FileText className="w-5 h-5" />
        </button>
        <button className="p-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl border-2 border-slate-100 transition-all">
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>
    </div>

    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b-2 border-slate-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá bán</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tồn kho</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tác vụ</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-50">
          {products.length > 0 ? products.map(product => (
            <tr key={product._id} className="hover:bg-slate-50/50 transition-all group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-14 h-14 bg-white rounded-xl border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    <img 
                        src={getProductImageUrl(product)} 
                        className="object-cover w-full h-full" 
                        alt={product.name} 
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-black text-slate-800 text-xs truncate max-w-[200px] uppercase tracking-tight">{product.name}</div>
                      {product.isFeatured && (
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    <div className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-widest">SKU: {product.sku}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-[9px] font-black bg-slate-100 px-2.5 py-1.5 rounded-lg text-slate-600 uppercase tracking-widest border-2 border-slate-200">
                  {product.category?.name || '---'}
                </span>
              </td>
              <td className="px-6 py-4 text-left">
                <div className="font-black text-slate-800 text-xs tracking-widest tabular-nums">{formatCurrency(product.discountPrice > 0 ? product.discountPrice : product.price)}</div>
                {product.discountPrice > 0 && (
                   <div className="text-[9px] text-slate-400 line-through font-black uppercase tracking-tighter">{formatCurrency(product.price)}</div>
                )}
              </td>
              <td className="px-6 py-4 text-left">
                <div className={`text-xs font-black tabular-nums tracking-widest ${product.stock <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                  {product.stock}
                </div>
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">đơn vị</div>
              </td>
              <td className="px-6 py-4 text-left">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border-2 uppercase tracking-widest transition-all ${
                    product.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    product.status === 'inactive' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                    'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                    {product.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => onEdit(product)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border-2 border-transparent hover:border-brand-100">
                    <Pencil className="w-4.5 h-4.5" />
                  </button>
                  <button onClick={() => onDelete(product._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-2 border-transparent hover:border-rose-100">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest italic">
                Không tìm thấy sản phẩm nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination UI */}
      <div className="px-6 py-4 bg-slate-50/50 border-t-2 border-slate-100 flex justify-between items-center">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
          Trang {pagination.page} / {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button 
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="p-2 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i+1}
                onClick={() => onPageChange(i+1)}
                className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                  pagination.page === i+1 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                  : 'bg-white text-slate-500 border-2 border-slate-100 hover:bg-slate-50'
                }`}
              >
                {i+1}
              </button>
            ))}
          </div>

          <button 
            disabled={pagination.page === pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            className="p-2 bg-white border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const newProductInitialState = {
  name: '', sku: '', slug: '', description: '', price: '', discountPrice: '', stock: '', category: '', status: 'draft', isFeatured: false, specifications: {},
  keyBenefit: '', featuredReason: '', featuredOrder: 0, mainImage: ''
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

  // Chuyển đổi specs từ Object sang Array để dễ quản lý trong form
  const [specList, setSpecList] = useState([]);

  useEffect(() => {
    const initialData = getInitialFormData(currentProduct);
    setFormData(initialData);
    setImagePreviews(currentProduct?.images || []);
    setImageFiles([]); 
    setErrors({}); 

    // Convert specs object to array
    const specs = currentProduct?.specifications || {};
    const list = Object.keys(specs).map(key => ({ key, value: specs[key] }));
    setSpecList(list.length > 0 ? list : [{ key: '', value: '' }]);
  }, [currentProduct, getInitialFormData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSpecChange = (index, field, value) => {
    const newList = [...specList];
    newList[index][field] = value;
    setSpecList(newList);
  };

  const addSpecField = () => setSpecList([...specList, { key: '', value: '' }]);
  const removeSpecField = (index) => setSpecList(specList.filter((_, i) => i !== index));

  const handleSetMainImage = (url) => {
    setFormData(prev => ({ ...prev, mainImage: url }));
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

    // Convert specList array back to Object
    const specsObject = {};
    specList.forEach(item => {
      if (item.key.trim()) {
        specsObject[item.key.trim()] = item.value;
      }
    });

    const remainingImages = imagePreviews.filter(p => !p.startsWith('blob:'));
    const updatedFormData = { 
      ...formData, 
      images: remainingImages,
      specifications: specsObject
    };

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
    <div className="fixed inset-0 z-[1000] flex justify-end text-left">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        onClick={onBack}
      ></motion.div>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col z-[1001]"
      >
        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">
                {currentProduct ? 'Cập nhật Sản phẩm' : 'Hồ sơ Sản phẩm mới'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
              <Package size={12}/> Vận hành kho vận Nexus
            </p>
          </div>
          <button onClick={onBack} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
        </div>
        
        <div className="flex-1 p-8 space-y-12 overflow-y-auto no-scrollbar">
          <div className="space-y-12">
            {/* Basic Info Card */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-brand-600 pl-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Thông tin cơ bản</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1 block">Tên định danh sản phẩm</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleSlugify} 
                      className={`w-full px-6 py-4 bg-white border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-4 transition-all outline-none ${errors.name ? 'border-rose-500 focus:ring-rose-50' : 'border-slate-100 focus:border-brand-600 focus:ring-brand-50'}`} 
                      placeholder="VD: IPHONE 16 PRO MAX..." 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1 block">Mã SKU hệ thống</label>
                      <input 
                        type="text" 
                        name="sku" 
                        value={formData.sku} 
                        onChange={handleInputChange} 
                        className={`w-full px-6 py-4 bg-white border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-4 transition-all outline-none ${errors.sku ? 'border-rose-500 focus:ring-rose-50' : 'border-slate-100 focus:border-brand-600 focus:ring-brand-50'}`}
                        placeholder="VD: IP16-256-VN"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1 block">Danh mục hàng hóa</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-6 py-4 bg-white border-2 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-4 transition-all cursor-pointer ${errors.category ? 'border-rose-500 focus:ring-rose-50' : 'border-slate-100 focus:border-brand-600 focus:ring-brand-50'}`}
                      >
                        <option value="">Chọn danh mục...</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {Array(cat.level).fill('—').join(' ')} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1 block">Mô tả đặc tính</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      className="w-full h-32 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-brand-600 focus:ring-4 focus:ring-brand-50 outline-none transition-all resize-none" 
                      placeholder="Chi tiết về sản phẩm..."
                    />
                  </div>
                </div>
            </div>

            {/* Specifications Card */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-l-4 border-blue-600 pl-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Thông số kỹ thuật</h3>
                    <button 
                      type="button"
                      onClick={addSpecField}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                    >
                      <Plus size={14} /> Thêm thông số
                    </button>
                </div>

                <div className="space-y-4">
                  {specList.map((spec, index) => (
                    <div key={index} className="flex gap-4 animate-in slide-in-from-left-2">
                      <input 
                        type="text" 
                        placeholder="Nhãn (VD: RAM)" 
                        value={spec.key}
                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                        className="flex-1 px-5 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-all"
                      />
                      <input 
                        type="text" 
                        placeholder="Giá trị (VD: 16GB)" 
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="flex-[2] px-5 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:border-blue-600 transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => removeSpecField(index)}
                        className="p-3.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {specList.length === 0 && (
                    <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chưa có thông số nào</p>
                    </div>
                  )}
                </div>
            </div>

            {/* Media Card */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-purple-600 pl-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Tài nguyên Hình ảnh</h3>
                </div>

                <input type="file" multiple accept="image/*" id="file-upload" className="hidden" onChange={handleFileChange} />
                
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => {
                    let imageUrl = getProductImageUrl(preview);
                    const isMain = formData.mainImage === preview || (!formData.mainImage && index === 0);
                    
                    return (
                      <div key={index} className={`relative aspect-square bg-slate-50 rounded-2xl border-2 overflow-hidden group shadow-sm transition-all ${isMain ? 'border-amber-400 ring-4 ring-amber-50' : 'border-slate-100'}`}>
                        <img src={imageUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleSetMainImage(preview)} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isMain ? 'bg-amber-400 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-amber-400'}`}
                            title="Đặt làm ảnh chính"
                          >
                            <Star size={16} className={isMain ? "fill-white" : ""} />
                          </button>
                          <button onClick={() => handleRemoveImage(index)} className="w-8 h-8 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                        {isMain && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-amber-400 text-white text-[8px] font-black uppercase rounded-lg shadow-sm">
                            Main Image
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <label htmlFor="file-upload" className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-brand-300 transition-all group">
                    <Upload size={20} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-2">Upload</p>
                  </label>
                </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-emerald-600 pl-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Tài chính & Kho vận</h3>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1 block">Giá gốc niêm yết (VND)</label>
                      <div className="p-6 bg-slate-900 rounded-3xl shadow-2xl relative overflow-hidden group border-4 border-slate-800">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                              <CreditCard size={60} className="text-white" />
                          </div>
                          <div className="relative flex items-center">
                              <input 
                                  type="number" 
                                  name="price" 
                                  value={formData.price} 
                                  onChange={handleInputChange} 
                                  className="w-full bg-transparent border-none text-2xl font-black text-white placeholder:text-white/10 outline-none transition-all" 
                                  placeholder="0"
                              />
                              <span className="text-white/20 font-black text-lg ml-2">đ</span>
                          </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1 block">Giá khuyến mãi / Bán ra (VND)</label>
                      <div className="p-6 bg-white border-4 border-rose-100 rounded-3xl shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500">
                              <Zap size={60} />
                          </div>
                          <div className="relative flex items-center">
                              <input 
                                  type="number" 
                                  name="discountPrice" 
                                  value={formData.discountPrice} 
                                  onChange={handleInputChange} 
                                  className="w-full bg-transparent border-none text-2xl font-black text-slate-900 placeholder:text-slate-200 outline-none transition-all" 
                                  placeholder="0 (Để 0 nếu không giảm)"
                              />
                              <span className="text-slate-200 font-black text-lg ml-2">đ</span>
                          </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1 block">Tồn kho hiện hữu</label>
                        <input 
                            type="number" 
                            name="stock" 
                            value={formData.stock} 
                            onChange={handleInputChange} 
                            className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-brand-600 transition-all shadow-sm" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1 block">Trạng thái vận hành</label>
                        <select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleInputChange} 
                            className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-brand-600 shadow-sm cursor-pointer"
                        >
                            <option value="active">Kinh doanh</option>
                            <option value="draft">Bản nháp</option>
                            <option value="inactive">Ngừng bán</option>
                        </select>
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-[32px] border-4 border-amber-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Star size={20} className={formData.isFeatured ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Sản phẩm nổi bật</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Hiển thị tại trang chủ</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="isFeatured" 
                          checked={formData.isFeatured} 
                          onChange={handleInputChange} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                      </label>
                    </div>

                    {formData.isFeatured && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="space-y-4 pt-4 border-t border-amber-200"
                      >
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Lợi ích chính (Key Benefit)</label>
                          <input 
                            type="text" 
                            name="keyBenefit" 
                            value={formData.keyBenefit || ''} 
                            onChange={handleInputChange} 
                            placeholder="VD: Màn hình OLED rực rỡ..." 
                            className="w-full px-5 py-3 bg-white border-2 border-amber-100 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-amber-400 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest ml-1">Lý do nổi bật (Featured Reason)</label>
                          <textarea 
                            name="featuredReason" 
                            value={formData.featuredReason || ''} 
                            onChange={handleInputChange} 
                            placeholder="Tại sao sản phẩm này nên được khách hàng chú ý?" 
                            className="w-full h-24 px-5 py-3 bg-white border-2 border-amber-100 rounded-xl text-[10px] font-bold focus:border-amber-400 transition-all outline-none resize-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 flex justify-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="w-full flex gap-4">
            <button onClick={onBack} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
                Hủy thay đổi
            </button>
            <button onClick={handleSaveClick} className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                Xác nhận lưu kho <ShieldCheck size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const ProductPage = () => {
  console.log("ProductPage rendering - Version 6 (Specs & MainImage Added)");
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

      <AnimatePresence>
        {activeTab === 'form' && (
          <ProductFormView
            product={currentProduct}
            categories={categories}
            onBack={handleBackToList}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
