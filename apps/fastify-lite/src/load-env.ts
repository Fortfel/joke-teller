import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Load environment files in order of priority (highest to lowest)
const loadEnvFiles = (): void => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const rootDir = path.join(__dirname, '../../..')
  const envFiles = [
    '.env.local', // Highest priority
    '.env',
  ]

  for (const file of envFiles) {
    const filePathDev = path.join(rootDir, file) // ../../../file (dev)
    const filePathProd = path.join(__dirname, file) // ./file (production)

    let isLoaded = false

    // Try prod path first
    if (existsSync(filePathProd)) {
      try {
        process.loadEnvFile(filePathProd)
        console.log(`Loaded environment file: ${file} from ${filePathProd}`)
        isLoaded = true
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`Failed to load ${file} from prod path:`, error.message)
        } else {
          console.warn(`Failed to load ${file} from prod path:`, error)
        }
      }
    }

    // Try dev path if prod didn't work
    if (!isLoaded && existsSync(filePathDev)) {
      try {
        process.loadEnvFile(filePathDev)
        console.log(`Loaded environment file: ${file} from ${filePathDev}`)
        isLoaded = true
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`Failed to load ${file} from dev path:`, error.message)
        } else {
          console.warn(`Failed to load ${file} from dev path:`, error)
        }
      }
    }

    if (!isLoaded) {
      console.log(`Environment file ${file} not found in either location - skipping (optional)`)
    }
  }
}

loadEnvFiles()
