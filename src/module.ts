import { defineNuxtModule, createResolver, addServerImports, addImports } from '@nuxt/kit'

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
     * Inject Server Util : createHonoServer
     */
    addServerImports([{
      from: resolver.resolve('./runtime/server/utils/createHonoServer'),
      name: 'createHonoServer',
    }])

    /**
     * Inject Server Util : createHonoRouter
     */
    addServerImports([{
      from: resolver.resolve('./runtime/server/utils/createHonoRouter'),
      name: 'createHonoRouter',
    }])

    /**
     * Inject Util : clientHelper
     */
    addImports([{
      from: resolver.resolve('./runtime/utils/clientHelper'),
      name: 'createHonoJsonClient',
    }])
  },
})
