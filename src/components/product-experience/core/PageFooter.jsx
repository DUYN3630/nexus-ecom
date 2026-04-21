import React from 'react';
import { Link } from 'react-router-dom';

const PageFooter = () => {
  return (
    <footer className="py-20 px-6 bg-white text-center border-t border-[#D2D2D7]/30">
      <div className="max-w-[1200px] mx-auto space-y-12">
        <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-[#6E6E73] uppercase tracking-[0.4em]">
          <Link to="/policy/privacy" className="hover:text-black">Chính sách bảo mật</Link>
          <Link to="/policy/terms" className="hover:text-black">Điều khoản sử dụng</Link>
          <Link to="/sitemap" className="hover:text-black">Sơ đồ trang</Link>
        </div>
        <p className="text-[10px] font-black text-[#D2D2D7] uppercase tracking-[1em]">© 2026 APPLE MOD / CRAFTED FOR THE FEW</p>
      </div>
    </footer>
  );
};

export default PageFooter;
