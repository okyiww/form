import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/form-docs/",
  title: "Form",
  description: "A vue form builder.",
  themeConfig: {
    nav: [{ text: "Home", link: "/docs" }],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/articles/guide/introduction" },
          { text: "Getting Started", link: "/articles/guide/getting-started" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/okyiww/form" }],
  },
});
