/**
 * Vite 配置：纯前端 Phaser 工程
 * - 入口为 index.html，Phaser 由 src/main.js 启动
 * - public/ 下的 assets 会被原样发布到根路径
 */
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
});
