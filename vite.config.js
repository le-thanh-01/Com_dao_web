import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/Com_dao_web/",
  build: {
    rollupOptions: {
      // Khai báo các điểm đầu vào (Entry points) của dự án
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        // Nếu có thêm trang, cứ khai báo tiếp ở đây (ví dụ: contact: resolve(...))
      },
    },
  },
});
