import { createContext, useState, useCallback } from 'react';
import { WarningCircle, CheckCircle, Info, XCircle } from '@phosphor-icons/react';

const ConfirmDialogContext = createContext();

const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning', // 'warning', 'info', 'success', 'error'
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirmDialog = useCallback(
    ({ title, message, type = 'warning' }) => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          title,
          message,
          type,
          onConfirm: () => {
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(false); // Or reject(false) if you want to explicitly signal cancellation
          },
        });
      });
    },
    []
  );

  const iconMap = {
    warning: <WarningCircle className="w-10 h-10 text-orange-500" weight="fill" />,
    info: <Info className="w-10 h-10 text-blue-500" weight="fill" />,
    success: <CheckCircle className="w-10 h-10 text-green-500" weight="fill" />,
    error: <XCircle className="w-10 h-10 text-red-500" weight="fill" />,
  };

  const iconBgMap = {
    warning: 'bg-orange-100',
    info: 'bg-blue-100',
    success: 'bg-green-100',
    error: 'bg-red-100',
  };

  const buttonClassMap = {
    warning: 'bg-orange-600 hover:bg-orange-700 shadow-orange-100',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
    success: 'bg-green-600 hover:bg-green-700 shadow-green-100',
    error: 'bg-red-600 hover:bg-red-700 shadow-red-100',
  };


  return (
    <ConfirmDialogContext.Provider value={{ showConfirmDialog }}>
      {children}

      {dialogState.isOpen && (
        <div id="modalOverlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 fade-in">
          <div id="confirmModal" className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden scale-100 transition-transform">
            <div className="p-8 text-center space-y-4">
              <div id="modalIcon" className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl ${iconBgMap[dialogState.type]}`}>
                {iconMap[dialogState.type]}
              </div>
              <h4 id="modalTitle" className="text-xl font-bold text-slate-800">{dialogState.title}</h4>
              <p id="modalMessage" className="text-sm text-slate-500 leading-relaxed">{dialogState.message}</p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <button onClick={dialogState.onCancel} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">Hủy bỏ</button>
              <button onClick={dialogState.onConfirm} className={`flex-1 py-3 text-sm font-bold text-white rounded-2xl transition-all shadow-lg ${buttonClassMap[dialogState.type]}`}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};

export { ConfirmDialogContext, ConfirmDialogProvider };
