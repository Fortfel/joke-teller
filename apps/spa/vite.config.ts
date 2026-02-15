import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'
import VitePluginBrowserSync from 'vite-plugin-browser-sync'
import tsconfigPaths from 'vite-tsconfig-paths'
import { z } from 'zod/v4'

const envSchema = z.object({
  /**
   * Since vite is only used during development, we can assume the structure
   * will resemble a URL such as: http://localhost:3035.
   * This will then be used to set the vite dev server's host and port.
   */
  PUBLIC_CLIENT_URL: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.hostname,
      error: 'Invalid web URL',
    })
    .default('http://localhost:3035'),
  /**
   * Set this if you want to run or deploy your app at a base URL. This is
   * usually required for deploying a repository to Github/Gitlab pages.
   * PUBLIC_BASE_PATH=/repository-name/
   */
  PUBLIC_BASE_PATH: z
    .string()
    .startsWith('/', { error: 'Base Path must start with "/" if provided.' })
    .endsWith('/', { error: 'Base Path must end with "/" if provided.' })
    .default('/'),
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = envSchema.parse(loadEnv(mode, process.cwd(), 'PUBLIC_'))

  const webUrl = new URL(env.PUBLIC_CLIENT_URL)
  const HOST = webUrl.hostname
  const PORT = Number.parseInt(webUrl.port, 10)
  const isProd = mode === 'production'

  return {
    base: isProd ? env.PUBLIC_BASE_PATH : '/',
    plugins: [
      devtools({
        removeDevtoolsOnBuild: true,
      }),
      react(),
      tailwindcss(),
      tsconfigPaths({
        root: './',
        projects: ['tsconfig.app.json'],
      }),
      legacy({
        // targets: ['defaults', 'not IE 11'], // its in browserlist option in packgae.json
      }),
      VitePluginBrowserSync({
        dev: {
          bs: {
            port: PORT + 11,
          },
        },
      }),
    ],
    envPrefix: 'PUBLIC_',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          /**
           * Modified from:
           * https://github.com/vitejs/vite/discussions/9440#discussioncomment-11430454
           */
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const modulePath = id.split('node_modules/')[1]
              const topLevelFolder = modulePath?.split('/')[0]
              if (topLevelFolder !== '.pnpm') {
                return topLevelFolder
              }
              const scopedPackageName = modulePath?.split('/')[1]
              const chunkName = scopedPackageName?.split('@')[scopedPackageName.startsWith('@') ? 1 : 0]
              return chunkName
            }
            // Return undefined for non-node_modules files to use default chunking
            return undefined
          },
        },
      },
    },
    server: {
      host: HOST,
      port: PORT,
      strictPort: true,
    },
  }
})
