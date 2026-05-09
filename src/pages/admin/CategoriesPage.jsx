import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import categoryApi from '../../api/categoryApi';
import uploadApi from '../../api/uploadApi';
import { 
    Layers, Eye, FolderX, Search, Plus, Folder, 
    CornerDownRight, Edit3, Settings2, Trash2, X, 
    ChevronRight, ChevronDown, Info, LayoutGrid, 
    ListTree, GripVertical, Image as ImageIcon, 
    Globe, ShieldCheck, AlertCircle, RefreshCw, 
    CheckCircle2, Trash, History, ArrowLeft, Filter,
    Package, BarChart3, Keyboard, EyeOff
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// --- CONFIG & CONSTANTS ---
const USER_ROLE = 'admin'; 
const STORAGE_EXPANDED = 'admin_categories_expanded';
const STORAGE_FILTERS = 'admin_categories_filters';


// --- UI COMPONENTS ---

const StatCard = ({ title, value, sub, icon: Icon, color, onClick }) => (
    <button 
        onClick={onClick}
        disabled={!onClick}
        className={`group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all text-left w-full ${ 
            onClick ? 'hover:shadow-lg hover:-translate-y-1 active:scale-95 cursor-pointer' : 'cursor-default'
        }`}
    >
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color} shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-800 tabular-nums truncate">{value}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{sub}</p>
        </div>
        {onClick && <ChevronRight className="text-slate-200 group-hover:text-brand-500 transition-colors" size={20} />}
    </button>
);

// --- MAIN PAGE COMPONENT ---

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('active'); 
    const { addToast } = useToast();
    const [selectedIds, setSelectedIds] = useState(new Set());
    
    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await categoryApi.getAll();
            const categoriesData = response.data || [];
            setCategories(categoriesData);
        } catch (error) {
            console.error("LỖI: Không thể tải danh mục:", error);
            addToast('Lỗi tải danh mục!', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    
    // States for Filters
    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem(STORAGE_FILTERS);
        return saved ? JSON.parse(saved) : { status: 'all', level: 'all' };
    });

    const [expandedIds, setExpandedIds] = useState(() => {
        const saved = localStorage.getItem(STORAGE_EXPANDED);
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // Form State
    const [formMode, setFormMode] = useState('create'); 
    const [formData, setFormData] = useState({
        _id: '', name: '', slug: '', parentId: '', status: 'active', 
        order: 1, description: '', thumbnail: '', showInExplore: false, 
        seo: { metaTitle: '', metaDescription: '' }
    });
    const [activeFormTab, setActiveFormTab] = useState('basic');
    const fileInputRef = useRef(null);
    const modalRef = useRef(null);

    // --- LOGIC ---

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
            const res = await uploadApi.uploadImage(file);
            if (res.success) {
                setFormData({ ...formData, thumbnail: res.url });
                addToast('Tải ảnh thành công!', 'success');
            }
        } catch (err) {
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

    // --- HIERARCHY LOGIC ---
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

    // --- RENDER HELPERS ---
    const renderRow = (node, level = 0) => {
        const isExpanded = expandedIds.has(node._id);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <React.Fragment key={node._id}>
                <tr className="hover:bg-slate-50/50 transition-colors group">
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
                                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"
                                >
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            ) : (
                                <div className="w-6 flex items-center justify-center text-slate-200">
                                    {level > 0 && <CornerDownRight size={14} />}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${level === 0 ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <Folder size={16} />
                                </div>
                                <span className={`text-sm font-bold ${level === 0 ? 'text-slate-800' : 'text-slate-600'}`}>{node.name}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-center hidden sm:table-cell">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden mx-auto">
                            {node.thumbnail ? <img src={node.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-slate-300 m-auto mt-3" />}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-center hidden sm:table-cell">
                        <code className="text-[10px] font-bold bg-slate-50 px-2 py-1 rounded-lg text-slate-400 border border-slate-100">/{node.slug}</code>
                    </td>
                    <td className="px-6 py-5 text-center">
                        {node.showInExplore && <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />}
                    </td>
                    <td className="px-6 py-5 text-center font-black text-slate-800 text-xs tabular-nums">
                        {node.productCount || 0}
                    </td>
                    <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${node.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            {node.status}
                        </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1">
                            <button 
                                onClick={() => {
                                    setFormMode('edit');
                                    setFormData({ ...node, parentId: node.parentId || '' });
                                    setIsAddModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDelete(node._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
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
        <div className="animate-in fade-in duration-500 text-left pb-12">
            
            {/* SECTION: HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Quản lý Danh mục
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Tổ chức hệ thống phân cấp ngành hàng chuyên nghiệp. Tổng số: <span className="text-brand-600 font-bold">{categories.length}</span>
                    </p>
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
                    className="w-full md:w-auto px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus size={20} /> Thêm danh mục mới
                </button>
            </div>

            {/* SECTION: STATISTICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Tổng sản phẩm" value={stats.totalProducts} sub="Trong các danh mục" icon={Package} color="bg-brand-50 text-brand-600" onClick={() => {}} />
                <StatCard title="Danh mục gốc" value={stats.rootCount} sub="Cấp độ root (0)" icon={Layers} color="bg-emerald-50 text-emerald-600" />
                <StatCard title="Danh mục con" value={stats.subCount} sub="Cấp độ phụ thuộc" icon={ListTree} color="bg-amber-50 text-amber-600" />
                <StatCard title="Tạm ẩn" value={stats.inactiveCount} sub="Chờ kích hoạt lại" icon={EyeOff} color="bg-rose-50 text-rose-600" />
            </div>

            {/* SECTION: TABLE & FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/30">
                    <div className="relative w-full lg:w-96 group">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Tìm bằng tên hoặc đường dẫn slug..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            <select 
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                className="bg-transparent text-xs font-bold text-slate-600 outline-none px-3 py-1.5 cursor-pointer"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hiển thị</option>
                                <option value="inactive">Đang tạm ẩn</option>
                            </select>
                            <div className="h-4 w-px bg-slate-200"></div>
                            <select 
                                value={filters.level}
                                onChange={(e) => setFilters({...filters, level: e.target.value})}
                                className="bg-transparent text-xs font-bold text-slate-600 outline-none px-3 py-1.5 cursor-pointer"
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
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-600 hover:border-brand-100 transition-all shadow-sm"
                            title="Làm mới bộ lọc"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Hierarchy Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100 font-black tracking-widest">
                                <th className="px-8 py-5 w-[42%]">Danh mục / Cấu trúc</th>
                                <th className="px-6 py-5 w-[10%] hidden sm:table-cell text-center">Hình ảnh</th>
                                <th className="px-6 py-5 w-[15%] hidden sm:table-cell text-center">Slug</th>
                                <th className="px-6 py-5 text-center w-[10%]">Khám phá</th>
                                <th className="px-6 py-5 text-center w-[10%]">Sản phẩm</th>
                                <th className="px-6 py-5 text-center w-[13%]">Trạng thái</th>
                                <th className="px-8 py-5 text-right w-[13%]">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHierarchy.length > 0 ? (
                                filteredHierarchy.map(node => renderRow(node))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200 shadow-inner">
                                                <FolderX size={40} />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-800">Không tìm thấy dữ liệu</h4>
                                            <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                                                Không tìm thấy danh mục nào khớp với tiêu chí lọc của bạn.
                                            </p>
                                            <button 
                                                onClick={() => { setSearchTerm(''); setFilters({status:'all', level:'all'}); }}
                                                className="mt-6 text-brand-600 font-bold text-xs uppercase tracking-widest hover:underline"
                                            >
                                                Thiết lập lại bộ lọc
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Bottom Status Bar */}
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div> Danh mục Gốc</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Danh mục Con</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package size={12} className="text-slate-300" />
                        <span>Tổng cộng: {filteredHierarchy.length} mục hiển thị</span>
                    </div>
                </div>
            </div>

            {/* AREA: MODAL FORM */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isLoading && setIsAddModalOpen(false)}></div>
                    <div 
                        ref={modalRef}
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-200">
                                    <Edit3 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                                        {formMode === 'create' ? 'Thêm Danh mục' : 'Cập nhật mục'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hệ thống quản lý ngành hàng</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)} 
                                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 pt-4 gap-6 border-b border-slate-100 bg-slate-50/30">
                            {[ 
                                { id: 'basic', label: 'Cơ bản', icon: ListTree },
                                { id: 'media', label: 'Hình ảnh', icon: ImageIcon },
                                { id: 'seo', label: 'SEO', icon: Globe }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveFormTab(tab.id)}
                                    className={`pb-3 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${ 
                                        activeFormTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                            {activeFormTab === 'basic' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên danh mục *</label>
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-bold"
                                                placeholder="VD: iPhone, MacBook..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đường dẫn (Slug)</label>
                                            <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                                                <span className="pl-4 text-slate-400 font-bold text-xs">/</span>
                                                <input 
                                                    type="text" 
                                                    value={formData.slug}
                                                    className="w-full px-1 py-3 bg-transparent text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh mục cha</label>
                                            <select 
                                                value={formData.parentId || ''}
                                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-bold cursor-pointer"
                                            >
                                                <option value="">-- Danh mục gốc --</option>
                                                {categories.filter(c => !c.isDeleted && c._id !== formData._id).map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thứ tự hiển thị</label>
                                            <input 
                                                type="number" 
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Trạng thái</h5>
                                                <p className="text-[9px] text-slate-400 font-medium">Hiển thị trên website</p>
                                            </div>
                                            <div className="flex p-1 bg-white rounded-lg shadow-sm border border-slate-200">
                                                <button 
                                                    onClick={() => setFormData({...formData, status: 'active'})}
                                                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${formData.status === 'active' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-300 hover:text-slate-600'}`}
                                                >
                                                    Mở
                                                </button>
                                                <button 
                                                    onClick={() => setFormData({...formData, status: 'inactive'})}
                                                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${formData.status === 'inactive' ? 'bg-slate-200 text-slate-600 shadow-md' : 'text-slate-300 hover:text-slate-600'}`}
                                                >
                                                    Ẩn
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                            <div>
                                                <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Mục Khám phá</h5>
                                                <p className="text-[9px] text-slate-400 font-medium">Hiện ở trang chủ</p>
                                            </div>
                                            <div 
                                                onClick={() => setFormData({...formData, showInExplore: !formData.showInExplore})}
                                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all ${formData.showInExplore ? 'bg-brand-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.showInExplore ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeFormTab === 'media' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Hình ảnh đại diện</label>
                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                        <div 
                                            onClick={() => fileInputRef.current.click()}
                                            className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-brand-300 hover:text-brand-500 transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            {formData.thumbnail ? (
                                                <img src={formData.thumbnail} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform text-slate-400 group-hover:text-brand-500">
                                                        <ImageIcon size={32} />
                                                    </div>
                                                    <p className="mt-4 font-black text-[10px] uppercase tracking-widest">Tải ảnh lên</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả ngắn</label>
                                        <textarea 
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium resize-none shadow-inner"
                                            placeholder="Ghi chú nhanh..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {activeFormTab === 'seo' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="p-6 bg-slate-900 rounded-3xl shadow-xl space-y-3 border border-slate-800">
                                        <div className="flex items-center gap-2 text-brand-400 font-bold text-[10px] uppercase tracking-widest">
                                            <Globe size={14} /> Google Preview
                                        </div>
                                        <h4 className="text-lg font-bold text-blue-400 leading-tight">
                                            {formData.seo?.metaTitle || formData.name || 'Tiêu đề hiển thị...'}
                                        </h4>
                                        <p className="text-xs text-emerald-400/80 font-mono truncate">
                                            nexus-store.vn/{formData.slug || 'url-slug'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                                            {formData.seo?.metaDescription || 'Nhập mô tả SEO để cải thiện thứ hạng tìm kiếm...'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thẻ tiêu đề SEO</label>
                                        <input 
                                            type="text" 
                                            value={formData.seo?.metaTitle || ''}
                                            onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-bold"
                                            placeholder="Tiêu đề trang..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thẻ mô tả SEO</label>
                                        <textarea 
                                            value={formData.seo?.metaDescription || ''}
                                            onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                                            className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium resize-none shadow-inner"
                                            placeholder="Mô tả trang..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 py-3.5 text-slate-500 font-bold text-sm hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 shadow-sm active:scale-95"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex-[2] py-3.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                {formMode === 'create' ? 'Xác nhận tạo' : 'Lưu cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                .fade-in { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                input::placeholder, textarea::placeholder {
                    font-weight: 500;
                    color: #cbd5e1;
                }
            `}} />
        </div>
    );
};
export default CategoriesPage;
