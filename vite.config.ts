import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포를 위한 base 경로 설정
  // 리포지토리 이름으로 변경하세요 (예: /your-repo-name/)
  base: '/vibe2/',
  server: {
    host: true,
  },
})
