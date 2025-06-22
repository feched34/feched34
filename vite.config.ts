import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", "client"),
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      external: [
        '@rollup/rollup-linux-x64-gnu',
        '@rollup/rollup-win32-x64-msvc',
        '@rollup/rollup-darwin-x64'
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          livekit: ['livekit-client'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          particles: ['tsparticles', '@tsparticles/react'],
        },
      },
    },
    target: 'es2020',
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'livekit-client',
      '@tsparticles/react',
      'tsparticles',
    ],
  },
  css: {
    devSourcemap: true,
  },
});
