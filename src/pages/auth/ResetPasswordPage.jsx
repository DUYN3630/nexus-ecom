import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';

const styles = `
  .fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
  @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
  }
`;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Mật khẩu phải tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password, confirmPassword);
      setSuccess(true);
      // Tự chuyển sang login sau 3 giây
      setTimeout(() => navigate('/login'), 3000);
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
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full opacity-80 duration-500 -translate-y-1/3 -translate-x-1/4 bg-gradient-to-br from-green-400 to-emerald-600"></div>

        <div className="relative z-10">
          {!success ? (
            <>
              {/* Lock icon */}
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
              <p className="mt-2 text-sm text-gray-500 font-medium">
                Nhập mật khẩu mới cho tài khoản của bạn.
              </p>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 text-base text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-emerald-500 peer"
                    placeholder=" "
                    required
                    minLength={6}
                  />
                  <label
                    htmlFor="password"
                    className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text"
                  >
                    Mật khẩu mới
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 text-base text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-emerald-500 peer"
                    placeholder=" "
                    required
                    minLength={6}
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text"
                  >
                    Xác nhận mật khẩu mới
                  </label>
                </div>

                {/* Password strength hints */}
                <div className="text-xs text-gray-400 space-y-1">
                  <p className={password.length >= 6 ? 'text-green-500' : ''}>
                    {password.length >= 6 ? '✓' : '○'} Tối thiểu 6 ký tự
                  </p>
                  <p className={password && password === confirmPassword ? 'text-green-500' : ''}>
                    {password && password === confirmPassword ? '✓' : '○'} Mật khẩu xác nhận khớp
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 text-base font-semibold text-white rounded-lg shadow-md transition-all active:scale-[0.98] bg-emerald-500 hover:bg-emerald-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </form>

              <p className="mt-8 text-sm text-center text-gray-600 font-medium">
                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  ← Quay lại đăng nhập
                </Link>
              </p>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">Thành công!</h1>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Mật khẩu đã được đặt lại thành công.<br/>
                Bạn sẽ được chuyển hướng đến trang đăng nhập...
              </p>

              <Link 
                to="/login" 
                className="inline-block w-full px-6 py-3 text-center text-base font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
