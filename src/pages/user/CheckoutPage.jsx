import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, Truck, CreditCard, 
  MapPin, Phone, User, Smartphone, ArrowRight, AlertCircle
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';
import orderApi from '../../api/orderApi';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/formatCurrency';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    paymentMethod: 'MOMO'
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 2000000 ? 0 : 50000;
  const totalAmount = subtotal + shipping;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsProcessing(true);
    
    try {
      // Bước 1: Tạo đơn hàng trong DB
      const orderPayload = {
        customer: {
          name: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          email: user?.email || '', // Thêm email từ auth context
        },
        // Fallback cho customer fields cũ nếu có
        customerName: formData.customerName,
        customerEmail: user?.email || '', // Thêm cả ở root nếu backend cũ dùng
        shippingAddress: formData.address,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || '',
        })),
      };

      const savedOrder = await orderApi.createOrder(orderPayload);
      const orderId = savedOrder._id;

      // Bước 2: Xử lý theo phương thức thanh toán
      if (formData.paymentMethod === 'MOMO') {
        // Gọi server tạo link MoMo
        const { payUrl } = await axiosClient.post('/payment/momo/create', { orderId });
        
        if (!payUrl) throw new Error('Không nhận được link thanh toán từ MoMo');
        
        clearCart();
        addToast('Đang chuyển sang MoMo...', 'info');
        
        // Redirect sang trang MoMo
        window.location.href = payUrl;
        return; // Dừng ở đây, user sẽ quay lại /order-success
      }

      // COD hoặc Bank Transfer: hoàn tất ngay
      clearCart();
      addToast('Đặt hàng thành công!', 'success');
      navigate(`/order-success?orderId=${orderId}&method=${formData.paymentMethod}`);

    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      const msg = err?.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      addToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-stone-900 selection:bg-stone-900 selection:text-white pb-32">
      {/* HEADER */}
      <div className="pt-20 pb-12 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8 border-b border-stone-200 bg-[#F7F7F7] sticky top-0 z-50">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.5em] text-stone-400 font-bold">Secure Checkout</span>
          <h1 className="text-5xl font-serif italic leading-none">The Checkout.</h1>
        </div>
        <button onClick={() => navigate('/cart')} className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 hover:text-stone-900 transition-colors">
          <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" /> 
          Quay lại giỏ hàng
        </button>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 mt-20">
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-7 space-y-24">
            {/* STEP 1: Thông tin */}
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                <span className="w-10 h-10 rounded-full border border-stone-900 flex items-center justify-center text-xs font-serif italic">01</span>
                <h3 className="text-2xl font-serif italic">Thông tin định danh.</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-stone-400 flex items-center gap-2">
                    <User size={12} /> Tên chủ sở hữu
                  </label>
                  <input required name="customerName" value={formData.customerName} onChange={handleInputChange} className="w-full bg-transparent border-b border-stone-300 py-4 outline-none focus:border-stone-900 transition-colors font-serif italic text-lg" placeholder="Tên của bạn..." />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-stone-400 flex items-center gap-2">
                    <Phone size={12} /> Liên lạc
                  </label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-transparent border-b border-stone-300 py-4 outline-none focus:border-stone-900 transition-colors font-serif italic text-lg" placeholder="Số điện thoại..." />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black text-stone-400 flex items-center gap-2">
                    <MapPin size={12} /> Điểm đến của thiết bị
                  </label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-transparent border-b border-stone-300 py-4 outline-none focus:border-stone-900 transition-colors font-serif italic text-lg" placeholder="Địa chỉ nhận hàng đầy đủ..." />
                </div>
              </div>
            </div>

            {/* STEP 2: Phương thức */}
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                <span className="w-10 h-10 rounded-full border border-stone-900 flex items-center justify-center text-xs font-serif italic">02</span>
                <h3 className="text-2xl font-serif italic">Phương thức giao dịch.</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'MOMO', label: 'MoMo Wallet', icon: Smartphone, color: 'bg-[#ae2070]', desc: 'Chuyển hướng đến app MoMo' },
                  { id: 'BANK', label: 'Chuyển khoản', icon: CreditCard, color: 'bg-stone-900', desc: 'Thông tin sau khi đặt hàng' },
                  { id: 'COD',  label: 'Khi nhận hàng', icon: Truck, color: 'bg-stone-400', desc: 'Thanh toán khi nhận hàng' }
                ].map(method => (
                  <label key={method.id} className={`relative p-8 border rounded-3xl cursor-pointer transition-all duration-500 flex flex-col items-center text-center space-y-3 group ${formData.paymentMethod === method.id ? 'border-stone-900 bg-white shadow-2xl scale-105' : 'border-stone-200 hover:border-stone-400 grayscale opacity-60'}`}>
                    <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleInputChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${method.color}`}>
                      <method.icon size={20} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black">{method.label}</span>
                    <span className="text-[9px] text-stone-400">{method.desc}</span>
                    {formData.paymentMethod === method.id && <div className="absolute top-4 right-4 w-2 h-2 bg-stone-900 rounded-full" />}
                  </label>
                ))}
              </div>

              {/* MoMo notice */}
              {formData.paymentMethod === 'MOMO' && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-pink-50 border border-pink-100">
                  <AlertCircle size={16} className="text-[#ae2070] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-stone-600 leading-relaxed">
                    Bạn sẽ được chuyển đến trang MoMo để hoàn tất thanh toán. Sau khi thanh toán, bạn sẽ được tự động điều hướng về trang xác nhận đơn hàng.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-5 sticky top-48">
            <div className="bg-stone-900 text-white p-12 rounded-[48px] space-y-12 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-white/5" />
              <div className="relative z-10 space-y-8">
                <h3 className="text-3xl font-serif italic border-b border-white/5 pb-8">The Final Commitment.</h3>
                <div className="space-y-6 max-h-60 overflow-y-auto no-scrollbar pr-2">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div className="space-y-1">
                        <p className="text-xs font-bold">{item.name}</p>
                        <p className="text-[8px] uppercase tracking-widest text-stone-500">x{item.quantity}</p>
                      </div>
                      <p className="text-xs font-light">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 pt-8">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-stone-500 font-bold"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-stone-500 font-bold"><span>Vận chuyển</span><span>{shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}</span></div>
                  <div className="flex justify-between items-end pt-8 border-t border-white/10"><p className="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-black">Tổng giá trị đơn hàng</p><p className="text-4xl font-serif italic text-white">{formatCurrency(totalAmount)}</p></div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full py-6 bg-white text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-stone-200 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      {formData.paymentMethod === 'MOMO' ? 'Đang kết nối MoMo...' : 'Đang xử lý...'}
                    </span>
                  ) : (
                    <>
                      {formData.paymentMethod === 'MOMO' ? 'Thanh toán qua MoMo' : 'Xác nhận đặt hàng'}
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
                <div className="flex items-center gap-4 justify-center pt-8 border-t border-white/5 opacity-40"><ShieldCheck size={16} /><span className="text-[8px] uppercase tracking-[0.3em] font-bold">Encrypted & Secure</span></div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
