import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import appdevDesignMode from '@xagi/vite-plugin-design-mode';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [

    // <!-- DEV-INJECT-START -->
    {
      name: 'dev-inject',
      enforce: 'post', // 确保在 HTML 注入阶段最后执行
      transformIndexHtml(html) {
        if (!html.includes('data-id="dev-inject-monitor"')) {
          return html.replace("</head>", `
    <script data-id="dev-inject-monitor">
      (function() {
        const remote = "/sdk/dev-monitor.js";
        const separator = remote.includes('?') ? '&' : '?';
        const script = document.createElement('script');
        script.src = remote + separator + 't=' + Date.now();
        script.dataset.id = 'dev-inject-monitor-script';
        script.defer = true;
        // 防止重复注入
        if (!document.querySelector('[data-id="dev-inject-monitor-script"]')) {
          document.head.appendChild(script);
        }
      })();
    </script>
  \n</head>`);
        }
        return html;
      }
    },
    // <!-- DEV-INJECT-END -->

    // IMPORTANT: appdevDesignMode must come BEFORE react plugin
    // so it can transform JSX before React plugin processes it
    appdevDesignMode(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
