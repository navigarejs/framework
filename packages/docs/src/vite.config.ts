import { defineConfig, searchForWorkspaceRoot } from 'vite'

console.log(searchForWorkspaceRoot(process.cwd()))

export default defineConfig({
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
})
