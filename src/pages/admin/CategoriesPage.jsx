import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import categoryApi from '../../api/categoryApi';
import uploadApi from '../../api/uploadApi';
import { 
    Layers, Search, Plus, Folder, 
    CornerDownRight, Edit3, Trash2, X, 
    ChevronRight, ChevronDown, 
    ListTree, Image as ImageIcon, 
    ShieldCheck, RefreshCw, 
    Package, EyeOff, Clock
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// --- CONFIG & CONSTANTS ---
const STORAGE_EXPANDED = 'admin_categories_expanded';
const STORAGE_FILTERS = 'admin_categories_filters';

// --- UI COMPONENTS ---
const StatCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-5 transition-all duration-300 hover:shadow-md group">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 group-hover:scale-110 transition-transform ${color}`}>
            <Icon size={28} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{sub}</p>
        </div>
    </div>
);

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    
    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await categoryApi.getAll();
            setCategories(response.data || []);
        } catch (error) {
            addToast('Lỗi tải danh mục!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem(STORAGE_FILTERS);
        return saved ? JSON.parse(saved) : { status: 'all', level: 'all' };
    });

    const [expandedIds, setExpandedIds] = useState(() => {
        const saved = localStorage.getItem(STORAGE_EXPANDED);
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_FILTERS, JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        localStorage.setItem(STORAGE_EXPANDED, JSON.stringify(Array.from(expandedIds)));
    }, [expandedIds]);

    const [formMode, setFormMode] = useState('create'); 
    const [formData, setFormData] = useState({
        _id: '', name: '', slug: '', parentId: '', status: 'active', 
        order: 1, description: '', thumbnail: '', showInExplore: false, 
        seo: { metaTitle: '', metaDescription: '' }
    });
    const fileInputRef = useRef(null);

    const generateSlug = (name) => {
        return name.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const response = await uploadApi.uploadFile(file);
            const res = response.data;
            if (res.success) {
                setFormData({ ...formData, thumbnail: res.data.url });
                addToast('Tải ảnh thành công!', 'success');
            }
        } catch (err) {
            console.error("Upload error:", err);
            addToast('Lỗi tải ảnh!', 'error');
        }
    };

    const handleSave = async () => {
        if (!formData.name) return addToast('Tên danh mục là bắt buộc!', 'warning');
        setIsLoading(true);
        try {
            const payload = { ...formData };
            if (!payload.parentId) delete payload.parentId;
            
            if (formMode === 'create') {
                await categoryApi.create(payload);
                addToast('Tạo danh mục thành công!', 'success');
            } else {
                await categoryApi.update(formData._id, payload);
                addToast('Cập nhật thành công!', 'success');
            }
            setIsAddModalOpen(false);
            fetchData();
        } catch (err) {
            addToast('Lỗi khi lưu dữ liệu!', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await categoryApi.delete(id);
            addToast('Đã xóa thành công!', 'success');
            fetchData();
        } catch (err) {
            addToast('Lỗi khi xóa!', 'error');
        }
    };

    const buildHierarchy = useCallback((list) => {
        const map = {};
        list.forEach(cat => map[cat._id] = { ...cat, children: [] });
        const roots = [];
        list.forEach(cat => {
            if (cat.parentId && map[cat.parentId]) map[cat.parentId].children.push(map[cat._id]);
            else roots.push(map[cat._id]);
        });
        return roots;
    }, []);

    const filteredHierarchy = useMemo(() => {
        let list = categories.filter(c => !c.isDeleted);
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
        }
        if (filters.status !== 'all') list = list.filter(c => c.status === filters.status);
        
        const hierarchy = buildHierarchy(list);
        if (filters.level === 'root') return hierarchy;
        if (filters.level === 'sub') {
            const subs = [];
            const findSubs = (nodes) => nodes.forEach(n => { if (n.parentId) subs.push(n); findSubs(n.children); });
            findSubs(hierarchy);
            return subs;
        }
        return hierarchy;
    }, [categories, searchTerm, filters, buildHierarchy]);

    const stats = useMemo(() => ({
        totalProducts: categories.reduce((sum, c) => sum + (c.productCount || 0), 0),
        rootCount: categories.filter(c => !c.parentId && !c.isDeleted).length,
        subCount: categories.filter(c => c.parentId && !c.isDeleted).length,
        inactiveCount: categories.filter(c => c.status === 'inactive' && !c.isDeleted).length
    }), [categories]);

    const renderRow = (node, level = 0) => {
        const isExpanded = expandedIds.has(node._id);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <React.Fragment key={node._id}>
                <tr className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 24}px` }}>
                            {hasChildren ? (
                                <button 
                                    onClick={() => {
                                        const newExpanded = new Set(expandedIds);
                                        if (isExpanded) newExpanded.delete(node._id);
                                        else newExpanded.add(node._id);
                                        setExpandedIds(newExpanded);
                                    }}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-200"
                                >
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            ) : (
                                <div className="w-7 flex items-center justify-center text-slate-200">
                                    {level > 0 && <CornerDownRight size={14} />}
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${level === 0 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                    <Folder size={18} strokeWidth={2.5} />
                                </div>
                                <span className={`text-xs font-black uppercase tracking-tight ${level === 0 ? 'text-slate-800' : 'text-slate-600'}`}>{node.name}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-center hidden sm:table-cell">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden mx-auto shadow-inner">
                            {node.thumbnail ? <img src={node.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon size={18} className="text-slate-200 m-auto mt-3.5" />}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-center hidden sm:table-cell">
                        <code className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 border border-slate-200 tracking-tight">/{node.slug}</code>
                    </td>
                    <td className="px-6 py-5 text-center">
                        {node.showInExplore && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>}
                    </td>
                    <td className="px-6 py-5 text-center font-black text-slate-900 text-xs tracking-widest tabular-nums">
                        {node.productCount || 0}
                    </td>
                    <td className="px-6 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${node.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            {node.status}
                        </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button 
                                onClick={() => {
                                    setFormMode('edit');
                                    setFormData({ ...node, parentId: node.parentId || '' });
                                    setIsAddModalOpen(true);
                                }}
                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-2 border-transparent hover:border-blue-100"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDelete(node._id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-2 border-transparent hover:border-rose-100">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                </tr>
                {isExpanded && hasChildren && node.children.map(child => renderRow(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden text-left bg-[#f8fafc]">
            <div className="p-4 lg:p-8 overflow-y-auto no-scrollbar">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 text-left">
                    <div className="text-left">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-tighter">Phân cấp Danh mục ({categories.length})</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Quản lý cấu trúc ngành hàng và tổ chức dữ liệu Nexus.</p>
                    </div>
                    
                    <button 
                        onClick={() => {
                            setFormMode('create');
                            setFormData({
                                _id: '', name: '', slug: '', parentId: '', status: 'active', 
                                order: 1, description: '', thumbnail: '', showInExplore: false, seo: { metaTitle: '', metaDescription: '' }
                            });
                            setIsAddModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={16} /> Thêm danh mục mới
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Tổng sản phẩm" value={stats.totalProducts} sub="Sync từ Atlas" icon={Package} color="bg-blue-50 text-blue-600 border-blue-100" />
                    <StatCard title="Danh mục gốc" value={stats.rootCount} sub="Cấp độ root (0)" icon={Layers} color="bg-indigo-50 text-indigo-600 border-indigo-100" />
                    <StatCard title="Danh mục con" value={stats.subCount} sub="Cấp độ phụ thuộc" icon={ListTree} color="bg-amber-50 text-amber-600 border-amber-100" />
                    <StatCard title="Đang tạm ẩn" value={stats.inactiveCount} sub="Vô hiệu hóa web" icon={EyeOff} color="bg-rose-50 text-rose-600 border-rose-100" />
                </div>

                <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-xl overflow-hidden flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b-2 border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/30">
                        <div className="relative w-full lg:w-[400px] group">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Tìm theo tên hoặc đường dẫn slug..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-xs font-bold uppercase tracking-tight outline-none focus:border-blue-600 transition-all shadow-inner"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border-2 border-slate-100 shadow-sm">
                                <select 
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none px-4 py-2 cursor-pointer"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="active">Đang hiển thị</option>
                                    <option value="inactive">Đang tạm ẩn</option>
                                </select>
                                <div className="h-4 w-[1px] bg-slate-200"></div>
                                <select 
                                    value={filters.level}
                                    onChange={(e) => setFilters({...filters, level: e.target.value})}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none px-4 py-2 cursor-pointer"
                                >
                                    <option value="all">Tất cả cấp độ</option>
                                    <option value="root">Chỉ cấp Gốc</option>
                                    <option value="sub">Chỉ cấp Con</option>
                                </select>
                            </div>

                            <button 
                                onClick={() => {
                                    setFilters({ status: 'all', level: 'all' });
                                    setSearchTerm('');
                                }}
                                className="p-3 bg-white border-2 border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95"
                                title="Làm mới bộ lọc"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b-2 border-slate-100 font-black tracking-widest">
                                    <th className="px-8 py-6 w-[40%]">Danh mục / Cấu trúc</th>
                                    <th className="px-6 py-6 w-[10%] hidden sm:table-cell text-center">Preview</th>
                                    <th className="px-6 py-6 w-[15%] hidden sm:table-cell text-center">Slug Path</th>
                                    <th className="px-6 py-6 text-center w-[10%]">Explore</th>
                                    <th className="px-6 py-6 text-center w-[10%]">Quantity</th>
                                    <th className="px-6 py-6 text-center w-[13%]">Visibility</th>
                                    <th className="px-8 py-6 text-right w-[12%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-50">
                                {isLoading ? (
                                    <tr><td colSpan="7" className="py-24 text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="text-[10px] font-black uppercase text-slate-400 mt-4 tracking-widest">Đang tải cấu trúc từ server...</p></td></tr>
                                ) : filteredHierarchy.length > 0 ? (
                                    filteredHierarchy.map(node => renderRow(node))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest italic">Không tìm thấy danh mục phù hợp</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="px-8 py-6 bg-slate-50/50 border-t-2 border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex gap-8">
                            <span className="flex items-center gap-2 font-black"><div className="w-2 h-2 rounded-sm bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Root Level</span>
                            <span className="flex items-center gap-2 font-black"><div className="w-2 h-2 rounded-sm bg-slate-300"></div> Sub Category</span>
                        </div>
                        <span>Tổng cộng: {filteredHierarchy.length} mục</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[1000] flex justify-end text-left">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isLoading && setIsAddModalOpen(false)}></motion.div>
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col z-[1001]"
                    >
                        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="text-left">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">
                                    {formMode === 'create' ? 'Khởi tạo danh mục mới' : 'Cập nhật định danh mục'}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
                                    <Layers size={12}/> Vận hành hệ thống phân cấp Nexus
                                </p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="flex-1 p-8 space-y-12 overflow-y-auto custom-scrollbar no-scrollbar">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4 text-left">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Định danh cơ bản</h3>
                                </div>
                                <div className="space-y-6 text-left">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã định danh Nexus</label>
                                        <input type="text" value={formData._id || "Tự động phát sinh sau khi lưu"} readOnly className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 outline-none italic shadow-inner" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Tên danh mục nhân sự</label>
                                        <input type="text" placeholder="VD: iPhone 15 Series, MacBook M3..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đường dẫn truy cập (Slug)</label>
                                        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                                            <span className="pl-4 text-slate-400 font-black text-xs">/</span>
                                            <input type="text" value={formData.slug} className="w-full px-2 py-4 bg-transparent text-xs font-black text-slate-500 cursor-not-allowed outline-none" readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-l-4 border-indigo-600 pl-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Phân cấp & Vận hành</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Danh mục cha</label>
                                        <select value={formData.parentId || ''} onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })} className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-blue-600 cursor-pointer appearance-none">
                                            <option value="">-- Danh mục Gốc (Level 0) --</option>
                                            {categories.filter(c => !c.isDeleted && c._id !== formData._id).map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Thứ tự ưu tiên</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center justify-between">
                                        <div><h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Trạng thái</h5><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Visibility</p></div>
                                        <div className="flex p-1 bg-white rounded-xl border border-slate-200">
                                            <button onClick={() => setFormData({...formData, status: 'active'})} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${formData.status === 'active' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-slate-600'}`}>Hiện</button>
                                            <button onClick={() => setFormData({...formData, status: 'inactive'})} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${formData.status === 'inactive' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:text-slate-600'}`}>Ẩn</button>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center justify-between">
                                        <div><h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Khám phá</h5><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Featured</p></div>
                                        <div onClick={() => setFormData({...formData, showInExplore: !formData.showInExplore})} className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all flex items-center ${formData.showInExplore ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${formData.showInExplore ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-l-4 border-emerald-600 pl-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Nội dung & SEO</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Hình ảnh đại diện ngành hàng</label>
                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                        <div onClick={() => fileInputRef.current.click()} className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-300 hover:border-blue-300 hover:text-blue-500 transition-all cursor-pointer group relative overflow-hidden shadow-inner">
                                            {formData.thumbnail ? <img src={formData.thumbnail} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="flex flex-col items-center gap-4"><div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><ImageIcon size={32} strokeWidth={2.5}/></div><p className="font-black text-[10px] uppercase tracking-[0.2em]">Upload Master Image</p></div>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Thẻ tiêu đề SEO (Meta Title)</label>
                                        <input type="text" placeholder="Nexus Store | ..." value={formData.seo?.metaTitle || ''} onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })} className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Mô tả SEO (Meta Description)</label>
                                        <textarea value={formData.seo?.metaDescription || ''} onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })} className="w-full h-32 px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-600 shadow-sm resize-none" placeholder="Nhập mô tả chuẩn SEO..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t-2 bg-slate-50/80 backdrop-blur-xl sticky bottom-0 flex gap-4 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Hủy yêu cầu</button>
                            <button onClick={handleSave} disabled={isLoading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />} Phê duyệt khởi tạo
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}} />
        </div>
    );
};

export default CategoriesPage;