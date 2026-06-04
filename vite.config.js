import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import react from '@vitejs/react-swc' // or '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  base: '/F1_Fan/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()]  }),
    tailwindcss(),
  ],
  
})
