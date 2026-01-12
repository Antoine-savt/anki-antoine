import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Modifiez cette valeur pour correspondre au nom de votre dépôt GitHub
  // Si votre dépôt s'appelle "mon-repo", changez en '/mon-repo/'
  // Si vous utilisez un site utilisateur/organisation (username.github.io), changez en '/'
  base: '/anki-antoine/',
  build: {
    outDir: 'dist',
  },
})
