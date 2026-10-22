import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    port: 5173,          // Cổng mặc định cho Vite
    open: true,          // Tự động mở trình duyệt khi chạy dev
    proxy: {
      // Proxy tất cả request bắt đầu bằng /api sang Java backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
})
