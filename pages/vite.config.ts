import {defineConfig} from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import path from "node:path";


export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "../src")
      }
    ]
  },
  root: "./",
  plugins: [
    vuePlugin(),
  ],
  base: "./",
  esbuild: {
    target: "es2021",
  },
  build: {
    outDir: "./bundle",
    target: "es2020",
    rollupOptions: {
      input: [
          path.resolve(__dirname, "popup.html"),
          path.resolve(__dirname, "background.html"),
          path.resolve(__dirname, "settings.html"),
          path.resolve(__dirname, "tabs.html"),
          path.resolve(__dirname, "list.html"),
      ],
      preserveEntrySignatures: "strict",
      output: {
        compact: false,
        minifyInternalExports: false,
        hashCharacters: "base36",
        manualChunks: {
          "vue-js": ["vue"],
        },
        // preserveModules: true,  // for prod [?]
      }
    },
    sourcemap: "inline", // for dev
    minify: false,
    cssCodeSplit: true,
  },
});
