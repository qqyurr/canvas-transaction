import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/browser.ts', '**/handlers.ts']
    },
  }
})
