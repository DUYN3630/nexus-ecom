import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuth from '../../hooks/useAuth';
import authApi from '../../api/authApi';
import { useToast } from '../../contexts/ToastContext';

// --- ICONS ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.712 34.621 44 28.721 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

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
      className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text text-left"
    >
      {label}
    </label>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const [isSignIn, setIsSignIn] = useState(location.pathname !== '/register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsSignIn(location.pathname !== '/register');
    setError(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, location]);

  const handleLoginSuccess = (token, user) => {
    login(token, user);
    const role = user.role ? user.role.toLowerCase() : '';
    if (role === 'admin' || role === 'staff') {
        navigate('/admin', { replace: true });
    } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await authApi.login(email, password);
      if (response && response.token) {
        handleLoginSuccess(response.token, response.user);
        addToast('Đăng nhập thành công', 'success');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng!");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await authApi.register({ name, email, password });
      if (response && response.token) {
        handleLoginSuccess(response.token, response.user);
        addToast('Tạo tài khoản thành công', 'success');
      } else {
        addToast('Đăng ký thành công, vui lòng đăng nhập', 'success');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (isSignIn) await handleSignIn();
    else await handleRegister();
    setLoading(false);
  };

  // Google Login - Bọc trong Try Catch cẩn thận
  const loginWithGoogle = () => {
    try {
      handleGoogle();
    } catch (err) {
      addToast('Lỗi tích hợp Google', 'error');
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await authApi.googleLogin(tokenResponse.access_token);
        handleLoginSuccess(res.token, res.user);
        addToast('Đăng nhập Google thành công!', 'success');
      } catch (err) {
        addToast('Đăng nhập Google thất bại', 'error');
      } finally {
        setLoading(false);
      }
    },
  });

  if (isAuthLoading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold uppercase tracking-widest text-slate-300">Đang khởi tạo bảo mật...</div>;
  if (isAuthenticated) return null;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 text-left">
      <div className="relative w-full max-w-lg p-8 sm:p-12 bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-500">
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 duration-700 -translate-y-1/3 -translate-x-1/4 bg-slate-900`}></div>

        <div className="relative z-10">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-2">Nexus Ecosystem</p>
          <h1 className="text-4xl font-[1000] text-gray-900 tracking-tighter uppercase italic">
            {isSignIn ? 'Đăng nhập' : 'Khởi tạo'}
          </h1>
          
          {error && <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase tracking-tight">{error}</div>}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!isSignIn && (
              <FloatingLabelInput id="name" label="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <FloatingLabelInput id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FloatingLabelInput id="password" label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 ${loading ? 'opacity-50' : 'hover:bg-black'}`}
            >
              {loading ? 'Đang xác thực...' : (isSignIn ? 'Vào hệ thống' : 'Đăng ký ngay')}
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="mx-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">Tiếp tục bằng</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button 
            type="button"
            onClick={() => loginWithGoogle()}
            className="flex items-center justify-center w-full py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all gap-3 text-[10px] font-black uppercase tracking-widest text-gray-700"
          >
            <GoogleIcon /> Google
          </button>

          <p className="mt-10 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
            {isSignIn ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            {' '}
            <Link 
              to={isSignIn ? '/register' : '/login'} 
              className="text-blue-600 hover:text-blue-700 underline underline-offset-4 ml-2"
            >
              {isSignIn ? 'Đăng ký' : 'Đăng nhập'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
