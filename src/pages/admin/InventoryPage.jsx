import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Package, Plus, Search, Filter, Edit2, Trash2, 
  ChevronRight, X, Save, AlertCircle, HardDrive,
  Cpu, Battery, Smartphone, Speaker, Camera, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import partApi from '../../api/partApi';
import { useToast } from '../../contexts/ToastContext';

const InventoryPage = () => {
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Other',
    stock: 0,
    price: 0,
    compatibleDevices: '',
    description: ''
  });

  const categories = ['Screen', 'Battery', 'Speaker', 'Motherboard', 'Camera', 'Housing', 'Other'];

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    setIsLoading(true);
    try {
      const response = await partApi.getAll();
      setParts(response.data || response);
    } catch (error) {
      addToast('Không thể tải danh sách linh kiện', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (part = null) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        sku: part.sku,
        category: part.category,
        stock: part.stock,
        price: part.price,
        compatibleDevices: Array.isArray(part.compatibleDevices) ? part.compatibleDevices.join(', ') : '',
        description: part.description || ''
      });
    } else {
      setEditingPart(null);
      setFormData({
        name: '',
        sku: `PART-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        category: 'Other',
        stock: 0,
        price: 0,
        compatibleDevices: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if(e) e.preventDefault();
    const data = {
      ...formData,
      compatibleDevices: formData.compatibleDevices.split(',').map(d => d.trim()).filter(d => d !== ''),
      stock: Number(formData.stock),
      price: Number(formData.price)
    };

    try {
      if (editingPart) {
        await partApi.update(editingPart._id, data);
        addToast('Đã cập nhật linh kiện', 'success');
      } else {
        await partApi.create(data);
        addToast('Đã thêm linh kiện mới', 'success');
      }
      setIsModalOpen(false);
      fetchParts();
    } catch (error) {
      addToast(error.response?.data?.message || 'Lỗi khi lưu linh kiện', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa linh kiện này?')) {
      try {
        await partApi.delete(id);
        addToast('Đã xóa linh kiện', 'success');
        fetchParts();
      } catch (error) {
        addToast('Lỗi khi xóa linh kiện', 'error');
      }
    }
  };

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         part.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || part.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading && parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Đang kiểm kê kho...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 text-left pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase tracking-tighter">
            Kho Linh kiện
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                <Layers size={12}/> {filteredParts.length} Chủng loại
            </span>
          </div>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-200 transition-all active:scale-95"
        >
          <Plus size={18} /> Nhập linh kiện mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên linh kiện, SKU..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-600 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-tight outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-brand-600 transition-all cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Linh kiện / SKU</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Danh mục</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tồn kho</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tương thích</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[120px]">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filteredParts.map((part) => (
                <tr key={part._id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        <HardDrive size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-xs truncate max-w-[200px] uppercase tracking-tight">{part.name}</div>
                        <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{part.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase border border-slate-200">
                      {part.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                        <span className={`text-sm font-black tabular-nums ${part.stock < 5 ? 'text-rose-500' : 'text-slate-900'}`}>
                            {part.stock}
                        </span>
                        {part.stock < 5 && <span className="text-[8px] font-black uppercase text-rose-400 animate-pulse">Low stock</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900 text-xs tabular-nums tracking-widest">
                    {part.price.toLocaleString()}đ
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {part.compatibleDevices.slice(0, 2).map((dev, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">
                          {dev}
                        </span>
                      ))}
                      {part.compatibleDevices.length > 2 && (
                        <span className="text-[9px] font-black text-slate-300 uppercase">+{part.compatibleDevices.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => handleOpenModal(part)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border-2 border-transparent">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(part._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-2 border-transparent">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Sử dụng Portal */}
      <AnimatePresence>
        {isModalOpen && (
          <PartFormModal 
            onClose={() => setIsModalOpen(false)}
            editingPart={editingPart}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT: PORTAL MODAL ---
const PartFormModal = ({ onClose, editingPart, formData, setFormData, onSubmit, categories }) => {
    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex justify-end text-left">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></motion.div>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col z-[10000]">
            <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-tighter italic">
                    {editingPart ? 'Cập nhật linh kiện' : 'Nhập kho linh kiện'}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><Plus size={12}/> Vận hành chuỗi cung ứng Nexus</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"><X size={24} /></button>
            </div>

            <div className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-800 tracking-widest ml-1">Tên linh kiện *</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-600 focus:bg-white text-sm font-bold transition-all shadow-sm" placeholder="VD: Màn hình iPhone 16..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-800 tracking-widest ml-1">Mã SKU định danh *</label>
                    <input required type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-600 focus:bg-white text-sm font-bold transition-all shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-800 tracking-widest ml-1">Phân loại linh kiện</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none cursor-pointer">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-800 tracking-widest ml-1">Số lượng nhập kho</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-800 tracking-widest ml-1 block">Giá nhập hệ thống (VND)</label>
                  <div className="p-8 bg-slate-900 rounded-[32px] shadow-2xl relative overflow-hidden group border-4 border-slate-800">
                    <div className="absolute top-0 right-0 p-6 opacity-10 text-white"><Package size={80}/></div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 block italic">Unit Price</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="bg-transparent border-none p-0 text-3xl font-black text-brand-400 outline-none w-full tabular-nums tracking-widest" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-800 tracking-widest ml-1">Thiết bị tương thích (cách nhau bởi dấu phẩy)</label>
                  <textarea value={formData.compatibleDevices} onChange={(e) => setFormData({...formData, compatibleDevices: e.target.value})} className="w-full h-24 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-brand-600 outline-none transition-all resize-none" placeholder="VD: iPhone 16 Pro, iPhone 16 Pro Max..." />
                </div>
              </div>
            </div>

            <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 z-20 flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm">Hủy bỏ</button>
              <button onClick={onSubmit} className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save size={18} /> Xác nhận lưu kho
              </button>
            </div>
          </motion.div>
        </div>
    );
    return createPortal(modalContent, document.body);
};

export default InventoryPage;
