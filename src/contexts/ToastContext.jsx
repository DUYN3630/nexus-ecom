import { createContext, useState, useCallback, useContext } from 'react';
import { XCircle, CheckCircle, Info, WarningCircle } from '@phosphor-icons/react';

const ToastContext = createContext(undefined);

const Toast = ({ id, message, type, onClose }) => {
  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <WarningCircle className="w-5 h-5 text-yellow-500" />,
  };

  const borderClassMap = {
    success: 'border-green-200',
    error: 'border-red-200',
    info: 'border-blue-200',
    warning: 'border-yellow-200',
  };

  return (
    <div className={`toast-animate flex items-center justify-between gap-3 p-4 pr-3 bg-white rounded-lg shadow-lg border pointer-events-auto ${borderClassMap[type]} transition-all duration-300 ease-out`} role="alert">
      <div className="flex items-center gap-3">
        {iconMap[type]}
        <p className="text-sm font-medium text-slate-700">{message}</p>
      </div>
      <button onClick={() => onClose(id)} className="p-1 -mr-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <XCircle className="w-4 h-4" weight="bold" />
      </button>
    </div>
  );
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const TOAST_LIFETIME = 5000; // 5 seconds

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, TOAST_LIFETIME);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div id="toastContainer" className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Add the useToast hook here
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Keep original exports, but now useToast is also here
export { ToastContext, ToastProvider };
