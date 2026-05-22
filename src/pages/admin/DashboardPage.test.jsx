import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the API
vi.mock('../../api/analyticsApi', () => ({
  getOverviewStats: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      totalRevenue: 50000000,
      totalOrders: 25,
      newUsers: 10,
      revenueByDay: [{ date: '2026-05-20', amount: 50000000 }]
    }
  }))
}));

// Mock Chart.js to avoid canvas errors in JSDOM
vi.mock('chart.js/auto', () => {
  return {
    default: class {
      constructor() {
        this.destroy = vi.fn();
        this.update = vi.fn();
      }
    }
  };
});

// Mock getContext for canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('DashboardPage - Typography & UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dashboard title with correct typography classes', async () => {
    renderWithRouter(<DashboardPage />);
    
    // Check for "Khởi tạo hệ thống..." loading state first or wait for content
    const loadingText = await screen.findByText(/Khởi tạo hệ thống/i);
    expect(loadingText).toHaveClass('text-sm', 'font-bold', 'text-slate-400');

    // Wait for the data to load
    const title = await screen.findByText(/Bảng điều khiển Nexus/i);
    
    // Typography check: should have "text-3xl", "font-black", "uppercase"
    expect(title).toHaveClass('text-3xl');
    expect(title).toHaveClass('font-black');
    expect(title).toHaveClass('uppercase');
  });

  it('should have SummaryCards with specific small text sizes (10px/11px)', async () => {
    renderWithRouter(<DashboardPage />);
    
    // Use findAllByText because "Doanh thu" might appear in multiple places
    const elements = await screen.findAllByText(/Doanh thu/i);
    // Find the one that's a title (text-[11px])
    const revenueTitle = elements.find(el => el.classList.contains('text-[11px]'));
    
    expect(revenueTitle).toBeTruthy();
    expect(revenueTitle).toHaveClass('font-black');
    expect(revenueTitle).toHaveClass('uppercase');
  });

  it('should display the "Hệ thống Trực tuyến" badge with tiny text', async () => {
    renderWithRouter(<DashboardPage />);
    
    const badge = await screen.findByText(/Hệ thống Trực tuyến/i);
    // Based on code: text-[10px] font-black uppercase tracking-widest
    expect(badge).toHaveClass('text-[10px]');
    expect(badge).toHaveClass('font-black');
  });
});
