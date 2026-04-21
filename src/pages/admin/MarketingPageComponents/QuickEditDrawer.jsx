import { useState, useEffect } from 'react';
import { X, UploadSimple, Link as LinkIcon, CalendarBlank, TextT, Image as ImageIcon } from '@phosphor-icons/react';
import productApi from '../../../api/productApi';
import categoryApi from '../../../api/categoryApi';

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
      productApi.getAll().then(res => setProducts(res || [])); // Assuming array
      categoryApi.getAll().then(res => setCategories(res.data || [])); // Assuming {data: []} based on previous fix

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
        setPreviewUrl(banner.media?.url ? `http://127.0.0.1:5000${banner.media.url}` : '');
      } else {
        // Reset form
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

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}></div>
      <div className={`fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[70] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{mode === 'create' ? 'Thêm Banner Mới' : 'Cập nhật Banner'}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cấu hình hiển thị & Tracking</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-8 gap-8 bg-white">
          {[
            { id: 'basic', label: 'Thông tin', icon: TextT },
            { id: 'media', label: 'Hình ảnh', icon: ImageIcon },
            { id: 'link', label: 'Điều hướng', icon: LinkIcon },
            { id: 'schedule', label: 'Lịch chạy', icon: CalendarBlank },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
          
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tên chiến dịch</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none" placeholder="VD: Summer Sale 2024..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vị trí hiển thị</label>
                  <select name="position" value={formData.position} onChange={handleInputChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none cursor-pointer">
                    <option value="home-top">Home Slider (Top)</option>
                    <option value="home-mid">Giữa trang chủ</option>
                    <option value="popup">Popup Quảng cáo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none cursor-pointer">
                    <option value="active">Đang chạy (Active)</option>
                    <option value="scheduled">Lên lịch (Scheduled)</option>
                    <option value="inactive">Tạm ẩn (Inactive)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-brand-600 tracking-widest border-b border-slate-50 pb-2">Nội dung text (Overlay)</h4>
                <input type="text" name="title" value={formData.content.title} onChange={(e) => handleInputChange(e, 'content')} placeholder="Tiêu đề chính (Headline)" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold" />
                <input type="text" name="subtitle" value={formData.content.subtitle} onChange={(e) => handleInputChange(e, 'content')} placeholder="Tiêu đề phụ / Tagline" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-medium" />
                <input type="text" name="ctaText" value={formData.content.ctaText} onChange={(e) => handleInputChange(e, 'content')} placeholder="Nút bấm (VD: Mua ngay)" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-brand-600" />
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="w-full h-64 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all group bg-white relative overflow-hidden">
                {previewUrl ? (
                  mediaFile?.type?.startsWith('video') || formData.media?.kind === 'video' ? (
                    <video src={previewUrl} className="w-full h-full object-contain" controls />
                  ) : (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  )
                ) : (
                  <div className="text-center group-hover:scale-110 transition-transform">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:text-brand-600 group-hover:bg-white shadow-sm"><UploadSimple size={32} /></div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-600">Click để tải ảnh/video</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
              </label>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <ImageIcon size={20} className="text-amber-500 mt-0.5" />
                <div className="text-xs text-amber-700 leading-relaxed font-medium">
                  <strong>Lưu ý:</strong> Ảnh Banner Hero nên có kích thước <strong>1920x600px</strong>. Video ngắn dưới 10s (mp4) sẽ tự động autoplay.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loại điều hướng</label>
                <div className="grid grid-cols-4 gap-2">
                  {['none', 'product', 'category', 'external'].map(type => (
                    <button 
                      key={type} 
                      onClick={() => setFormData(prev => ({ ...prev, linkType: type }))}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wide border transition-all ${formData.linkType === type ? 'bg-brand-600 text-white border-brand-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {formData.linkType === 'product' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chọn Sản phẩm</label>
                  <select name="productId" value={formData.linkTarget.productId} onChange={(e) => handleInputChange(e, 'linkTarget')} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none cursor-pointer">
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {formData.linkType === 'category' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chọn Danh mục</label>
                  <select name="categoryId" value={formData.linkTarget.categoryId} onChange={(e) => handleInputChange(e, 'linkTarget')} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none cursor-pointer">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {formData.linkType === 'external' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Đường dẫn ngoài (URL)</label>
                  <input type="text" name="url" value={formData.linkTarget.url} onChange={(e) => handleInputChange(e, 'linkTarget')} placeholder="https://example.com/promo..." className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bắt đầu từ</label>
                  <input type="datetime-local" name="startAt" value={formData.schedule.startAt} onChange={(e) => handleInputChange(e, 'schedule')} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kết thúc lúc (Tùy chọn)</label>
                  <input type="datetime-local" name="endAt" value={formData.schedule.endAt} onChange={(e) => handleInputChange(e, 'schedule')} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Độ ưu tiên (Priority)</label>
                <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none" placeholder="0" />
                <p className="text-[10px] text-slate-400 font-medium ml-1">Số càng lớn càng hiển thị trước.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Hủy bỏ</button>
          <button onClick={handleSubmit} className="px-8 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all">Lưu Banner</button>
        </div>
      </div>
    </>
  );
};

export default QuickEditDrawer;
