import {defineConfig, splitVendorChunkPlugin} from "vite";
import vuePlugin from "@vitejs/plugin-vue";


export default defineConfig({
  root: "./src-vue/",

  plugins: [
    vuePlugin(),
    splitVendorChunkPlugin(),
  ],
  base: "./",
  esbuild: {
    target: "es2021",
  },
  build: {
    cssCodeSplit: true,
    outDir: "../dist-popup",
    target: "es2020",
    sourcemap: false,
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
});
