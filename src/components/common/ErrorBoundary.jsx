import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRITICAL UI ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-10 text-center bg-red-50 rounded-3xl border border-red-100 m-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Đã có lỗi xảy ra.</h2>
          <p className="text-red-500 mb-6 font-mono text-sm">{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-bold uppercase"
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
