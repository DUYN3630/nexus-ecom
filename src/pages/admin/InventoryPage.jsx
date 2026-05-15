import React, { useState, useEffect } from 'react';
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
        compatibleDevices: part.compatibleDevices.join(', '),
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
    e.preventDefault();
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
        addToast('Không thể xóa linh kiện', 'error');
      }
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Screen': return <Smartphone size={16} />;
      case 'Battery': return <Battery size={16} />;
      case 'Motherboard': return <Cpu size={16} />;
      case 'Speaker': return <Speaker size={16} />;
      case 'Camera': return <Camera size={16} />;
      default: return <Layers size={16} />;
    }
  };

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          part.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || part.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 text-left bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Inventory <span className="text-brand-600">Management</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">Quản lý kho linh kiện và phụ tùng thay thế</p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} /> Thêm linh kiện mới
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Tổng số loại', value: parts.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Trong kho', value: parts.reduce((acc, curr) => acc + curr.stock, 0), icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Sắp hết hàng', value: parts.filter(p => p.stock < 5).length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Tổng giá trị', value: `${parts.reduce((acc, curr) => acc + (curr.stock * curr.price), 0).toLocaleString()}đ`, icon: HardDrive, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm theo tên hoặc SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white text-sm font-medium transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-slate-400 ml-2" size={18} />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 outline-none text-xs font-black uppercase tracking-widest text-slate-600 focus:border-brand-500/30 transition-all"
            >
              <option value="All">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parts Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-8 py-6">Linh kiện</th>
                  <th className="px-8 py-6">SKU & Danh mục</th>
                  <th className="px-8 py-6">Số lượng</th>
                  <th className="px-8 py-6">Giá nhập</th>
                  <th className="px-8 py-6">Tương thích</th>
                  <th className="px-8 py-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Đang lấy dữ liệu kho...</p>
                    </div>
                  </td></tr>
                ) : filteredParts.length === 0 ? (
                  <tr><td colSpan="6" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <Package size={48} className="text-slate-300" />
                       <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Kho trống hoặc không tìm thấy linh kiện</p>
                    </div>
                  </td></tr>
                ) : (
                  filteredParts.map((part) => (
                    <tr key={part._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-slate-800 tracking-tight">{part.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium line-clamp-1 italic">{part.description || 'Không có mô tả'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter">#{part.sku}</span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit">
                            {getCategoryIcon(part.category)} {part.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${part.stock < 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {part.stock}
                          </span>
                          {part.stock < 5 && (
                            <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded animate-pulse">Low</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-700">
                        {part.price.toLocaleString()}đ
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {part.compatibleDevices.slice(0, 3).map((dev, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">
                              {dev}
                            </span>
                          ))}
                          {part.compatibleDevices.length > 3 && (
                            <span className="text-[9px] font-bold text-slate-400">+{part.compatibleDevices.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(part)}
                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(part._id)}
                            className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                    <Plus size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">
                      {editingPart ? 'Cập nhật linh kiện' : 'Thêm linh kiện mới'}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thông tin chi tiết trong kho</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên linh kiện</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white text-sm font-bold transition-all"
                      placeholder="VD: Màn hình iPhone 16 Pro Max"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mã SKU</label>
                    <input 
                      required
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white text-sm font-mono font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Danh mục</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white text-xs font-black uppercase tracking-widest transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Số lượng</label>
                      <input 
                        required
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white text-sm font-bold transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Giá nhập</label>
                      <input 
                        required
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white text-sm font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Thiết bị tương thích (cách nhau bởi dấu phẩy)</label>
                  <input 
                    type="text"
                    value={formData.compatibleDevices}
                    onChange={(e) => setFormData({...formData, compatibleDevices: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white text-sm font-medium transition-all"
                    placeholder="VD: iPhone 16 Pro Max, iPhone 16 Pro"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả linh kiện</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500/30 focus:bg-white text-sm font-medium h-24 transition-all"
                    placeholder="Tình trạng, nguồn gốc, chế độ bảo hành..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-brand-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 group active:scale-95"
                >
                  <Save size={20} /> {editingPart ? 'Cập nhật kho' : 'Xác nhận nhập kho'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryPage;
