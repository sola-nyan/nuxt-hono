import type { ClientResponse } from 'hono/client'
import type { ResponseFormat } from 'hono/types'
import type { StatusCode } from 'hono/utils/http-status'

const regex = /\((.*?)\)/ // ()で囲まれた文字列をキャプチャする正規表現

function argParse(argStr: string) {
  const vname = argStr.match(regex)![1]!
  const st1 = argStr.indexOf(vname, vname.length + 2)
  const pathMethod = argStr.substring(st1 + vname.length).replaceAll('.', '/').trim()
  const st2 = pathMethod.indexOf('$')
  const path = pathMethod.substring(0, st2 - 1)
  const st3 = pathMethod.indexOf('(')
  const method = pathMethod.substring(st2 + 1, st3)
  return { path, method }
}

interface Options {
  preRequest?: false | ((info: { path: string, method: string }) => void)
  postResponse?: false | ((info: { path: string, method: string, status: number, res: Response, isJson: boolean }) => void)
}

export function honoClientWrapper<C>(hcClient: C, options?: Options) {
  async function internalCaller<
    T extends Promise<ClientResponse<X, Y, ResponseFormat>>,
    X,
    Y extends StatusCode,
  >(caller: (client: C) => T): Promise<Awaited<T>> {
    if (options?.preRequest) {
      const { path, method } = argParse(caller.toString())
      await options.preRequest({ path, method })
    }
    const res = await caller(hcClient)
    if (options?.postResponse) {
      const { path, method } = argParse(caller.toString())
      const status = res.status
      const isJson = res.headers?.get('content-type')?.toLowerCase().includes('json') ?? false
      await options.postResponse({ path, method, status, isJson, res })
    }
    return res
  }

  return internalCaller
}
