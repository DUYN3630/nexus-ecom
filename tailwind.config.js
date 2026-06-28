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
        // Cara Design System Colors
        cara: {
          ink: '#1F1F1F',
          accent: '#0F172A', // Navy Slate-900
          'accent-alt': '#4F46E5', // Indigo-600
          surface: '#F4F6FA', // Cool Navy-Slate light surface
          cream: '#E8ECF5', // Cool Navy-Slate accent-cream
          muted: '#4E535C',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: { '3xl': '24px' }
    },
  },
  plugins: [],
}