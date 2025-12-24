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

      const basePath = convertRouterPath(relFromHonoRoot)
      logger.info(`Detected Hono Router: ${relFromHonoRoot} -> ${basePath} `)
      mounts.push(`  .route('${basePath}', ${varName})`)
    })

    return `${imports.join('\n')}

const app = createH3HonoRouter()
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

const eqIgnoreCase = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
const startsWithIgnoreCase = (s: string, prefix: string) =>
  s.toLowerCase().startsWith(prefix.toLowerCase())
const toLowerCamel = (s: string) => (s ? s[0]!.toLowerCase() + s.slice(1) : s)

function convertRouterPath(input: string): string {
  const normalized = input.replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)

  const routersIdx = parts.indexOf('routers')
  if (routersIdx === -1) throw new Error(`Invalid input: missing "routers": ${input}`)

  const rel = parts.slice(routersIdx + 1)
  if (rel.length === 0) throw new Error(`Invalid input: missing router name: ${input}`)

  const last = rel[rel.length - 1]!
  if (!last.endsWith('Router')) {
    throw new Error(`Invalid input: last segment must end with "Router": ${input}`)
  }

  const dirs = rel.slice(0, -1)
  const routerCore = last.slice(0, -'Router'.length)

  const isIndexByName = routerCore === 'Index'
  const isIndexBySameAsLastDir
    = dirs.length > 0 && eqIgnoreCase(routerCore, dirs[dirs.length - 1]!)
  const joinedDirs = dirs.join('')
  if (dirs.length > 0 && joinedDirs.length > 0 && startsWithIgnoreCase(routerCore, joinedDirs)) {
    const rest = routerCore.slice(joinedDirs.length)
    const base = dirs.map(toLowerCamel)
    if (rest.length === 0) {
      return base.length === 0 ? '/' : `/${base.join('/')}`
    }
    return `/${[...base, toLowerCamel(rest)].join('/')}`
  }
  const isIndexBySameAsAllDirsJoined
    = dirs.length > 0 && joinedDirs.length > 0 && eqIgnoreCase(routerCore, joinedDirs)

  const isIndexLike
    = isIndexByName || isIndexBySameAsLastDir || isIndexBySameAsAllDirsJoined

  const outSegs = isIndexLike ? dirs : [...dirs, routerCore]
  const converted = outSegs.map(toLowerCamel).join('/')

  return converted.length === 0 ? '/' : `/${converted}`
}
