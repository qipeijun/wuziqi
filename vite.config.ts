import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置：如果部署到 https://<username>.github.io/<repo>/
  // 请将 base 设置为 '/<repo>/'；如果是 https://<username>.github.io/ 则设置为 '/'
  base: process.env.GITHUB_ACTIONS ? '/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
