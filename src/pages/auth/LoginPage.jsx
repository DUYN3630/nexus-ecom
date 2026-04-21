import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuth from '../../hooks/useAuth';
import authApi from '../../api/authApi';
import { useToast } from '../../contexts/ToastContext';

// --- CSS STYLES ---
const styles = `
  .fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
  @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
  }
`;

// --- ICONS ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.712 34.621 44 28.721 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

// --- COMPONENT INPUT ---
const FloatingLabelInput = ({ id, label, type = "text", value, onChange }) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="block w-full px-4 py-3 text-base text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      placeholder=" "
      required
    />
    <label
      htmlFor={id}
      className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text"
    >
      {label}
    </label>
  </div>
);

// --- MAIN COMPONENT ---
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await authApi.googleLogin(tokenResponse.access_token);
        
        const { token, user } = res; // Axios interceptor returns data
        handleLoginSuccess(token, user);
        addToast('Đăng nhập Google thành công!', 'success');
      } catch (err) {
        addToast(err.response?.data?.message || 'Đăng nhập Google thất bại', 'error');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      addToast('Đăng nhập Google thất bại. Vui lòng thử lại.', 'error');
    },
  });

  // Xác định mode dựa trên URL (true = Login, false = Register)
  const [isSignIn, setIsSignIn] = useState(location.pathname !== '/register');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null); // Thông báo thành công

  // Cập nhật mode khi URL thay đổi
  useEffect(() => {
    setIsSignIn(location.pathname !== '/register');
    setError(null);
    setSuccessMsg(null);
  }, [location.pathname]);

  // Redirect nếu đã login
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, location]);

  const handleLoginSuccess = (token, user) => {
    login(token, user);
    
    console.log("LOGIN SUCCESS - CHECKING ROLE:", user.role); // DEBUG

    // Chuẩn hóa role về chữ thường để so sánh cho chính xác
    const role = user.role ? user.role.toLowerCase() : '';

    if (role === 'admin' || role === 'staff') {
        console.log(">>> REDIRECTING TO ADMIN DASHBOARD");
        navigate('/admin', { replace: true });
    } else {
        console.log(">>> REDIRECTING TO USER HOME");
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await authApi.login(email, password);
      const { token, user } = response; // Axios interceptor đã trả về data
      handleLoginSuccess(token, user);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Email hoặc mật khẩu không đúng!";
      setError(errorMessage);
    }
  };

  const handleRegister = async () => {
    try {
      // 1. Gọi API đăng ký (Bây giờ API này trả về cả Token và User Admin)
      const response = await authApi.register({ name, email, password });
      
      // 2. Tự động đăng nhập luôn
      if (response.token && response.user) {
        handleLoginSuccess(response.token, response.user);
      } else {
        setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsSignIn(true);
        navigate('/login');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại.";
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isSignIn) {
      await handleSignIn();
    } else {
      await handleRegister();
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setError(null);
    setSuccessMsg(null);
    if (isSignIn) {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  if (isAuthLoading) {
      return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  // Nếu đã Login thì return null (đợi redirect ở useEffect)
  if (isAuthenticated) return null;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <style>{styles}</style>
      
      <div className="relative w-full max-w-lg p-8 sm:p-12 bg-white rounded-2xl shadow-xl overflow-hidden fade-in text-left">
        {/* Background Animation */}
        <div className={`absolute top-0 right-0 w-60 h-60 rounded-full opacity-80 duration-500 -translate-y-1/3 -translate-x-1/4 bg-gradient-to-br ${isSignIn ? 'from-blue-400 to-indigo-600' : 'from-indigo-400 to-purple-600'}`}></div>

        <div className="relative z-10">
          <p className="text-sm text-gray-500 font-medium">
            {isSignIn ? 'Vui lòng nhập thông tin' : 'Bắt đầu hành trình của bạn'}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {isSignIn ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
          </h1>
          
          {/* Thông báo lỗi */}
          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
          
          {/* Thông báo thành công */}
          {successMsg && <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg font-medium">{successMsg}</div>}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {!isSignIn && (
              <FloatingLabelInput
                id="name"
                label="Họ và tên"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <FloatingLabelInput
              id="email"
              label="Địa chỉ Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FloatingLabelInput
              id="password"
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {isSignIn && (
              <div className="flex items-center justify-between text-sm font-semibold">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" /> Ghi nhớ tôi
                </label>
                <Link to="/forgot-password" className="text-blue-600 hover:underline">Quên mật khẩu?</Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 text-base font-semibold text-white rounded-lg shadow-md transition-all active:scale-[0.98] ${isSignIn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Đang xử lý...' : (isSignIn ? 'Đăng nhập' : 'Đăng ký tài khoản')}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Hoặc</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all gap-3 text-sm font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Tiếp tục với Google</span>
            </button>

            <button 
              type="button"
              onClick={() => navigate('/login-phone')}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all gap-3 text-sm font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Tiếp tục với Số điện thoại</span>
            </button>
          </div>

          <p className="mt-8 text-sm text-center text-gray-600 font-medium">
            {isSignIn ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            {' '}
            <button 
              type="button"
              onClick={toggleMode} 
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {isSignIn ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;