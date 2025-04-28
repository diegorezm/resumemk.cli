import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const commonMetadata = `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Your website description goes here.">
  <meta name="keywords" content="your, keywords, go, here">
  <link href="/style.css" rel="stylesheet" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
`;

/**
 * @param data { [key: string]: string }
 **/
const transformHtmlPlugin = (data) => ({
  name: "transform-html",
  transformIndexHtml: {
    order: "pre",
    handler(html) {
      return html.replace(/<%=\s*(\w+)\s*%>/gi, (match, p1) => data[p1] || "");
    },
  },
});

export default defineConfig({
  root: "./src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    cssMinify: true,
    minify: true,
    rollupOptions: {
      input: {
        index: "./src/index.html",
        dashboard: "./src/dashboard.html",
        resume: "./src/resume.html",
      },
    },
  },
  plugins: [tailwindcss(), transformHtmlPlugin({ metadata: commonMetadata })],
});
