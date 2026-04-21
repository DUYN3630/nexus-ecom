import React from 'react';
import { 
  Heart, Share2, Star, Box, Minus, Plus, ShoppingBag, Check, Truck, Award 
} from 'lucide-react';
import ProductOptions from './ProductOptions';
import { useWishlist } from '../../../contexts/WishlistContext';

const ProductInfo = ({ 
  product, 
  currentPrice, 
  selection, 
  setSelection, 
  quantity, 
  setQuantity, 
  isAdding, 
  handleAddToCart,
  handleBuyNow 
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = product ? isInWishlist(product._id) : false;

  return (
    <div className="space-y-10 lg:sticky lg:top-32">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">{product.badge}</span>
           <div className="flex gap-4">
              <button 
                onClick={() => toggleWishlist(product)} 
                className={`transition-colors ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-slate-300 hover:text-red-500'}`}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button className="text-slate-300 hover:text-indigo-600 transition-colors"><Share2 size={20} /></button>
           </div>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">{product.name}</h1>
        <div className="flex items-center gap-4">
           <div className="flex items-center text-amber-400">
              <Star size={14} fill="currentColor" />
              <span className="ml-1 text-[10px] font-black text-slate-900 uppercase">{product.rating}</span>
           </div>
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{product.reviewCount} Đánh giá</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-end justify-between shadow-inner">
         <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] line-through">{product.originalPrice?.toLocaleString()}đ</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentPrice.toLocaleString()}đ</h2>
         </div>
         <div className="text-right">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
               <Box size={12} /> Còn hàng
            </span>
         </div>
      </div>

      {/* Options Component */}
      <ProductOptions 
        options={product.options} 
        selection={selection} 
        setSelection={setSelection} 
      />

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-4 py-8 border-y border-slate-100">
         {product.specs?.map((s, idx) => (
           <div key={idx}>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter">{s.value}</p>
           </div>
         ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
           <div className="flex items-center border-2 border-slate-100 rounded-2xl px-4 py-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 text-slate-400 hover:text-black"><Minus size={14}/></button>
              <span className="w-10 text-center text-xs font-black">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-1 text-slate-400 hover:text-black"><Plus size={14}/></button>
           </div>
           <button 
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex-1 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${isAdding ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white border-2 border-black text-black hover:bg-slate-50'}`}
           >
             {isAdding ? <><Check size={16} /> Đã thêm</> : <><ShoppingBag size={16} /> Thêm vào giỏ</>}
           </button>
        </div>
        <button 
          onClick={handleBuyNow}
          className="w-full py-5 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
        >
          Mua ngay
        </button>
      </div>

      {/* Trust Signals */}
      <div className="pt-6 flex flex-col gap-4">
         <div className="flex items-center gap-4 text-slate-400 group">
            <Truck size={18} strokeWidth={1.5} className="group-hover:text-black transition-colors" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Giao hàng miễn phí hỏa tốc trong 2h</span>
         </div>
         <div className="flex items-center gap-4 text-slate-400 group">
            <Award size={18} strokeWidth={1.5} className="group-hover:text-black transition-colors" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Bảo hành chính hãng 12 tháng tại Việt Nam</span>
         </div>
         
         {/* Payment Trust Badges */}
         <div className="pt-6 border-t border-slate-50 mt-2">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-3">Được bảo đảm thanh toán bởi</p>
           <div className="flex gap-3 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
           </div>
         </div>
      </div>
    </div>
  );
};

export default ProductInfo;