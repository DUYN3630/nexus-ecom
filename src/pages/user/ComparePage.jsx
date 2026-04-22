import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, X, Smartphone, Cpu, Camera, Battery, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import geminiApi from '../../api/geminiApi';
import getProductImageUrl from '../../utils/getProductImageUrl';

const ComparePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [device1, setDevice1] = useState(null);
  const [device2, setDevice2] = useState(null);
  const [isSelecting1, setIsSelecting1] = useState(false);
  const [isSelecting2, setIsSelecting2] = useState(false);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Tải danh sách sản phẩm (Chỉ chạy 1 lần khi mở trang)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll({ limit: 100 });
        const allProducts = Array.isArray(response) ? response : (response.data?.data || response.data || []);
        if (allProducts.length > 0) {
          setProducts(allProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. Xử lý AI khi có đủ 2 thiết bị
  useEffect(() => {
    if (device1 && device2) {
      handleAiComparison();
    } else {
      setAiAnalysis('');
    }
  }, [device1?._id, device2?._id]); // Chỉ lắng nghe ID của thiết bị để tránh lặp

  const handleAiComparison = async () => {
    setIsAiLoading(true);
    setAiAnalysis('');
    try {
      const prompt = `So sánh ngắn gọn sự khác biệt giữa ${device1.name} và ${device2.name}. 
      Tập trung vào: Hiệu năng, Camera, Pin. Trả lời bằng Tiếng Việt, không dùng ký tự đặc biệt.`;
      const response = await geminiApi.chatWithAi(prompt);
      setAiAnalysis(response.text);
    } catch (error) {
      console.error("AI Error:", error);
      setAiAnalysis("Dạ, hiện em chưa thể so sánh hai máy này. Anh xem bảng thông số bên trên nhé.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getSpecValue = (product, key) => {
    if (!product || !product.specifications) return 'Đang cập nhật';
    const specs = product.specifications;
    const foundKey = Object.keys(specs).find(k => k.toLowerCase().includes(key.toLowerCase()));
    return foundKey ? specs[foundKey] : 'Đang cập nhật';
  };

  const ProductSelector = ({ onSelect, onClose }) => (
    <div className="absolute top-0 left-0 right-0 mt-2 bg-white rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-slate-100 z-[100] max-h-[450px] overflow-y-auto p-4 animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50 sticky top-0 bg-white">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chọn máy</h4>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
      </div>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p._id} onClick={() => { onSelect(p); onClose(); }} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-lg border p-1"><img src={getProductImageUrl(p.images?.[0])} className="w-full h-full object-contain" /></div>
            <div className="flex-1 min-w-0"><p className="text-xs font-black truncate">{p.name}</p><p className="text-[9px] text-indigo-600 font-bold">{formatPrice(p.price)}</p></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-300">Đang khởi tạo hệ thống...</div>;

  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-32 pb-24 text-slate-900 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="text-center mb-16 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Comparison Engine</p>
          <h1 className="text-5xl md:text-7xl font-[1000] tracking-tighter italic uppercase leading-none">So sánh <br/> <span className="text-slate-400">Thiết bị.</span></h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-16">
          {/* Cột 1 */}
          <div className="flex-1 relative">
            {device1 ? (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group relative">
                <button onClick={() => setIsSelecting1(true)} className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"><ChevronDown size={16} /></button>
                <img src={getProductImageUrl(device1.images?.[0])} className="w-40 h-40 object-contain mb-6" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Thiết bị A</p>
                <h3 className="text-xl font-black truncate w-full">{device1.name}</h3>
                <button onClick={() => navigate(`/product/${device1.slug}`)} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">Chi tiết</button>
              </div>
            ) : (
              <div onClick={() => setIsSelecting1(true)} className="h-64 bg-slate-50/50 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50"><Plus className="text-slate-300 mb-2" /><p className="text-[10px] font-black uppercase text-slate-400">Chọn máy</p></div>
            )}
            {isSelecting1 && <ProductSelector onSelect={setDevice1} onClose={() => setIsSelecting1(false)} />}
          </div>

          {/* Cột 2 */}
          <div className="flex-1 relative">
            {device2 ? (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group relative">
                <button onClick={() => setIsSelecting2(true)} className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"><ChevronDown size={16} /></button>
                <img src={getProductImageUrl(device2.images?.[0])} className="w-40 h-40 object-contain mb-6" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Thiết bị B</p>
                <h3 className="text-xl font-black truncate w-full">{device2.name}</h3>
                <button onClick={() => navigate(`/product/${device2.slug}`)} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">Chi tiết</button>
              </div>
            ) : (
              <div onClick={() => setIsSelecting2(true)} className="h-64 bg-slate-50/50 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50"><Plus className="text-slate-300 mb-2" /><p className="text-[10px] font-black uppercase text-slate-400">Chọn máy</p></div>
            )}
            {isSelecting2 && <ProductSelector onSelect={setDevice2} onClose={() => setIsSelecting2(false)} />}
          </div>
        </div>

        {/* Specs & AI Analysis */}
        {(device1 || device2) && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-12 text-center text-slate-400 italic">Bảng thông số kỹ thuật</h3>
              <div className="space-y-10">
                {[
                  { label: 'Vi xử lý', key: 'chip', icon: Cpu },
                  { label: 'Camera', key: 'camera', icon: Camera },
                  { label: 'Pin', key: 'pin', icon: Battery },
                  { label: 'Màn hình', key: 'màn hình', icon: Smartphone }
                ].map(spec => (
                  <div key={spec.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-50 pb-8 last:border-0">
                    <div className="flex items-center gap-3 text-slate-900"><spec.icon size={18} /><span className="text-[10px] font-black uppercase tracking-widest">{spec.label}</span></div>
                    <div className="text-xs font-bold text-slate-500">{getSpecValue(device1, spec.key)}</div>
                    <div className="text-xs font-bold text-slate-500">{getSpecValue(device2, spec.key)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Box */}
            <div className={`p-10 rounded-[2.5rem] transition-all duration-700 ${isAiLoading ? 'bg-white border animate-pulse' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200'}`}>
               <div className="flex items-center gap-3 mb-6">
                  <Sparkles size={20} className={isAiLoading ? 'animate-spin' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Phân tích chuyên sâu bởi Nexus AI</span>
               </div>
               {isAiLoading ? (
                 <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Đang xử lý dữ liệu...</p>
               ) : (
                 <p className="text-sm md:text-base font-bold leading-relaxed">{aiAnalysis || "Chọn 2 thiết bị để so sánh."}</p>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
