import { defineNuxtModule, createResolver, addServerImportsDir } from '@nuxt/kit'

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

    // Transpile runtime
    _nuxt.options.build.transpile.push(resolver.resolve('./runtime'))

    /**
     * Inject Server side utils
     */
    const utils = resolver.resolve('./runtime/server/utils')
    addServerImportsDir(utils)
  },
})
