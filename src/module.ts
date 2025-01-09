import { defineNuxtModule, createResolver, addServerImports, addImportsDir } from '@nuxt/kit'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleOptions {

}

const MODULE_NAME = '@sola-nyan/nuxt-hono'
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'hono',
    compatibility: {
      nuxt: '^3.11.0',
    },
  },
  defaults: {
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
     * Inject Util : clientHelper
     */
    addImportsDir(resolver.resolve('./runtime/utils'))
  },
})
