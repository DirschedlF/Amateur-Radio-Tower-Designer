import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isSingleFile = process.env.BUILD_MODE === 'singlefile'

export default defineConfig({
  plugins: [
    react(),
    ...(isSingleFile ? [viteSingleFile()] : []),
  ],
  base: isSingleFile ? './' : '/',
  build: {
    outDir: isSingleFile ? 'dist-standalone' : 'dist',
  },
  test: {
    environment: 'node',
  },
})
