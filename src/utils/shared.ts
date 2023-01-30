import { DEFAULT_RESOLVER, METHODS } from '../internal/constants'

import { FetchContextType, ImperativeFetch, RequestWithBody } from '../types'

export const windowExists = typeof window !== 'undefined'

export function notNull(target: any) {
  return target !== null
}

export function getRequestHeaders(req: Request) {
  // @ts-ignore Gets the request headers
  return Object.fromEntries(new Headers(req.headers).entries())
}

export function isDefined(target: any) {
  return typeof target !== 'undefined'
}

export function isFunction(target: any) {
  return typeof target === 'function'
}

export function hasBaseUrl(target: string) {
  return target.startsWith('http://') || target.startsWith('https://')
}

export function jsonCompare(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * A serialize function that returns a JSON string
 */
export function serialize(input: any, replacer?: any, space?: any) {
  return JSON.stringify(input, replacer, space)
}

export const isFormData = (target: any) => {
  if (typeof FormData !== 'undefined') {
    return target instanceof FormData
  } else return false
}

function canHaveBody(method: keyof typeof METHODS) {
  return /(POST|PUT|DELETE|PATCH)/.test(method)
}

export function queue(callback: any, time: number = 0) {
  const tm = setTimeout(() => {
    callback()
    clearTimeout(tm)
  }, time)

  return tm
}

/**
 *
 * @param str The target string
 * @param $params The params to parse in the url
 *
 * Params should be separated by `"/"`, (e.g. `"/api/[resource]/:id"`)
 *
 * URL search params will not be affected
 */
export function setURLParams(str: string = '', $params: any = {}) {
  const hasQuery = str.includes('?')

  const queryString =
    '?' +
    str
      .split('?')
      .filter((_, i) => i > 0)
      .join('?')

  return (
    str
      .split('/')
      .map($segment => {
        const [segment] = $segment.split('?')
        if (segment.startsWith('[') && segment.endsWith(']')) {
          const paramName = segment.replace(/\[|\]/g, '')
          if (!(paramName in $params)) {
            console.warn(
              `Param '${paramName}' does not exist in params configuration for '${str}'`
            )
            return paramName
          }

          return $params[segment.replace(/\[|\]/g, '')]
        } else if (segment.startsWith(':')) {
          const paramName = segment.split('').slice(1).join('')
          if (!(paramName in $params)) {
            console.warn(
              `Param '${paramName}' does not exist in params configuration for '${str}'`
            )
            return paramName
          }
          return $params[paramName]
        } else {
          return segment
        }
      })
      .join('/') + (hasQuery ? queryString : '')
  )
}

/**
 * Creates a new request function. This is for usage with fetcher and fetcher.extend
 */
export function createRequestFn(
  method: string,
  baseUrl: string,
  $headers: any
): RequestWithBody {
  return async function (url, init = {}) {
    const {
      default: def,
      params = {},
      headers,
      query = {},
      body,
      formatBody,
      resolver = DEFAULT_RESOLVER,
      onResolve = () => {},
      onError = () => {}
    } = init

    const rawUrl = setURLParams(url, params)

    const reqQueryString = Object.keys(query)
      .map(q => [q, query[q]].join('='))
      .join('&')

    const reqConfig = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...$headers,
        ...headers
      },
      body: canHaveBody(method as any)
        ? isFunction(formatBody)
          ? (formatBody as any)(body)
          : body
        : undefined
    }

    let r = undefined as any

    const requestUrl = [
      baseUrl || '',
      rawUrl,
      url.includes('?') ? '&' : '?',
      reqQueryString
    ].join('')

    try {
      const req = await fetch(requestUrl, {
        ...init,
        ...reqConfig
      })
      r = req

      const data = await resolver(req)
      if (req?.status >= 400) {
        onError(true as any)
        return {
          res: req,
          data: def,
          error: true,
          code: req?.status,
          config: {
            ...init,
            url: `${baseUrl || ''}${rawUrl}`,
            ...reqConfig,
            query
          }
        }
      } else {
        onResolve(data, req)
        return {
          res: req,
          data: data,
          error: false,
          code: req?.status,
          config: {
            ...init,
            url: `${baseUrl || ''}${rawUrl}`,
            ...reqConfig,
            query
          }
        }
      }
    } catch (err) {
      onError(err as any)
      return {
        res: r,
        data: def,
        error: true,
        code: r?.status,
        config: {
          ...init,
          url: requestUrl,
          ...reqConfig
        }
      }
    }
  } as RequestWithBody
}

const createImperativeFetch = (ctx: FetchContextType) => {
  const keys = [
    'GET',
    'DELETE',
    'HEAD',
    'OPTIONS',
    'POST',
    'PUT',
    'PATCH',
    'PURGE',
    'LINK',
    'UNLINK'
  ]

  const { baseUrl } = ctx

  return Object.fromEntries(
    new Map(
      keys.map(k => [
        k.toLowerCase(),
        (url, config = {}) =>
          (Client as any)[k.toLowerCase()](
            hasBaseUrl(url) ? url : baseUrl + url,
            {
              ...ctx,
              ...config
            }
          )
      ])
    )
  ) as ImperativeFetch
}

/**
 * An Client for making HTTP Requests
 */
const Client = {
  get: createRequestFn('GET', '', {}),
  delete: createRequestFn('DELETE', '', {}),
  head: createRequestFn('HEAD', '', {}),
  options: createRequestFn('OPTIONS', '', {}),
  post: createRequestFn('POST', '', {}),
  put: createRequestFn('PUT', '', {}),
  patch: createRequestFn('PATCH', '', {}),
  purge: createRequestFn('PURGE', '', {}),
  link: createRequestFn('LINK', '', {}),
  unlink: createRequestFn('UNLINK', '', {}),
  extend: createImperativeFetch
}

export { Client }
