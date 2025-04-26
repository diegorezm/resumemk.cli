import { defineConfig } from "vite";
import { sync } from "glob";
import tailwindcss from "@tailwindcss/vite";

const commonMetadata = `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Your website description goes here.">
  <meta name="keywords" content="your, keywords, go, here">
  <link href="/style.css" rel="stylesheet" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
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
      input: sync("./src/**/*.html".replace(/\\/g, "/")),
    },
  },
  plugins: [tailwindcss(), transformHtmlPlugin({ metadata: commonMetadata })],
});
