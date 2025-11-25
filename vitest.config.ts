import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',
    
    // 测试文件匹配模式
    include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        'examples/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
    
    // 全局设置
    globals: true,
    
    // 超时设置
    testTimeout: 10000,
    
    // 设置文件
    setupFiles: [],
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});

