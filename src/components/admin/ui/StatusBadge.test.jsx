import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Đây là một Component nhỏ mô phỏng logic hiển thị Trạng thái (thường thấy ở OrderPage)
// Tôi đặt nó ngay trong file test này để bạn dễ hình dung. 
// Trong thực tế, Component này sẽ nằm ở một file riêng (VD: src/components/admin/ui/StatusBadge.jsx)
const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'New': return 'bg-emerald-50 text-emerald-600';
      case 'Cancelled': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <span data-testid="status-badge" className={`px-4 py-1 rounded-full ${getStyle()}`}>
      {status}
    </span>
  );
};

// ==========================================
// BẮT ĐẦU PHẦN VIẾT TEST
// ==========================================

// "describe" giống như tên một thư mục, dùng để gom nhóm các bài test liên quan đến "StatusBadge"
describe('Component: StatusBadge', () => {

  // "it" (hoặc "test") là tên của một kịch bản test cụ thể.
  // Kịch bản 1: Test xem nó có hiện đúng màu khi trạng thái là Đơn Mới không.
  it('Hiển thị màu Xanh (emerald) khi trạng thái là "New"', () => {
    
    // BƯỚC 1: RENDERING (Vẽ ảo)
    // Máy tính sẽ vẽ cái cục StatusBadge này vào trong bộ nhớ, truyền cho chữ 'New'
    render(<StatusBadge status="New" />);
    
    // BƯỚC 2: TÌM KIẾM (Searching)
    // Máy tính đi tìm một cái thẻ HTML có gắn nhãn data-testid="status-badge"
    const badgeElement = screen.getByTestId('status-badge');
    
    // BƯỚC 3: KIỂM TRA ĐÚNG/SAI (Assertion)
    // Ta "kỳ vọng" (expect) rằng cái thẻ tìm được phải chứa nội dung là 'New'
    expect(badgeElement).toHaveTextContent('New');
    
    // Và "kỳ vọng" nó phải có cái class màu xanh (text-emerald-600)
    expect(badgeElement).toHaveClass('text-emerald-600');
  });

  // Kịch bản 2: Test xem nó có hiện màu Đỏ khi Hủy đơn không.
  it('Hiển thị màu Đỏ (rose) khi trạng thái là "Cancelled"', () => {
    // Vẽ ảo với chữ Cancelled
    render(<StatusBadge status="Cancelled" />);
    
    const badgeElement = screen.getByTestId('status-badge');
    
    // Kỳ vọng nó phải chứa chữ Cancelled và có màu đỏ
    expect(badgeElement).toHaveTextContent('Cancelled');
    expect(badgeElement).toHaveClass('text-rose-600');
  });

  // Kịch bản 3: Xử lý ngoại lệ (Một trạng thái linh tinh nào đó)
  it('Hiển thị màu Xám (slate) mặc định nếu trạng thái không xác định', () => {
    // Truyền vào một chữ vớ vẩn
    render(<StatusBadge status="abc_xyz" />);
    
    const badgeElement = screen.getByTestId('status-badge');
    
    expect(badgeElement).toHaveTextContent('abc_xyz');
    // Vì không có trong switch-case, nó phải rơi vào nhánh default (màu xám)
    expect(badgeElement).toHaveClass('text-slate-500');
  });

});
