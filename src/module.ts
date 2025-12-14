import { defineNuxtModule, createResolver, addServerImports, addImportsDir } from '@nuxt/kit'
import { FBRGenerator } from './FBRGenerator'

export interface ModuleOptions {
  enableFBR: boolean
  serverDir: string
  honoDir: string
  generatedDir: string
}

const MODULE_NAME = '@sola-nyan/nuxt-hono'
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'hono',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  defaults: {
    enableFBR: false,
    serverDir: 'server',
    honoDir: 'hono',
    generatedDir: 'generated',
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    /**
     * Inject Server Util : createH3HonoRouter
     */
    addServerImports([{
      from: resolver.resolve('./runtime/server/utils/createH3HonoRouter'),
      name: 'createH3HonoRouter',
    }])

    /**
     * Inject Server Util : createH3HonoHandler
     */
    addServerImports([{
      from: resolver.resolve('./runtime/server/utils/createH3HonoHandler'),
      name: 'createH3HonoHandler',

    }])

    /**
     * File Based Routing
     */
    if (_options.enableFBR)
      FBRGenerator(_nuxt, _options)

    /**
     * Inject Util : clientHelper
     */
    addImportsDir(resolver.resolve('./runtime/utils'))
  },
})
