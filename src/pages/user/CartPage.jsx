import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const handleGoToCheckout = () => {
    if (!isAuthenticated) {
      addToast('Vui lòng đăng nhập để tiến hành thanh toán', 'info');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    
    if (cartItems.length === 0) {
      addToast('Giỏ hàng rỗng', 'error');
      return;
    }

    console.log("Navigating to checkout with", cartItems.length, "items");
    navigate('/checkout');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 2000000 ? 0 : 50000;
  const total = subtotal + shipping;

  const formatVariant = (variant) => {
    if (!variant) return '';
    return Object.values(variant).filter(Boolean).join(' — ');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center space-y-12">
        <div className="w-24 h-24 rounded-full border border-stone-200 flex items-center justify-center text-stone-300">
          <ShoppingBag size={40} strokeWidth={1} />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-serif italic text-stone-900">Your bag is empty.</h2>
          <p className="text-stone-400 font-light tracking-widest uppercase text-[10px]">Đã đến lúc bắt đầu một bộ sưu tập mới</p>
        </div>
        <button 
          onClick={() => navigate('/store')}
          className="px-12 py-4 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-800 transition-all"
        >
          Khám phá bộ sưu tập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] pt-32 pb-48 text-stone-900 selection:bg-stone-900 selection:text-white">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.5em] text-stone-400 font-bold">Your Selection</span>
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-none">The Bag.</h1>
          </div>
          <div className="pb-2">
            <p className="text-stone-400 font-light italic">Số lượng: {cartItems.length} tác phẩm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          
          {/* CART LIST */}
          <div className="lg:col-span-7 space-y-12">
            {cartItems.map(item => (
              <div key={item._id + JSON.stringify(item.variant)} className="group grid grid-cols-1 md:grid-cols-12 gap-8 py-12 border-t border-stone-200 first:border-t-0">
                <div className="md:col-span-4 aspect-[3/4] bg-white rounded-2xl overflow-hidden p-8 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="md:col-span-8 flex flex-col justify-between py-2">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-serif italic">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item._id, item.variant)}
                        className="p-2 text-stone-300 hover:text-stone-900 transition-colors"
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">{formatVariant(item.variant)}</p>
                    <p className="text-xl font-light">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-12">
                    <div className="flex items-center border border-stone-200 rounded-full px-4 py-2 gap-6 bg-white">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1, item.variant)} className="text-stone-400 hover:text-stone-900 transition-colors"><Minus size={14} /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1, item.variant)} className="text-stone-400 hover:text-stone-900 transition-colors"><Plus size={14} /></button>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase tracking-widest text-stone-400 mb-1">Thành tiền</p>
                      <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-stone-900 text-white p-12 rounded-[40px] space-y-12 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10 bg-white/5" />
              
              <div className="relative z-10 space-y-8">
                <h3 className="text-3xl font-serif italic">Investment Summary.</h3>
                
                <div className="space-y-6 border-y border-white/10 py-10">
                  <div className="flex justify-between items-center text-xs tracking-widest text-stone-400 uppercase">
                    <span>Tạm tính</span>
                    <span className="text-white font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs tracking-widest text-stone-400 uppercase">
                    <span>Vận chuyển tiêu chuẩn</span>
                    <span className="text-white font-bold">{shipping === 0 ? 'Complimentary' : formatCurrency(shipping)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-black">Tổng giá trị</p>
                    <p className="text-5xl font-serif italic">{formatCurrency(total)}</p>
                  </div>
                </div>

                <button 
                  onClick={handleGoToCheckout}
                  className="group w-full py-6 bg-white text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-stone-200 transition-all flex items-center justify-center gap-4 mt-8"
                >
                  Tiến hành đặt hàng <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="flex items-center gap-4 justify-center pt-8 border-t border-white/5">
                  <ShieldCheck size={16} className="text-stone-500" />
                  <span className="text-[8px] uppercase tracking-[0.3em] text-stone-500 font-bold">Secure Checkout Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Support Note */}
            <div className="mt-8 px-8 space-y-4">
              <p className="text-[10px] text-stone-400 leading-relaxed uppercase tracking-wider">
                * Mọi đơn hàng tại Nexus đều được đóng gói thủ công và kiểm định 3 lớp trước khi vận chuyển.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
