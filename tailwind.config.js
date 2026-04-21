/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Đây là dòng giúp Tailwind tìm thấy các class trong file của bạn
  ],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
        expired: '#f43f5e',
        active: '#10b981',
        scheduled: '#3b82f6',
        hidden: '#94a3b8',
        light: '#F7F7F7',
        paper: '#FAFAFA',
        soft: '#EFEFEF',
        charcoal: '#333333',
        accent: '#818cf8',
      },
      borderRadius: { '3xl': '24px' }
    },
  },
  plugins: [],
}