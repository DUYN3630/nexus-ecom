import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../config/firebase';
import authApi from '../../api/authApi';

const PhoneLoginPage = () => {
  const navigate = useNavigate();
  
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [tempUser, setTempUser] = useState(null);

  // Hàm khởi tạo Recaptcha
  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    } catch (err) {
      console.error("Recaptcha Setup Error:", err);
    }
  };

  const onSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      setupRecaptcha();

      // Logic định dạng số điện thoại: Tự động nối +84 và bỏ số 0 ở đầu
      const cleanPhone = phoneNumber.trim().replace(/\s/g, ''); 
      const formattedPhone = `+84${cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone}`;

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      if (err.message.includes('reCAPTCHA client element has been removed')) {
        setError("Lỗi kết nối reCAPTCHA. Vui lòng nhấn gửi lại.");
      } else if (err.message.includes('billing-not-enabled')) {
        setError("Lỗi cấu hình Firebase Billing. Hãy sử dụng số điện thoại thử nghiệm.");
      } else {
        setError("Không thể gửi tin nhắn. Hãy kiểm tra định dạng SĐT.");
      }
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      
      const idToken = await firebaseUser.getIdToken();
      
      const response = await authApi.phoneAuth({
        phone: firebaseUser.phoneNumber,
        idToken: idToken 
      });

      if (response.user && response.user.name && !response.user.name.startsWith('User ')) {
        handleFinalLogin(response);
      } else {
        setTempUser({ phone: firebaseUser.phoneNumber, uid: firebaseUser.uid });
        setStep(3);
      }
    } catch (err) {
      setError("Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateNameAndLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.phoneAuth({
        phone: tempUser.phone,
        uid: tempUser.uid,
        name: name
      });
      handleFinalLogin(response);
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu tên.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/'; 
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 font-sans text-left">
      <div id="recaptcha-container"></div>
      
      <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-blue-200 shadow-xl transform -rotate-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {step === 1 ? 'Đăng nhập SĐT' : step === 2 ? 'Xác thực OTP' : 'Chào mừng bạn'}
            </h1>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>}

          {step === 1 && (
            <form onSubmit={onSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Số điện thoại</label>
                <div className="flex items-center border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-4 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm">
                  <span className="text-gray-500 font-bold border-r border-gray-300 pr-3">+84</span>
                  <input 
                    type="tel" 
                    className="flex-grow pl-3 bg-transparent outline-none text-lg font-semibold text-gray-900 placeholder-gray-300" 
                    placeholder="971 610 978"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-400 italic ml-1">* Không cần nhập số 0 ở đầu</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-blue-100 shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'ĐANG GỬI MÃ...' : 'TIẾP TỤC'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={onVerifyOTP} className="space-y-6">
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold text-gray-400 uppercase">Mã OTP đã gửi tới số của bạn</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-center tracking-[0.8em] font-black text-2xl"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-green-100 shadow-xl hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm font-bold text-gray-400 hover:text-blue-600">Thay đổi số điện thoại</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={onUpdateNameAndLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Chúng tôi nên gọi bạn là gì?</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-purple-500 focus:bg-white outline-none transition-all text-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-purple-100 shadow-xl hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'ĐANG LƯU...' : 'HOÀN TẤT ĐĂNG KÝ'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneLoginPage;
