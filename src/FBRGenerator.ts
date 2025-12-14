import { promises as fsp } from 'node:fs'
import { join, relative } from 'node:path'
import { addTemplate, updateTemplates, useLogger } from '@nuxt/kit'
import type { ModuleOptions } from './module'
import type { Nuxt } from 'nuxt/schema'

function stripExt(p: string): string {
  return p.replace(/\.(mts|ts)$/i, '')
}

export async function FBRGenerator(nuxt: Nuxt, option: ModuleOptions) {
  const logger = useLogger('nuxt-hono')
  const serverDir = option.serverDir
  const honoDir = option.honoDir
  const generatedDir = option.generatedDir
  const routersFileDir = `${serverDir}/${honoDir}/routers`
  const root = nuxt.options.rootDir
  const routesDir = join(root, routersFileDir)

  async function codeGen() {
    const files = await collectFiles(routesDir)

    const imports: string[] = []
    const mounts: string[] = []

    files.forEach((absPath, index) => {
      const cutPath = join(root, `${serverDir}/${honoDir}`)
      const relFromHonoRoot = stripExt(relative(
        cutPath,
        absPath,
      ).replace(/\\/g, '/'))

      const varName = `route_${index}`

      imports.push(
        `import { router as ${varName} } from '~~/${serverDir}/${honoDir}/${relFromHonoRoot}'`,
      )

      const basePath = toRoutePath(relFromHonoRoot)
      logger.info(`Detected Hono Router: ${relFromHonoRoot} -> ${basePath} `)
      mounts.push(`  .route('${basePath}', ${varName})`)
    })

    return `import { Hono } from 'hono'
${imports.join('\n')}

const app = new Hono()
${mounts.join('\n')}
export default app
`
  }

  const generated = {
    code: await codeGen(),
  }

  addTemplate({
    filename: `#generatedRoutes`,
    write: true,
    dst: `${root}/${serverDir}/${honoDir}/${generatedDir}/generatedRoutes.ts`,
    getContents: async () => generated.code,
  })
  logger.info(`Router generated: /${serverDir}/${honoDir}/${generatedDir}/generatedRoutes.ts `)

  nuxt.options.watch.push(`${root}/${serverDir}/${honoDir}/routers`)
  const targetEvent = ['add', 'change', 'unlinkDir', 'unlink']
  let flushTimer: NodeJS.Timeout | null = null

  let sleepTime = 1000
  async function flushChanges() {
    sleepTime = 1000
    logger.info('Router Change Detected : Updating Hono router')
    generated.code = await codeGen()
    await updateTemplates()
    logger.info(`Router generated: /${serverDir}/${honoDir}/${generatedDir}/generatedRoutes.ts `)
  }

  nuxt.hook('builder:watch', async (event, path) => {
    sleepTime = +500
    if (!path.startsWith(`${root}/${serverDir}/${honoDir}/routers/`))
      return
    if (!targetEvent.includes(event))
      return
    if (!path.endsWith(`Router.ts`) && event === 'add')
      return
    if (flushTimer)
      clearTimeout(flushTimer)
    flushTimer = setTimeout(flushChanges, sleepTime)
  })
}

export async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fsp.readdir(dir, { withFileTypes: true })
  const result: string[] = []

  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      result.push(...(await collectFiles(full)))
    }
    else if (e.isFile() && full.match(/Router\.(ts|mts)$/)) {
      result.push(full)
    }
  }

  return result
}

type PathString = string

function stripRouterSuffix(name: string): string {
  return name.replace(/Routers?$/i, '')
}

function toCamelCase(s: string): string {
  if (!s) return s

  if (/[ _-]/.test(s)) {
    const parts = s.split(/[ _-]+/).filter(Boolean)
    return parts
      .map((w, i) => {
        const lower = w.toLowerCase()
        if (i === 0) return lower
        return lower.charAt(0).toUpperCase() + lower.slice(1)
      })
      .join('')
  }

  return s.charAt(0).toLowerCase() + s.slice(1)
}

function isIndexName(name: string): boolean {
  return /^index$/i.test(name)
}

export function toRoutePath(filePath: PathString): string {
  const noExt = stripExt(filePath)

  const parts = noExt.split('/').filter(Boolean)
  const routersIdx = parts.findIndex(p => p === 'routers')
  if (routersIdx < 0 || routersIdx === parts.length - 1) {
    throw new Error(`Invalid router path: ${filePath}`)
  }

  const afterRouters = parts.slice(routersIdx + 1)
  const filePart = afterRouters[afterRouters.length - 1]
  const dirParts = afterRouters.slice(0, -1)

  const baseName = stripRouterSuffix(filePart!)

  if (dirParts.length === 0) {
    if (isIndexName(baseName)) return '/'
    return `/${toCamelCase(baseName)}`
  }

  const outDirs = dirParts.map(d => toCamelCase(d))
  const lastDirOriginal = dirParts[dirParts.length - 1]

  const fileCamel = toCamelCase(baseName)
  const lastDirCamel = toCamelCase(lastDirOriginal!)

  const omitFile
    = !isIndexName(baseName) && fileCamel.toLowerCase() === lastDirCamel.toLowerCase()

  return '/' + [...outDirs, ...(omitFile ? [] : [fileCamel])].join('/')
}
