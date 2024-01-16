import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/redict/",
  plugins: [
    vue(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  esbuild: {
    drop: ["debugger"],
    pure: ["console.log", "console.info"],
  },
  build: {
    target: "esnext",
    // sourcemap: true,
    assetsDir: "static/img/",
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const arr = id.toString().split("node_modules/")[1].split("/");
            switch (arr[0]) {
              case "@naturefw":
              case "@popperjs":
              case "@vue":
              case "element-plus":
              case "@element-plus":
                return "_" + arr[0];
                break;
              default:
                return "__vendor";
                break;
            }
          }
        },
        chunkFileNames: "static/js1/[name]-[hash].js",
        entryFileNames: "static/js2/[name]-[hash].js",
        assetFileNames: "static/[ext]/[name]-[hash].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
