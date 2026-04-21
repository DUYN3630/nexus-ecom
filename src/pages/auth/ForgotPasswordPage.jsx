import { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../../api/authApi';

const styles = `
  .fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
  @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
  }
`;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <style>{styles}</style>
      
      <div className="relative w-full max-w-lg p-8 sm:p-12 bg-white rounded-2xl shadow-xl overflow-hidden fade-in text-left">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full opacity-80 duration-500 -translate-y-1/3 -translate-x-1/4 bg-gradient-to-br from-amber-400 to-orange-500"></div>

        <div className="relative z-10">
          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h1>
              <p className="mt-2 text-sm text-gray-500 font-medium">
                Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
              </p>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 text-base text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-orange-500 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="email"
                    className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-orange-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text"
                  >
                    Địa chỉ Email
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 text-base font-semibold text-white rounded-lg shadow-md transition-all active:scale-[0.98] bg-orange-500 hover:bg-orange-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                </button>
              </form>

              <p className="mt-8 text-sm text-center text-gray-600 font-medium">
                Nhớ mật khẩu rồi?{' '}
                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </>
          ) : (
            /* Success State */
            <>
              <div className="text-center space-y-6">
                {/* Check icon */}
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                <h1 className="text-3xl font-bold text-gray-900">Kiểm tra email!</h1>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Nếu email <strong className="text-gray-900">{email}</strong> tồn tại trong hệ thống, 
                  bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
                </p>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                  <p className="text-xs text-amber-700 font-bold">💡 Lưu ý:</p>
                  <ul className="text-xs text-amber-600 mt-1 space-y-1">
                    <li>• Kiểm tra thư mục Spam nếu không thấy email</li>
                    <li>• Link sẽ hết hạn sau 30 phút</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Link 
                    to="/login" 
                    className="w-full px-6 py-3 text-center text-base font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all"
                  >
                    Quay lại đăng nhập
                  </Link>
                  <button
                    onClick={() => { setSent(false); setEmail(''); }}
                    className="text-sm text-gray-500 font-medium hover:text-gray-700 hover:underline"
                  >
                    Gửi lại với email khác
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
