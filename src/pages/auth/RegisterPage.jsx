import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi'; // Giả sử có API để đăng ký

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu khớp nhau ở Frontend
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authApi.register({ name, email, password, confirmPassword });
      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="relative w-full max-w-lg p-8 sm:p-12 bg-white rounded-2xl shadow-xl overflow-hidden text-left">
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Đăng ký tài khoản</h1>
        
        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
        {success && <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg font-medium">{success}</div>}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <FloatingLabelInput
            id="register-name"
            label="Họ và tên"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FloatingLabelInput
            id="register-email"
            label="Địa chỉ Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FloatingLabelInput
            id="register-password"
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FloatingLabelInput
            id="register-confirm-password"
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 text-base font-semibold text-white rounded-lg shadow-md transition-all active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-gray-600 font-medium">
          Đã có tài khoản?{' '}
          <button 
            type="button"
            onClick={() => navigate('/login')} 
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
};

// Helper component for FloatingLabelInput - Assuming it exists elsewhere or define locally for now
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
      className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 cursor-text"
    >
      {label}
    </label>
  </div>
);

export default RegisterPage;
