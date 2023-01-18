import * as React from 'react'
import { useGql } from '../hooks/others'
import { useFetcher } from '../hooks/use-fetcher'

import {
  cacheForMutation,
  previousConfig,
  requestsProvider,
  valuesMemory
} from '../internal'

import { DEFAULT_RESOLVER, METHODS } from '../internal/constants'

import {
  CacheStoreType,
  FetcherContextType,
  ImperativeFetcher,
  RequestWithBody,
  FetcherInit
} from '../types'

export const windowExists = typeof window !== 'undefined'

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

export function serialize(input: any) {
  return JSON.stringify(input)
}

export function merge(...objects: any) {
  return Object.assign({}, ...objects)
}

export const isFormData = (target: any) => {
  if (typeof FormData !== 'undefined') {
    return target instanceof FormData
  } else return false
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
      .map(($segment) => {
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
  $headers: any,
  q?: any
): RequestWithBody {
  return async function (url, init = {}) {
    const {
      default: def,
      resolver = DEFAULT_RESOLVER,
      config: c = {},
      onResolve = () => {},
      onError = () => {}
    } = init

    const { params = {} } = c || {}

    let query = {
      ...q,
      ...c.query
    }

    const rawUrl = setURLParams(url, params)

    const [, qp = ''] = rawUrl.split('?')

    qp.split('&').forEach((q) => {
      const [key, value] = q.split('=')
      if (query[key] !== value) {
        query = {
          ...query,
          [key]: value
        }
      }
    })

    const reqQueryString = Object.keys(query)
      .map((q) => [q, query[q]].join('='))
      .join('&')

    const { headers = {}, body, formatBody } = c

    const reqConfig = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...$headers,
        ...headers
      },
      body: method?.match(/(POST|PUT|DELETE|PATCH)/)
        ? isFunction(formatBody)
          ? (formatBody as any)(body)
          : (formatBody as any) === false || isFormData(body)
          ? body
          : serialize(body)
        : undefined
    }

    let r = undefined as any
    try {
      const req = await fetch(
        `${baseUrl || ''}${rawUrl}${
          url.includes('?') ? `&${reqQueryString}` : `?${reqQueryString}`
        }`,
        reqConfig
      )
      r = req
      const data = await resolver(req)
      if (req?.status >= 400) {
        onError(true as any)
        return {
          res: req,
          data: def,
          error: true,
          code: req?.status,
          config: { url: `${baseUrl || ''}${rawUrl}`, ...reqConfig, query }
        }
      } else {
        onResolve(data, req)
        return {
          res: req,
          data: data,
          error: false,
          code: req?.status,
          config: { url: `${baseUrl || ''}${rawUrl}`, ...reqConfig, query }
        }
      }
    } catch (err) {
      onError(err as any)
      return {
        res: r,
        data: def,
        error: true,
        code: r?.status,
        config: { url: `${baseUrl || ''}${rawUrl}`, ...reqConfig, query }
      }
    }
  } as RequestWithBody
}

export const createImperativeFetcher = (ctx: FetcherContextType) => {
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
      keys.map((k) => [
        k.toLowerCase(),
        (url, { config = {}, ...other } = {}) =>
          (useFetcher as any)[k.toLowerCase()](
            hasBaseUrl(url) ? url : baseUrl + url,
            {
              config: {
                headers: {
                  ...ctx.headers,
                  ...config.headers
                },
                body: config.body,
                query: {
                  ...ctx.query,
                  ...config.query
                },
                params: {
                  ...ctx.params,
                  ...config.params
                },
                formatBody: config.formatBody
              },
              ...other
            }
          )
      ])
    )
  ) as ImperativeFetcher
}

/**
 * Revalidate requests that match an id or ids
 */
export function revalidate(id: any | any[]) {
  if (Array.isArray(id)) {
    id.map((reqId) => {
      if (isDefined(reqId)) {
        const key = serialize(reqId)

        const resolveKey = serialize({ idString: key })

        previousConfig[resolveKey] = undefined

        requestsProvider.emit(key)
      }
    })
  } else {
    if (isDefined(id)) {
      const key = serialize(id)

      const resolveKey = serialize({ idString: key })

      previousConfig[resolveKey] = undefined

      requestsProvider.emit(key)
    }
  }
}

export function gql<T = any, VT = { [k: string]: any }>(...args: any) {
  let query = (args as any)[0][0]

  const returnObj = {
    value: query as T,
    variables: {} as VT,
    baseUrl: undefined as unknown as string,
    graphqlPath: undefined as unknown as string,
    headers: {} as {
      [key: string]: any
    }
  }

  return returnObj
}

/**
 *
 * @param queries
 * @returns A hook that has full TypeScript support and offers autocomplete for every query passed
 */
export function queryProvider<R>(
  queries: {
    [e in keyof R]: R[e]
  },
  providerConfig?: {
    defaults?: {
      [key in keyof R]?: Partial<ReturnType<typeof gql<R[key]>>['value']>
    }
    config?: {
      /**
       * The base url
       */
      baseUrl?: string
      /**
       * Any aditional headers
       */
      headers?: {
        [key: string]: any
      }
      /**
       * The caching mechanism
       */
      cache?: CacheStoreType
    }
  }
) {
  type QuerysType = typeof queries

  return function useQuery<P extends keyof R>(
    queryName: P,
    otherConfig?: Omit<
      FetcherInit<
        QuerysType[P] extends ReturnType<typeof gql>
          ? QuerysType[P]['value']
          : any
      >,
      'url'
    > & {
      default?: QuerysType[P] extends ReturnType<typeof gql>
        ? QuerysType[P]['value']
        : any
      variables?: QuerysType[P] extends ReturnType<typeof gql>
        ? QuerysType[P]['variables']
        : any
      graphqlPath?: string
    }
  ) {
    const { defaults } = providerConfig || {}

    const thisDefaults = (defaults || ({} as any))?.[queryName]

    const queryVariables = {
      ...thisDefaults?.variables,
      ...(otherConfig as any)?.variables
    }

    const { config = {} } = providerConfig || {}

    const { cache, ...others } = config

    const g = useGql(queries[queryName] as any, {
      cache: config?.cache,
      graphqlPath: isDefined(thisDefaults?.graphqlPath)
        ? thisDefaults?.graphqlPath
        : undefined,
      ...otherConfig,

      // These two can have a 'url' property and they are in that
      // order because 'otherConfig' can overwrite the configured url
      ...others,
      ...thisDefaults?.headers,
      baseUrl: isDefined(thisDefaults?.baseUrl)
        ? thisDefaults?.baseUrl
        : isDefined(providerConfig?.config?.baseUrl)
        ? providerConfig?.config?.baseUrl
        : undefined,
      ...otherConfig,
      headers: {
        ...others?.headers,
        ...thisDefaults?.headers,
        ...otherConfig?.headers
      },
      ...{ __fromProvider: true },
      default: {
        data: (isDefined(thisDefaults?.value)
          ? thisDefaults.value
          : /*
             * This should also work with graphql, so an id may or may not have a
             * 'value' property (when using the `gql` function)
             */
            // @ts-ignore
            otherConfig?.default) as R[P]['value']
      },
      variables: queryVariables
    })

    const thisData = React.useMemo(
      () => ({
        ...g?.data,
        variables: queryVariables
      }),
      [serialize({ data: g?.data, queryVariables })]
    )

    return {
      ...g,
      config: {
        ...g?.config,
        config: undefined
      },
      data: thisData
    } as Omit<typeof g, 'data'> & {
      data: {
        data: QuerysType[P] extends ReturnType<typeof gql>
          ? QuerysType[P]['value']
          : any
        errors?: any[]
        variables: QuerysType[P] extends ReturnType<typeof gql>
          ? QuerysType[P]['variables']
          : any
      }
    }
  }
}

/**
 * Force mutation in requests from anywhere. This doesn't revalidate requests
 */
export function mutateData(
  ...pairs: [any, any | ((cache: any) => any), boolean?][]
) {
  for (let pair of pairs) {
    try {
      const [k, v, _revalidate] = pair
      const key = serialize({ idString: serialize(k) })
      const requestCallId = ''
      if (isFunction(v)) {
        let newVal = v(cacheForMutation[key])
        requestsProvider.emit(key, {
          data: newVal,
          isMutating: true,
          requestCallId
        })
        if (_revalidate) {
          previousConfig[key] = undefined
          requestsProvider.emit(serialize(k))
        }
        queue(() => {
          valuesMemory[key] = newVal
          cacheForMutation[key] = newVal
        })
      } else {
        requestsProvider.emit(key, {
          requestCallId,
          isMutating: true,
          data: v
        })
        if (_revalidate) {
          previousConfig[key] = undefined
          requestsProvider.emit(serialize(k))
        }
        queue(() => {
          valuesMemory[key] = v
          cacheForMutation[key] = v
        })
      }
    } catch (err) {}
  }
}

export function canHaveBody(method: keyof typeof METHODS) {
  return /(POST|PUT|DELETE|PATCH)/.test(method)
}
