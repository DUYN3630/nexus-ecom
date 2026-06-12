import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Calendar, Type, Image as ImageIcon, Save } from 'lucide-react';
import productApi from '../../../api/productApi';
import categoryApi from '../../../api/categoryApi';
import getProductImageUrl from '../../../utils/getProductImageUrl';

const QuickEditDrawer = ({ banner, mode, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '', type: 'hero', position: 'home-top', status: 'active', priority: 0,
    media: { url: '', kind: 'image' },
    content: { title: '', subtitle: '', ctaText: '' },
    linkType: 'none',
    linkTarget: { productId: '', categoryId: '', url: '' },
    schedule: { startAt: '', endAt: '' }
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Lists for selection
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Load products/categories for selection
      productApi.getAll().then(res => setProducts(res.data || [])); 
      categoryApi.getAll().then(res => setCategories(res.data || [])); 

      if (banner && mode === 'edit') {
        setFormData({
          ...banner,
          linkTarget: {
            productId: banner.linkTarget?.productId?._id || banner.linkTarget?.productId || '',
            categoryId: banner.linkTarget?.categoryId?._id || banner.linkTarget?.categoryId || '',
            url: banner.linkTarget?.url || ''
          },
          schedule: {
          startAt: banner.schedule?.startAt ? new Date(banner.schedule.startAt).toISOString().slice(0, 16) : '',
          endAt: banner.schedule?.endAt ? new Date(banner.schedule.endAt).toISOString().slice(0, 16) : ''
          }
          });
          setPreviewUrl(getProductImageUrl(banner.media?.url));
          } else {        // Reset form
        setFormData({
            name: '', type: 'hero', position: 'home-top', status: 'active', priority: 0,
            media: { url: '', kind: 'image' },
            content: { title: '', subtitle: '', ctaText: '' },
            linkType: 'none',
            linkTarget: { productId: '', categoryId: '', url: '' },
            schedule: { startAt: '', endAt: '' }
        });
        setPreviewUrl('');
        setMediaFile(null);
      }
    }
  }, [isOpen, banner, mode]);

  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    const payload = { ...formData };
    if (mediaFile) payload.mediaFile = mediaFile;
    if (mode === 'edit') payload.existingMediaUrl = banner.media?.url;
    onSave(payload, mode);
    onClose();
  };

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end text-left">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose}
      ></motion.div>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col z-[10000]"
      >
        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">
                {mode === 'create' ? 'Khởi tạo Banner' : 'Cập nhật Banner'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
              <Calendar size={12}/> Vận hành chiến dịch Marketing
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 bg-white overflow-x-auto no-scrollbar">
          {[
            { id: 'basic', label: 'Thông tin', icon: Type },
            { id: 'media', label: 'Hình ảnh', icon: ImageIcon },
            { id: 'link', label: 'Điều hướng', icon: LinkIcon },
            { id: 'schedule', label: 'Lịch chạy', icon: Calendar },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20 no-scrollbar text-left">
          
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tên chiến dịch *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm" placeholder="VD: Summer Sale 2026..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Vị trí hiển thị</label>
                  <select name="position" value={formData.position} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-1 focus:ring-brand-500 transition-all shadow-sm">
                    <option value="home-top">Hero Slider (Động)</option>
                    <option value="hero-static">Hero Banner (Tĩnh)</option>
                    <option value="home-mid">Giữa trang chủ</option>
                    <option value="popup">Popup Quảng cáo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Trạng thái vận hành</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-1 focus:ring-brand-500 transition-all shadow-sm">
                    <option value="active">🟢 Đang chạy (Active)</option>
                    <option value="scheduled">🟡 Lên lịch (Scheduled)</option>
                    <option value="inactive">🔴 Tạm ẩn (Inactive)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <h4 className="text-[11px] font-black uppercase text-brand-600 tracking-widest border-b border-slate-50 pb-3 flex items-center gap-2">
                    <Type size={14} /> Nội dung hiển thị (Overlay)
                </h4>
                <div className="space-y-4">
                    <input type="text" name="title" value={formData.content.title} onChange={(e) => handleInputChange(e, 'content')} placeholder="Tiêu đề chính (Headline)" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-800 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all outline-none" />
                    <input type="text" name="subtitle" value={formData.content.subtitle} onChange={(e) => handleInputChange(e, 'content')} placeholder="Tiêu đề phụ / Tagline" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all outline-none" />
                    <input type="text" name="ctaText" value={formData.content.ctaText} onChange={(e) => handleInputChange(e, 'content')} placeholder="Chữ trên nút (VD: Khám phá ngay)" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black text-brand-600 uppercase tracking-widest focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <label className="w-full h-72 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all group bg-white relative overflow-hidden shadow-inner">
                {previewUrl ? (
                  mediaFile?.type?.startsWith('video') || formData.media?.kind === 'video' ? (
                    <video src={previewUrl} className="w-full h-full object-contain" controls />
                  ) : (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  )
                ) : (
                  <div className="text-center group-hover:scale-105 transition-transform duration-500">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-brand-600 group-hover:bg-white shadow-sm border border-slate-100 group-hover:border-brand-200"><Upload size={32} /></div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600">Chọn tệp tin ảnh hoặc video</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
              </label>
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500"><ImageIcon size={18} /></div>
                <div className="text-[11px] text-amber-700 leading-relaxed font-bold">
                  Khuyến nghị: Ảnh nên có tỷ lệ <strong>16:9</strong> hoặc <strong>1920x600px</strong> cho Slider. Định dạng hỗ trợ: JPG, PNG, MP4 (dưới 10MB).
                </div>
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Loại hình liên kết</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                      { id: 'none', label: 'Không có' },
                      { id: 'product', label: 'Sản phẩm' },
                      { id: 'category', label: 'Danh mục' },
                      { id: 'external', label: 'Link ngoài' }
                  ].map(type => (
                    <button 
                      key={type.id} 
                      onClick={() => setFormData(prev => ({ ...prev, linkType: type.id }))}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${formData.linkType === type.id ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-100' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.linkType === 'product' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Chọn Sản phẩm mục tiêu</label>
                  <select name="productId" value={formData.linkTarget.productId} onChange={(e) => handleInputChange(e, 'linkTarget')} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-1 focus:ring-brand-500 shadow-sm">
                    <option value="">-- Danh sách sản phẩm --</option>
                    {Array.isArray(products) && products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {formData.linkType === 'category' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Chọn Danh mục ngành hàng</label>
                  <select name="categoryId" value={formData.linkTarget.categoryId} onChange={(e) => handleInputChange(e, 'linkTarget')} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-1 focus:ring-brand-500 shadow-sm">
                    <option value="">-- Danh sách danh mục --</option>
                    {Array.isArray(categories) && categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {formData.linkType === 'external' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Đường dẫn đích (URL)</label>
                  <div className="relative group">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500" size={16} />
                    <input type="text" name="url" value={formData.linkTarget.url} onChange={(e) => handleInputChange(e, 'linkTarget')} placeholder="https://..." className="w-full pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 shadow-sm" />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Calendar size={12} /> Bắt đầu từ</label>
                  <input type="datetime-local" name="startAt" value={formData.schedule.startAt} onChange={(e) => handleInputChange(e, 'schedule')} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Calendar size={12} /> Kết thúc (Tùy chọn)</label>
                  <input type="datetime-local" name="endAt" value={formData.schedule.endAt} onChange={(e) => handleInputChange(e, 'schedule')} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-brand-500 shadow-sm" />
                </div>
              </div>
              <div className="space-y-2 pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center justify-between">
                    <span>Độ ưu tiên hiển thị (Priority)</span>
                    <span className="text-brand-600">{formData.priority}</span>
                </label>
                <input 
                    type="range" name="priority" min="0" max="100"
                    value={formData.priority} onChange={handleInputChange} 
                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600" 
                />
                <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">
                    <span>Thấp</span>
                    <span>Cao nhất</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 flex justify-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="w-full flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95">Hủy bỏ</button>
            <button onClick={handleSubmit} className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-3 active:scale-95">
              <Save size={18} /> Xác nhận & Lưu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default QuickEditDrawer;
