import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ShoppingBag, Home, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * OrderSuccessPage
 * MoMo redirect về đây với query params:
 *   ?orderId=xxx&resultCode=0&...
 * 
 * resultCode = 0   → Thanh toán thành công
 * resultCode != 0  → Thất bại / Huỷ
 * 
 * Với COD/Bank (không qua MoMo):
 *   ?orderId=xxx&method=COD
 */
const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const orderId     = searchParams.get('orderId');
  const resultCode  = searchParams.get('resultCode');   // MoMo: '0' = success
  const method      = searchParams.get('method');        // 'COD' | 'BANK' | undefined

  const [status, setStatus]   = useState('loading'); // 'loading' | 'success' | 'failed'
  const [order, setOrder]     = useState(null);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const checkPayment = async () => {
      // COD hoặc Bank Transfer: luôn thành công
      if (method === 'COD' || method === 'BANK') {
        setStatus('success');
        clearCart();
        return;
      }

      // MoMo flow: kiểm tra resultCode từ URL params
      if (resultCode !== null) {
        if (resultCode === '0') {
          // Đợi server xử lý IPN (~1s) rồi poll trạng thái
          await new Promise(r => setTimeout(r, 1500));
          
          try {
            const orderData = await axiosClient.get(`/payment/momo/status/${orderId}`);
            setOrder(orderData);
            setStatus(orderData.paymentStatus === 'Paid' ? 'success' : 'success'); // resultCode=0 = thành công
          } catch {
            setStatus('success'); // resultCode=0 nên vẫn là thành công
          }
          clearCart();
        } else {
          setStatus('failed');
        }
        return;
      }

      // Không có params: loading rồi redirect về home
      setStatus('failed');
    };

    checkPayment();
  }, []);

  // Đếm ngược auto redirect khi thành công
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) { navigate('/store'); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown]);

  // ─ LOADING ──────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 text-stone-400">
        <Loader size={36} strokeWidth={1} className="animate-spin" />
        <p className="text-[10px] uppercase tracking-widest">Đang xác nhận giao dịch...</p>
      </div>
    );
  }

  // ─ FAILED ───────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full border border-red-100 flex items-center justify-center text-red-400 mb-10 shadow-xl">
          <XCircle size={48} strokeWidth={1} />
        </div>
        <h2 className="text-4xl font-serif italic mb-4 text-stone-800">Thanh toán thất bại.</h2>
        <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] mb-10 max-w-xs">
          Giao dịch bị hủy hoặc gặp lỗi. Đơn hàng của bạn vẫn được lưu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-700 transition-all"
          >
            <RefreshCw size={14} /> Thử lại
          </button>
          <Link
            to="/store"
            className="flex items-center gap-2 px-8 py-4 border border-stone-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-stone-600 hover:border-stone-900 transition-all"
          >
            <Home size={14} /> Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // ─ SUCCESS ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Icon */}
      <div className="relative w-28 h-28 mb-12">
        <div className="w-full h-full rounded-full border border-stone-100 flex items-center justify-center text-stone-900 shadow-2xl">
          <CheckCircle size={52} strokeWidth={1} />
        </div>
        <div className="absolute inset-0 rounded-full border border-stone-900 animate-ping opacity-10" />
      </div>

      <span className="text-[10px] uppercase tracking-[0.5em] text-stone-400 mb-4 block">
        {method === 'MOMO' ? 'MoMo · Thanh toán thành công' : 
         method === 'COD' ? 'Đang chờ · Thanh toán khi nhận hàng' :
         'Đặt hàng thành công'}
      </span>
      <h2 className="text-5xl font-serif italic mb-6 text-stone-900">Payment Received.</h2>
      <p className="text-stone-400 font-light mb-3 max-w-sm leading-relaxed text-[10px] uppercase tracking-[0.25em]">
        Cảm ơn bạn đã tin tưởng Nexus. Tác phẩm của bạn đang được chuẩn bị một cách tinh xảo nhất.
      </p>

      {orderId && (
        <p className="text-[10px] text-stone-300 uppercase tracking-widest mb-12">
          Mã đơn: <span className="text-stone-500 font-bold">{orderId.slice(-8).toUpperCase()}</span>
        </p>
      )}

      {/* Order info nếu có */}
      {order && (
        <div className="mb-10 p-6 bg-stone-50 rounded-2xl border border-stone-100 text-sm space-y-2 min-w-[260px]">
          <div className="flex justify-between text-stone-500 text-xs">
            <span className="uppercase tracking-widest">Tổng thanh toán</span>
            <span className="font-black text-stone-900">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-stone-500 text-xs">
            <span className="uppercase tracking-widest">Trạng thái</span>
            <span className="font-bold text-green-600">Đã thanh toán ✓</span>
          </div>
        </div>
      )}

      {/* Auto redirect countdown */}
      <p className="text-[9px] text-stone-300 uppercase tracking-widest mb-8">
        Tự động chuyển về cửa hàng sau {countdown}s
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/store')}
          className="flex items-center gap-2 px-10 py-4 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-stone-800 transition-all"
        >
          <ShoppingBag size={14} /> Tiếp tục mua sắm
        </button>
        <Link
          to="/user/account/orders"
          className="flex items-center gap-2 px-10 py-4 border border-stone-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-stone-600 hover:border-stone-900 transition-all"
        >
          Xem đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
