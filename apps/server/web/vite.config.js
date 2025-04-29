import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const commonMetadata = `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="/style.css" rel="stylesheet" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <meta
      name="description"
      content="Create your resume for free with Resumemk using Markdown. Build professional resumes quickly and effortlessly."
    />
    <link rel="author" href="https://diegorezm.netlify.app/" />
    <meta name="author" content="Diego Rezende" />
    <meta
      name="keywords"
      content="resume builder, Markdown resume, free resume maker, professional resume generator, Resumemk, create resume online"
    />
    <meta property="og:title" content="Resumemk - Your resume with markdown!" />
    <meta
      property="og:description"
      content="Create your resume for free with Resumemk using Markdown. Build professional resumes quickly and effortlessly."
    />
    <meta property="og:url" content="https://resumemk.xyz" />
    <meta property="og:image" content="https://resumemk.xyz/og.png" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta
      name="twitter:title"
      content="Resumemk - Your resume with markdown!"
    />
    <meta
      name="twitter:description"
      content="Create your resume for free with Resumemk using Markdown. Build professional resumes quickly and effortlessly."
    />
    <meta name="twitter:image" content="https://resumemk.xyz/og.png" />
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
