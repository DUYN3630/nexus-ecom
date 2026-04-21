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
        className={`group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-all text-left w-full ${ 
            onClick ? 'hover:shadow-xl hover:-translate-y-1 active:scale-95 cursor-pointer' : 'cursor-default'
        }`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-inner group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 tabular-nums">{value}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{sub}</p>
        </div>
        {onClick && <ChevronRight className="text-slate-200 group-hover:text-indigo-500 transition-colors" size={20} />}
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
        console.log("--- Bắt đầu quá trình tải danh mục ---");
        try {
            const response = await categoryApi.getAll();
            console.log("Phản hồi gốc từ API:", response);
            
            // FIX: axiosClient đã return response.data
            // Controller trả về { success: true, data: [...] }
            // Nên mảng categories nằm ở response.data
            const categoriesData = response.data || [];
            console.log("Dữ liệu danh mục đã xử lý:", categoriesData);
            
            setCategories(categoriesData);
            if (categoriesData.length === 0) {
                addToast('Tải thành công nhưng không có danh mục nào trong database.', 'info');
            }

        } catch (error) {
            console.error("LỖI: Không thể tải danh mục:", error);
            addToast('Lỗi tải danh mục! Kiểm tra Console để xem chi tiết.', 'error');
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
        order: 1, description: '', thumbnail: '', showInExplore: false, seo: { metaTitle: '', metaDescription: '' }
    });
    const [activeFormTab, setActiveFormTab] = useState('basic');

    // Ref for focus management
    const modalRef = useRef(null);
    const fileInputRef = useRef(null); // Ref cho input file

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const response = await uploadApi.uploadFile(file);
            const resData = response.data; 

            if (resData.success) {
                setFormData(prev => ({ ...prev, thumbnail: resData.data.url }));
                addToast('Tải ảnh lên thành công!', 'success');
            } else {
                addToast('Upload thất bại: ' + (resData.message || 'Lỗi không xác định'), 'error');
            }
        } catch (error) {
            console.error("Upload failed:", error);
            addToast('Tải ảnh thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // --- LOGIC: KEYBOARD SHORTCUTS ---

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isAddModalOpen) {
                setIsAddModalOpen(false);
            }
            if (e.key === 'Enter' && isAddModalOpen && e.ctrlKey) {
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAddModalOpen, formData]);

    // --- LOGIC: PERSISTENCE ---

    useEffect(() => {
        localStorage.setItem(STORAGE_FILTERS, JSON.stringify(filters));
    }, [filters]);

    // --- LOGIC: CALCULATED STATS ---

    const stats = useMemo(() => {
        const active = categories.filter(c => !c.isDeleted);
        return {
            totalProducts: active.reduce((sum, c) => sum + (c.productCount || 0), 0),
            rootCount: active.filter(c => !c.parentId).length,
            subCount: active.filter(c => c.parentId).length,
            inactiveCount: active.filter(c => c.status === 'inactive').length
        };
    }, [categories]);

    // --- LOGIC: ACTIONS ---

    const handleSave = async () => {
        if (!formData.name.trim()) {
            addToast('Vui lòng nhập tên danh mục', 'error');
            return;
        }
        
        const payload = {
            ...formData,
            slug: formData.slug || generateSlug(formData.name),
        };

        setIsLoading(true);
        try {
            if (formMode === 'create') {
                await categoryApi.create(payload);
                addToast('Đã tạo danh mục mới thành công!', 'success');
            } else {
                await categoryApi.update(payload._id, payload);
                addToast('Đã cập nhật thông tin thành công!', 'success');
            }
            setIsAddModalOpen(false);
            fetchData(); 
        } catch (err) {
            console.error("Failed to save category:", err);
            const errorMsg = err.response?.data?.message || 'Có lỗi hệ thống xảy ra.';
            addToast(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Kiểm tra kỹ các liên kết trước khi xóa.')) {
            return;
        }

        setIsLoading(true);
        try {
            await categoryApi.delete(id);
            addToast('Đã xóa danh mục thành công (Safe Delete).', 'success');
            fetchData(); 
        } catch (err) {
            console.error("Failed to delete category:", err);
            const resData = err.response?.data;
            const errorMsg = resData?.message || 'Không thể xóa danh mục.';
            
            if (resData?.code === 'HAS_PRODUCTS' || resData?.code === 'IS_EXPLORE') {
                if (window.confirm(`${errorMsg}\n\n💡 GỢI Ý: Bạn có muốn chuyển danh mục này sang trạng thái \"ẨN\" (Tạm ngưng) thay vì xóa không?`)) {
                    try {
                        await categoryApi.update(id, { status: 'inactive', showInExplore: false });
                        addToast('Đã chuyển danh mục sang trạng thái "Ẩn" an toàn.', 'success');
                        fetchData();
                    } catch (updateErr) {
                        addToast('Không thể cập nhật trạng thái danh mục.', 'error');
                    }
                }
            } else {
                addToast(errorMsg, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (text) => {
        return text.toLowerCase()
            .normalize("NFD").replace(/[̀-͢]/g, "")
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // --- RENDER LOGIC ---

    const filteredHierarchy = useMemo(() => {
        const rawData = categories.filter(c => {
            const isTrash = viewMode === 'trash';
            if (isTrash !== c.isDeleted) return false;
            
            if (filters.status !== 'all' && c.status !== filters.status) return false;
            if (filters.level === 'root' && c.parentId !== null) return false;
            if (filters.level === 'sub' && c.parentId === null) return false;
            
            if (searchTerm.trim()) {
                return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       c.slug.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });

        if (searchTerm.trim() || filters.level !== 'all') return rawData.sort((a, b) => a.order - b.order);

        const buildTree = (data, pId = null) => {
            return data
                .filter(item => item.parentId === pId)
                .map(item => ({ ...item, children: buildTree(data, item._id) }))
                .sort((a, b) => a.order - b.order);
        };

        return buildTree(rawData);
    }, [categories, viewMode, searchTerm, filters]);

    const renderRow = (node, level = 0) => {
        const isExpanded = expandedIds.has(node._id);
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = selectedIds.has(node._id);

        return (
            <React.Fragment key={node._id}>
                <tr className={`group border-b border-slate-50 transition-all hover:bg-slate-50/80 ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 28}px` }}>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={() => {
                                        const next = new Set(selectedIds);
                                        if (next.has(node._id)) next.delete(node._id);
                                        else next.add(node._id);
                                        setSelectedIds(next);
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div className="hidden md:block cursor-grab text-slate-200 hover:text-slate-400 p-1">
                                    <GripVertical size={14} />
                                </div>
                            </div>
                            
                            <div className="w-6 flex items-center justify-center">
                                {hasChildren && (
                                    <button 
                                        onClick={() => {
                                            const next = new Set(expandedIds);
                                            if (next.has(node._id)) next.delete(node._id);
                                            else next.add(node._id);
                                            setExpandedIds(next);
                                            localStorage.setItem(STORAGE_EXPANDED, JSON.stringify(Array.from(next)));
                                        }}
                                        aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                                    >
                                        {isExpanded ? <ChevronDown size={16} className="text-indigo-500" strokeWidth={3} /> : <ChevronRight size={16} className="text-slate-400" strokeWidth={3} />}
                                    </button>
                                )}
                            </div>

                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${level === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {level === 0 ? <Folder size={14} /> : <CornerDownRight size={14} />}
                            </div>

                            <div className="flex flex-col">
                                <span className={`text-sm tracking-tight ${level === 0 ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{node.name}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                        {node.thumbnail ? (
                            <img 
                                src={(() => {
                                    const thumb = typeof node.thumbnail === 'object' ? node.thumbnail.url : node.thumbnail;
                                    if (!thumb) return 'https://via.placeholder.com/150?text=No+Image';
                                    return thumb.startsWith('http') ? thumb : `http://127.0.0.1:5000${thumb.startsWith('/') ? '' : '/'}${thumb}`;
                                })()} 
                                alt="" 
                                className="w-10 h-10 rounded-lg object-cover shadow-sm" 
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                                <ImageIcon size={16} />
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                        <code className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded italic">/{node.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {node.showInExplore ? (
                            <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                        ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-auto"></div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button 
                            onClick={() => addToast(`Chuyển hướng đến danh sách sản phẩm của: ${node.name}`, 'info')}
                            className="inline-flex flex-col items-center group/btn"
                        >
                            <span className="text-xs font-black text-slate-700 group-hover/btn:text-indigo-600 transition-colors">{node.productCount}</span>
                            <span className="text-[8px] font-black uppercase text-slate-300 tracking-tighter">Sản phẩm</span>
                        </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${ 
                            node.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                            {node.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 transition-all">
                            <button 
                                onClick={() => { setFormMode('edit'); setFormData(node); setIsAddModalOpen(true); }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all"><Settings2 size={16} /></button>
                            <button onClick={() => handleDelete(node._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
                {hasChildren && isExpanded && node.children.map(child => renderRow(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 relative font-sans text-slate-900">

            {/* AREA: TOP SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
                
                {/* SECTION: HEADER */}
                <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 fade-in">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full w-fit">
                            <Keyboard size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Admin Pro Dashboard</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <ListTree size={36} className="text-indigo-600" />
                            QUẢN LÝ DANH MỤC
                        </h1>
                        <p className="text-sm text-slate-500 font-medium max-w-xl">
                            Hệ thống phân cấp đa tầng thông minh. Tối ưu hóa trải nghiệm khách hàng và cấu trúc URL chuẩn SEO.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => {
                                setFormMode('create');
                                setFormData({
                                    _id: '', name: '', slug: '', parentId: '', status: 'active', 
                                    order: 1, description: '', thumbnail: '', showInExplore: false, seo: { metaTitle: '', metaDescription: '' }
                                });
                                setIsAddModalOpen(true);
                            }}
                            className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-[1.5rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} strokeWidth={3} /> Tạo mới
                        </button>
                    </div>
                </section>

                {/* SECTION: STATISTICS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Tổng Sản phẩm" value={stats.totalProducts} sub="Toàn bộ gian hàng" icon={Package} color="bg-indigo-50 text-indigo-600" onClick={() => addToast('Lọc sản phẩm theo danh mục...', 'info')} />
                    <StatCard title="Ngành hàng Gốc" value={stats.rootCount} sub="Cấp độ 0 (Root)" icon={Layers} color="bg-emerald-50 text-emerald-600" />
                    <StatCard title="Danh mục Phụ" value={stats.subCount} sub="Phân cấp con" icon={ListTree} color="bg-amber-50 text-amber-600" />
                    <StatCard title="Tạm ẩn" value={stats.inactiveCount} sub="Chờ kích hoạt" icon={EyeOff} color="bg-rose-50 text-rose-600" />
                </section>

                {/* SECTION: TABLE & FILTERS */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col min-h-[600px] fade-in">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/50 backdrop-blur-md sticky top-0 z-40">
                        <div className="relative w-full lg:w-96">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Tìm danh mục, slug hoặc ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-indigo-600/5 outline-none font-semibold transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5 border-r border-slate-200 mr-1">
                                    <Filter size={12} /> Lọc
                                </div>
                                <select 
                                    value={filters.status}
                                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                                    className="bg-transparent text-xs font-bold text-slate-600 outline-none pr-4 cursor-pointer"
                                >
                                    <option value="all">Tất cả Trạng thái</option>
                                    <option value="active">Đang hiển thị</option>
                                    <option value="inactive">Đang ẩn</option>
                                </select>
                                <select 
                                    value={filters.level}
                                    onChange={(e) => setFilters({...filters, level: e.target.value})}
                                    className="bg-transparent text-xs font-bold text-slate-600 outline-none pr-4 cursor-pointer border-l border-slate-200 pl-2"
                                >
                                    <option value="all">Tất cả Cấp độ</option>
                                    <option value="root">Chỉ danh mục Gốc</option>
                                    <option value="sub">Chỉ danh mục Con</option>
                                </select>
                            </div>

                            <button 
                                onClick={() => {
                                    setFilters({ status: 'all', level: 'all' });
                                    setSearchTerm('');
                                }}
                                className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
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
                                    <th className="px-6 py-5 w-[10%] hidden sm:table-cell">Hình ảnh</th>
                                    <th className="px-6 py-5 w-[15%] hidden sm:table-cell">Slug</th>
                                    <th className="px-6 py-5 text-center w-[10%]">Explore</th>
                                    <th className="px-6 py-5 text-center w-[10%]">Thống kê</th>
                                    <th className="px-6 py-5 text-center w-[13%]">Trạng thái</th>
                                    <th className="px-8 py-5 text-right w-[13%]">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHierarchy.length > 0 ? (
                                    filteredHierarchy.map(node => renderRow(node))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-40 text-center">
                                            <div className="flex flex-col items-center max-w-xs mx-auto">
                                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200 shadow-inner">
                                                    <FolderX size={48} />
                                                </div>
                                                <h4 className="text-xl font-bold text-slate-800">Không có dữ liệu</h4>
                                                <p className="text-slate-400 text-sm mt-2 leading-relaxed font-medium">
                                                    Chúng tôi không tìm thấy danh mục nào khớp với tiêu chí lọc của bạn.
                                                </p>
                                                <button 
                                                    onClick={() => { setSearchTerm(''); setFilters({status:'all', level:'all'}); }}
                                                    className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                                                >
                                                    Xóa tất cả bộ lọc
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Bottom Status Bar */}
                    <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Root</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Sub-Category</span>
                        </div>
                        <span>Total Items Scanned: {isLoading ? '...' : filteredHierarchy.length}</span>
                    </div>
                </section>
            </div>

            {/* AREA: MODAL FORM */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => !isLoading && setIsAddModalOpen(false)}></div>
                    <div 
                        ref={modalRef}
                        className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <Edit3 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        {formMode === 'create' ? 'Thêm Danh mục' : 'Chỉnh sửa'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tự động lưu nháp • Secure Mode</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)} 
                                className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-full transition-all text-slate-300 hover:text-slate-900 shadow-sm"
                                aria-label="Đóng"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-10 pt-6 gap-8 border-b border-slate-100">
                            {[ 
                                { id: 'basic', label: 'Thông tin chính', icon: ListTree },
                                { id: 'media', label: 'Hình ảnh', icon: ImageIcon },
                                { id: 'seo', label: 'Tối ưu SEO', icon: Globe }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveFormTab(tab.id)}
                                    className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border-b-2 transition-all ${ 
                                        activeFormTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300'
                                    }`}
                                >
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                            {activeFormTab === 'basic' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên hiển thị *</label>
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-600/20 focus:bg-white transition-all text-sm font-bold shadow-inner"
                                                placeholder="Điện thoại di động..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đường dẫn tự động</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">/</span>
                                                <input 
                                                    type="text" 
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                    className="w-full pl-8 pr-4 py-4 bg-slate-100/50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-500 cursor-not-allowed"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh mục cấp trên</label>
                                            <select 
                                                value={formData.parentId || ''}
                                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-600/20 focus:bg-white transition-all text-sm font-bold appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="">-- Danh mục gốc (Cấp 0) --</option>
                                                {categories.filter(c => !c.isDeleted && c._id !== formData._id).map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thứ tự ưu tiên</label>
                                            <input 
                                                type="number" 
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-600/20 focus:bg-white transition-all text-sm font-bold shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex items-center justify-between">
                                        <div>
                                            <h5 className="text-xs font-black text-indigo-600 uppercase tracking-wider">Trạng thái công khai</h5>
                                            <p className="text-[10px] text-indigo-400 font-bold mt-0.5">Xác định việc danh mục có xuất hiện trên web khách hàng.</p>
                                        </div>
                                        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-indigo-100">
                                            <button 
                                                onClick={() => setFormData({...formData, status: 'active'})}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.status === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-slate-600'}`}
                                            >
                                                Hiển thị
                                            </button>
                                            <button 
                                                onClick={() => setFormData({...formData, status: 'inactive'})}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.status === 'inactive' ? 'bg-slate-200 text-slate-600 shadow-md' : 'text-slate-300 hover:text-slate-600'}`}
                                            >
                                                Ẩn đi
                                            </button>
                                        </div>
                                    </div>

                                    {/* Show In Explore Toggle */}
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider">Hiển thị "Khám phá"</h5>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Hiện ở mục "Khám phá theo dòng sản phẩm" trang chủ.</p>
                                        </div>
                                        <div 
                                            onClick={() => setFormData({...formData, showInExplore: !formData.showInExplore})}
                                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${formData.showInExplore ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${formData.showInExplore ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeFormTab === 'media' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Ảnh bìa danh mục</label>
                                        
                                        {/* Hidden File Input */}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleImageUpload} 
                                            className="hidden" 
                                            accept="image/*"
                                        />

                                        <div 
                                            onClick={() => fileInputRef.current.click()}
                                            className="w-full h-72 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-all cursor-pointer group shadow-inner relative overflow-hidden"
                                        >
                                            {formData.thumbnail ? (
                                                <img src={formData.thumbnail} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <ImageIcon size={40} />
                                                    </div>
                                                    <p className="mt-4 font-black text-[10px] uppercase tracking-[0.2em]">Thả tập tin vào đây để tải lên</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả nội bộ (Tooltip)</label>
                                        <textarea 
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full h-32 p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-600/20 focus:bg-white transition-all text-sm font-medium resize-none shadow-inner"
                                            placeholder="Ghi chú nhanh cho quản trị viên..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {activeFormTab === 'seo' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl space-y-3">
                                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                                            <Globe size={14} /> Preview trên Google
                                        </div>
                                        <h4 className="text-xl font-bold text-blue-400 leading-tight">
                                            {formData.seo?.metaTitle || formData.name || 'Tiêu đề hiển thị...'}
                                        </h4>
                                        <p className="text-sm text-emerald-400/80 font-mono truncate">
                                            https://myshop.com/{formData.slug || 'url-danh-muc'}
                                        </p>
                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                            {formData.seo?.metaDescription || 'Mô tả hấp dẫn sẽ giúp tăng tỷ lệ nhấp chuột vào website của bạn từ kết quả tìm kiếm...'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thẻ tiêu đề SEO (Meta Title)</label>
                                        <input 
                                            type="text" 
                                            value={formData.seo?.metaTitle || ''}
                                            onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-600/20 transition-all text-sm font-bold shadow-inner"
                                            placeholder="Tối ưu dưới 60 ký tự"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thẻ mô tả SEO (Meta Description)</label>
                                        <textarea 
                                            value={formData.seo?.metaDescription || ''}
                                            onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                                            className="w-full h-32 p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-indigo-600/20 transition-all text-sm font-medium resize-none shadow-inner"
                                            placeholder="Khuyến nghị từ 150-160 ký tự"
                                        ></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 flex items-center gap-3 text-slate-400">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                    <Keyboard size={16} />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-tighter">
                                    <span className="text-indigo-50 text-indigo-500">Ctrl + Enter</span> để lưu nhanh • <span className="text-indigo-500">Esc</span> để hủy
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-8 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white rounded-[1.5rem] transition-all border-2 border-transparent hover:border-slate-100"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                                >
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                    {formMode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}
                                </button>
                            </div>
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
