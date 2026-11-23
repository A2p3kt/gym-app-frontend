import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the same `dist/` build works at a domain root
  // (Vercel, Netlify) and in a sub-folder (GitHub Pages: https://<user>.github.io/<repo>/).
  // This is safe because the app has no client-side router (tabs are plain React state).
  base: './',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Put AG Grid in its own clearly named chunk. It is only loaded when the
          // Customers or Trainings page is opened (pages are lazy-loaded in App.tsx).
          groups: [{ name: 'ag-grid', test: /node_modules[\\/]ag-grid/ }],
        },
      },
    },
    // AG Grid's core is ~1 MB minified (~290 kB gzipped) even with only the modules we
    // register, so the default 500 kB warning would always fire for that one lazy chunk.
    chunkSizeWarningLimit: 1100,
  },
})
