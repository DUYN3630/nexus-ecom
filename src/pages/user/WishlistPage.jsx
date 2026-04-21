import React from 'react';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const API_URL = 'http://127.0.0.1:5000';

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <Heart size={40} className="text-slate-300" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-800 mb-2">Danh sách trống</h2>
        <p className="text-slate-500 font-medium mb-8 text-center max-w-sm">Bạn chưa có sản phẩm yêu thích nào. Hãy lướt xem và lưu lại những món đồ công nghệ ưa thích nhé!</p>
        <button 
          onClick={() => navigate('/products')}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200"
        >
          Khám phá ngay <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">
              Sản phẩm <br/> yêu thích
            </h1>
            <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">{wishlist.length} Sản phẩm đã lưu</p>
          </div>
          <button 
            onClick={clearWishlist}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 bg-red-50 px-4 py-2.5 rounded-xl transition-colors"
          >
            <Trash2 size={16} /> Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlist.map((item) => {
            const imageUrl = item.images?.[0] ? (item.images[0].startsWith('http') ? item.images[0] : `${API_URL}${item.images[0]}`) : 'https://placehold.co/400x400';
            const price = item.discountPrice || item.price;
            
            return (
              <div key={item._id} className="group flex flex-col bg-white rounded-[2rem] p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="relative aspect-square mb-6 bg-slate-50 rounded-2xl overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${item.slug || item._id}`)}>
                  <img src={imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-red-500 hover:scale-110 hover:shadow-lg transition-all"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-tight cursor-pointer" onClick={() => navigate(`/product/${item.slug || item._id}`)}>
                    {item.name}
                  </h3>
                  <div className="mt-4 flex items-end justify-between pt-4 border-t border-slate-50">
                    <span className="text-xl font-black text-indigo-600">{price?.toLocaleString('vi-VN')}₫</span>
                    <button 
                      onClick={() => {
                        addToCart(item, 1);
                        addToast(`Đã thêm vào giỏ hàng`, 'success');
                      }}
                      className="text-[10px] font-black bg-slate-100 text-slate-600 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors"
                    >
                      Mua
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
