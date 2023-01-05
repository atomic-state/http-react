/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import { useState, useEffect, createContext, useContext } from 'react'
import { EventEmitter } from 'events'

type CustomResponse<T> = Omit<Response, 'json'> & {
  json(): Promise<T>
}

type RequestWithBody = <R = any, BodyType = any>(
  /**
   * The request url
   */
  url: string,
  /**
   * The request configuration
   */
  reqConfig?: {
    /**
     * Default value
     */
    default?: R
    /**
     * Other configuration
     */
    config?: {
      /**
       * Request query
       */
      query?: any
      /**
       * The function that formats the body
       */
      formatBody?(b: BodyType): any
      /**
       * Request headers
       */
      headers?: any
      /**
       * Request params (like Express)
       */
      params?: any
      /**
       * The request body
       */
      body?: BodyType
    }
    /**
     * The function that returns the resolved data
     */
    resolver?: (r: CustomResponse<R>) => any
    /**
     * A function that will run when the request fails
     */
    onError?(error: Error): void
    /**
     * A function that will run when the request completes succesfuly
     */
    onResolve?(data: R, res: CustomResponse<R>): void
  }
) => Promise<{
  error: any
  data: R
  config: any
  code: number
  res: CustomResponse<R>
}>

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
          // return $params[segment.replace(/\[|\]/g, '')] + hasQ ? '?' + hasQ : ''
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
function createRequestFn(
  method: string,
  baseUrl: string,
  $headers: any,
  q?: any
): RequestWithBody {
  return async function (url, init = {}) {
    const {
      default: def,
      resolver = e => e.json(),
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

    qp.split('&').forEach(q => {
      const [key, value] = q.split('=')
      if (query[key] !== value) {
        query = {
          ...query,
          [key]: value
        }
      }
    })

    const reqQueryString = Object.keys(query)
      .map(q => [q, query[q]].join('='))
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
          : JSON.stringify(body)
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

const runningRequests: any = {}

const previousConfig: any = {}

const previousProps: any = {}

const createRequestEmitter = () => {
  const emitter = new EventEmitter()

  emitter.setMaxListeners(10e10)

  return emitter
}

const requestEmitter = createRequestEmitter()

export type CacheStoreType = {
  get(k?: any): any
  set(k?: any, v?: any): any
  delete(k?: any): any
}

type FetcherContextType = {
  headers?: any
  baseUrl?: string
  /**
   * Keys in `defaults` are just friendly names. Defaults are based on the `id` and `value` passed
   */
  defaults?: {
    [key: string]: {
      /**
       * The `id` passed to the request
       */
      id?: any
      /**
       * Default value for this request
       */
      value?: any
      config?: any
    }
  }
  resolver?: (r: Response) => any
  children?: any
  auto?: boolean
  memory?: boolean
  refresh?: number
  attempts?: number
  attemptInterval?: number
  revalidateOnFocus?: boolean
  query?: any
  params?: any
  onOnline?: (e: { cancel: () => void }) => void
  onOffline?: () => void
  online?: boolean
  retryOnReconnect?: boolean
  cache?: CacheStoreType
  revalidateOnMount?: boolean
}

const FetcherContext = createContext<FetcherContextType>({
  defaults: {},
  attempts: 0,
  // By default its 2 seconds
  attemptInterval: 2,
  revalidateOnFocus: false,
  query: {},
  params: {},
  onOffline() {},
  onOnline() {},
  online: true,
  retryOnReconnect: true,
  revalidateOnMount: true
})

export type FetcherConfigType<FetchDataType = any, BodyType = any> = {
  /**
   * Any serializable id. This is optional.
   */
  id?: any
  /**
   * url of the resource to fetch
   */
  url?: string
  /**
   * Default data value
   */
  default?: FetchDataType
  /**
   * Refresh interval (in seconds) to re-fetch the resource
   * @default 0
   */
  refresh?: number
  /**
   * This will prevent automatic requests.
   * By setting this to `false`, requests will
   * only be made by calling `reFetch()`
   * @default true
   */
  auto?: boolean
  /**
   * Responses are saved in memory and used as default data.
   * If `false`, the `default` prop will be used instead.
   * @default true
   */
  memory?: boolean
  /**
   * Function to run when request is resolved succesfuly
   */
  onResolve?: (data: FetchDataType, req?: Response) => void
  /**
   * Function to run when data is mutated
   */
  onMutate?: (
    data: FetchDataType,
    /**
     * An imperative version of `useFetcher`
     */
    fetcher: ImperativeFetcher
  ) => void
  /**
   * Function to run when props change
   */
  onPropsChange?: (rev: {
    revalidate: () => void
    cancel: {
      (reason?: any): void
      (): void
    }
    fetcher: ImperativeFetcher
    props: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
    previousProps: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
  }) => void
  /**
   * Function to run when the request fails
   */
  onError?: (error: Error, req?: Response) => void
  /**
   * Function to run when a request is aborted
   */
  onAbort?: () => void
  /**
   * Whether a change in deps will cancel a queued request and make a new one
   */
  cancelOnChange?: boolean
  /**
   * Parse as json by default
   */
  resolver?: (d: CustomResponse<FetchDataType>) => any
  /**
   * The ammount of attempts if request fails
   * @default 1
   */
  attempts?: number
  /**
   * The interval at which to run attempts on request fail
   * @default 0
   */
  attemptInterval?: number
  /**
   * If a request should be made when the tab is focused. This currently works on browsers
   * @default false
   */
  revalidateOnFocus?: boolean
  /**
   * If `false`, revalidation will only happen when props passed to the `useFetch` change.
   * For example, you may want to have a component that should
   * fetch with `useFetch` only once during the application lifetime
   * or when its props change but not when, for example, navigating
   * between pages (web) or screens (React Native). This is very useful
   * when you have components that should persist their state, like layouts.
   * This is also a way of revalidating when props change.
   *
   * Note that the behaviour when props change is the same.
   * @default true
   */
  revalidateOnMount?: boolean
  /**
   * This will run when connection is interrupted
   */
  onOffline?: () => void
  /**
   * This will run when connection is restored
   */
  onOnline?: (e: { cancel: () => void }) => void
  /**
   * If the request should retry when connection is restored
   * @default true
   */
  retryOnReconnect?: boolean
  /**
   * Request configuration
   */
  config?: {
    /**
     * Override base url
     */
    baseUrl?: string
    /**
     * Request method
     */
    method?:
      | 'GET'
      | 'DELETE'
      | 'HEAD'
      | 'OPTIONS'
      | 'POST'
      | 'PUT'
      | 'PATCH'
      | 'PURGE'
      | 'LINK'
      | 'UNLINK'
    headers?: Headers | object
    query?: any
    /**
     * URL params
     */
    params?: any
    body?: BodyType
    /**
     * Customize how body is formated for the request. By default it will be sent in JSON format
     * but you can set it to false if for example, you are sending a `FormData`
     * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
     * (the last one is the default behaviour so in that case you can ignore it)
     */
    formatBody?: boolean | ((b: BodyType) => any)
  }
}

// If first argument is a string
type FetcherConfigTypeNoUrl<FetchDataType = any, BodyType = any> = Omit<
  FetcherConfigType<FetchDataType, BodyType>,
  'url'
>

const resolvedRequests: any = {}

const resolvedHookCalls: any = {}

const abortControllers: any = {}

/**
 * Default store cache
 */
const defaultCache: CacheStoreType = {
  get(k) {
    return resolvedRequests[k]
  },
  set(k, v) {
    resolvedRequests[k] = v
  },
  delete(k) {
    delete resolvedRequests[k]
  }
}

const valuesMemory: any = {}

export function FetcherConfig(props: FetcherContextType) {
  const { children, defaults = {}, baseUrl } = props

  const previousConfig = useHRFContext()

  const { cache = defaultCache } = previousConfig

  let base = !isDefined(baseUrl)
    ? !isDefined(previousConfig.baseUrl)
      ? ''
      : previousConfig.baseUrl
    : baseUrl

  for (let defaultKey in defaults) {
    const { id } = defaults[defaultKey]
    const resolvedKey = JSON.stringify(
      isDefined(id)
        ? {
            idString: JSON.stringify(id)
          }
        : {
            uri: `${base}${defaultKey}`,
            config: {
              method: defaults[defaultKey]?.config?.method
            }
          }
    )

    if (isDefined(id)) {
      if (!isDefined(valuesMemory[resolvedKey])) {
        valuesMemory[resolvedKey] = defaults[defaultKey]?.value
      }
      if (!isDefined(fetcherDefaults[resolvedKey])) {
        fetcherDefaults[resolvedKey] = defaults[defaultKey]?.value
      }
    }

    if (!isDefined(cache.get(resolvedKey))) {
      cache.set(resolvedKey, defaults[defaultKey]?.value)
    }
  }

  let mergedConfig = {
    ...previousConfig,
    ...props,
    headers: {
      ...previousConfig.headers,
      ...props.headers
    }
  }

  return (
    <FetcherContext.Provider value={mergedConfig}>
      {children}
    </FetcherContext.Provider>
  )
}

/**
 * Revalidate requests that match an id or ids
 */
export function revalidate(id: any | any[]) {
  if (Array.isArray(id)) {
    id.map(reqId => {
      if (isDefined(reqId)) {
        const key = JSON.stringify(reqId)

        const resolveKey = JSON.stringify({ idString: key })

        previousConfig[resolveKey] = undefined

        requestEmitter.emit(key)
      }
    })
  } else {
    if (isDefined(id)) {
      const key = JSON.stringify(id)

      const resolveKey = JSON.stringify({ idString: key })

      previousConfig[resolveKey] = undefined

      requestEmitter.emit(key)
    }
  }
}
const fetcherDefaults: any = {}
const cacheForMutation: any = {}

function queue(callback: any, time: number = 0) {
  // let tm = null
  const tm = setTimeout(() => {
    callback()
    clearTimeout(tm)
  }, time)

  return tm
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
      const key = JSON.stringify({ idString: JSON.stringify(k) })
      const requestCallId = ''
      if (isFunction(v)) {
        let newVal = v(cacheForMutation[key])
        requestEmitter.emit(key, {
          data: newVal,
          isMutating: true,
          requestCallId
        })
        if (_revalidate) {
          previousConfig[key] = undefined
          requestEmitter.emit(JSON.stringify(k))
        }
        queue(() => {
          cacheForMutation[key] = newVal
        })
      } else {
        requestEmitter.emit(key, {
          requestCallId,
          isMutating: true,
          data: v
        })
        if (_revalidate) {
          previousConfig[key] = undefined
          requestEmitter.emit(JSON.stringify(k))
        }
        queue(() => {
          cacheForMutation[key] = v
        })
      }
    } catch (err) {}
  }
}

/**
 * Get the current fetcher config
 */
export function useFetcherConfig(id?: string) {
  const ftxcf = useHRFContext()

  const { config } = useFetcherId(id)

  let allowedKeys = [
    'headers',
    'baseUrl',
    'body',
    'defaults',
    'resolver',
    'auto',
    'memory',
    'refresh',
    'attempts',
    'attemptInterval',
    'revalidateOnFocus',
    'query',
    'params',
    'onOnline',
    'onOffline',
    'online',
    'retryOnReconnect',
    'cache'
  ]

  // Remove the 'method' strings
  for (let k in ftxcf) {
    if (allowedKeys.indexOf(k) === -1) {
      delete (ftxcf as any)[k]
    }
  }
  return isDefined(id) ? config : ftxcf
}

/**
 * Get the data state of a request using its id
 */
export function useFetcherData<ResponseType = any, VT = any>(
  id: ResponseType extends { variables: any }
    ? string | number | object
    : {
        value: ResponseType
        variables: VT
        errors?: any[]
      },
  onResolve?: (
    data: typeof id extends { variables: any }
      ? {
          data: (Required<typeof id> & {
            value: ResponseType
            variables: VT
          })['value']
          variables: (Required<typeof id> & {
            value: ResponseType
            variables: VT
          })['variables']
        }
      : ResponseType
  ) => void
) {
  const { cache = defaultCache } = useHRFContext()

  const defaultsKey = JSON.stringify({
    idString: JSON.stringify(id)
  })

  const def = cache.get(defaultsKey)

  const { data } = useFetcher<typeof id>({
    default: def,
    id: id
  })

  useResolve(id, onResolve as any)

  return data
}

export function useFetcherCode(id: any) {
  const { code } = useFetcher({
    id: id
  })

  return code
}

/**
 * Get the loading state of a request using its id
 */
export function useFetcherLoading(id: any): boolean {
  const idString = JSON.stringify({ idString: JSON.stringify(id) })

  const { data } = useFetcher({
    id: id
  })

  return !isDefined(runningRequests[idString])
    ? true
    : runningRequests[idString]
}

/**
 * Get the error state of a request using its id
 */
export function useFetcherError(id: any, onError?: (err?: any) => void) {
  const { error } = useFetcher({
    id: id,
    onError
  })

  return error
}

/**
 * Get the mutate the request data using its id
 */
export function useFetcherMutate<T = any>(
  /**
   * The id of the `useFetch` call
   */
  id: any,
  /**
   * The function to run after mutating
   */
  onMutate?: (
    data: T,
    /**
     * An imperative version of `useFetcher`
     */
    fetcher: ImperativeFetcher
  ) => void
) {
  const { mutate } = useFetcher({
    id: id,
    onMutate
  })

  return mutate
}

/**
 * Get everything from a `useFetcher` call using its id
 */
export function useFetcherId<ResponseType = any, BodyType = any>(id: any) {
  const defaultsKey = JSON.stringify({
    idString: JSON.stringify(id)
  })
  const def = fetcherDefaults[defaultsKey]

  return useFetcher<ResponseType, BodyType>({
    id,
    default: def
  })
}

/**
 * Create an effect for when the request completes
 */
export function useResolve<ResponseType = any, VT = any>(
  id: ResponseType extends { variables: any }
    ? string | number | object
    : {
        value: ResponseType
        variables: VT
        errors?: any[]
      },
  onResolve: (
    data: typeof id extends { variables: any }
      ? {
          data: (Required<typeof id> & {
            value: ResponseType
          })['value']
          variables: (Required<typeof id> & {
            variables: VT
          })['variables']
          errors: (Required<typeof id> & {
            errors?: any[]
          })['errors']
        }
      : ResponseType
  ) => void
) {
  const defaultsKey = JSON.stringify({
    idString: JSON.stringify(id)
  })

  useEffect(() => {
    async function resolve(v: any) {
      const { isResolved, data } = v
      if (isResolved) {
        if (isFunction(onResolve)) {
          onResolve(data)
        }
      }
    }
    requestEmitter.addListener(defaultsKey, resolve)
    return () => {
      requestEmitter.removeListener(defaultsKey, resolve)
    }
  }, [defaultsKey, onResolve])
}

/**
 * User a `GET` request
 */
function useGET<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'GET'
    }
  })
}

/**
 * Use a `DELETE` request
 */
function useDELETE<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'DELETE'
    }
  })
}

/**
 * Use a `HEAD` request
 */
function useHEAD<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'HEAD'
    }
  })
}

/**
 * Use an `OPTIONS` request
 */
function useOPTIONS<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'OPTIONS'
    }
  })
}

/**
 * Use a `POST` request
 */
function usePOST<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'POST'
    }
  })
}

/**
 * Use a `PUT` request
 */
function usePUT<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'PUT'
    }
  })
}

/**
 * Use a `PATCH` request
 */
function usePATCH<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'PATCH'
    }
  })
}

/**
 * Use a `PURGE` request
 */
function usePURGE<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'PURGE'
    }
  })
}

/**
 * Use a `LINK` request
 */
function useLINK<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'LINK'
    }
  })
}

/**
 * Use an `UNLINK` request
 */
function useUNLINK<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetcher(init, {
    ...options,
    config: {
      ...options?.config,
      method: 'UNLINK'
    }
  })
}

/**
 * Get a blob of the response. You can pass an `objectURL` property that will convet that blob into a string using `URL.createObjectURL`
 */
export function useFetcherBlob<FetchDataType = string, BodyType = any>(
  init:
    | (FetcherConfigType<FetchDataType, BodyType> & { objectURL?: boolean })
    | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType> & {
    objectURL?: boolean
  }
) {
  return useFetcher<FetchDataType, BodyType>(init, {
    ...options,
    async resolver(res) {
      const blob = await res.blob()
      if (typeof URL !== 'undefined') {
        if ((init as any).objectURL) {
          return URL.createObjectURL(blob)
        } else {
          if (options?.objectURL) {
            return URL.createObjectURL(blob)
          }
        }
      }

      return blob
    }
  })
}

/**
 * Get a text of the response
 */
export function useFetcherText<FetchDataType = string, BodyType = any>(
  init: FetcherConfigType<string, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<string, BodyType>
) {
  return useFetcher<string, BodyType>(init, {
    ...options,
    async resolver(res) {
      const text = await res.text()
      return text
    }
  })
}

export function gql<T = any, VT = { [k: string]: any }>(...args: any) {
  let query = (args as any)[0][0]

  const returnObj = {
    value: query as T,
    variables: {} as VT
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

    const g = useGql(queries[queryName] as any, {
      ...otherConfig,
      ...{ __fromProvider: true },
      default: {
        data: (isDefined(thisDefaults?.value)
          ? thisDefaults.value
          : otherConfig?.default) as R[P]['value']
      },
      variables: queryVariables
    })

    const thisData = React.useMemo(
      () => ({
        ...g?.data,
        variables: queryVariables
      }),
      [JSON.stringify({ data: g?.data, queryVariables })]
    )

    return {
      ...g,
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
 * Make a graphQL request
 */
export function useGql<T = any, VT = { [k: string]: any }>(
  arg1:
    | undefined
    | {
        value: T
        variables: VT
      },
  cfg: FetcherConfigTypeNoUrl<T, any> & {
    /**
     * GraphQL variables
     */
    variables?: typeof arg1 extends undefined
      ? VT
      : (typeof arg1 & { value: T; variables: VT })['variables']
    /**
     * Override the GraphQL path
     *
     * (default is `'/graphql'`)
     */
    graphqlPath?: string
  } = {}
) {
  const isUsingExternalQuery = typeof (arg1 as any).value === 'string'

  let query: T

  if (isUsingExternalQuery) {
    query = (arg1 as any).value
  } else {
    query = (arg1 as any)[0][0]
  }

  const { variables = {}, graphqlPath = '/graphql', ...otherArgs } = cfg

  const { config = {} } = otherArgs

  const JSONBody = JSON.stringify({
    query,
    variables
  })

  const usingProvider = isDefined((cfg as any)['__fromProvider'])

  const g = useFetcher({
    url: graphqlPath,
    id: arg1,
    ...{ variables: (cfg as any).variables || ({} as VT) },
    ...otherArgs,
    default: usingProvider
      ? otherArgs.default
      : ({
          data: cfg?.default as T,
          errors: undefined,
          variables: (cfg as any).variables || ({} as VT)
        } as any),
    ...{ __gql: true },
    config: {
      ...config,
      formatBody: () => JSONBody,
      body: JSONBody,
      method: 'POST'
    }
  })
  return g as Omit<typeof g, 'data'> & {
    data: {
      data: T
      errors: any[]
      variables: VT
    }
  }
}

export {
  useFetcher as useFetch,
  useFetcherLoading as useLoading,
  useFetcherConfig as useConfig,
  useFetcherData as useData,
  useFetcherCode as useCode,
  useFetcherError as useError,
  useFetcherMutate as useMutate,
  useFetcherId as useFetchId,
  useFetcherBlob as useBlob,
  useFetcherText as useText,
  useGET,
  useDELETE,
  useHEAD,
  useOPTIONS,
  usePOST,
  usePUT,
  usePATCH,
  usePURGE,
  useLINK,
  useUNLINK
}

/**
 * Create a configuration object to use in a 'useFetcher' call
 */
export type FetcherInit<FDT = any, BT = any> = FetcherConfigTypeNoUrl<
  FDT,
  BT
> & {
  url?: string
}

/**
 * An imperative version of the `useFetcher`
 */
type ImperativeFetcher = {
  get: RequestWithBody
  delete: RequestWithBody
  head: RequestWithBody
  options: RequestWithBody
  post: RequestWithBody
  put: RequestWithBody
  patch: RequestWithBody
  purge: RequestWithBody
  link: RequestWithBody
  unlink: RequestWithBody
}

const createImperativeFetcher = (ctx: FetcherContextType) => {
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
        (url, { config = {}, ...other } = {}) =>
          (fetcher as any)[k.toLowerCase()](
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
 * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
 */
export function useImperative() {
  const ctx = useFetcherConfig()

  const imperativeFetcher = React.useMemo(
    () => createImperativeFetcher(ctx),
    [JSON.stringify(ctx)]
  )

  return imperativeFetcher
}

function isDefined(target: any) {
  return typeof target !== 'undefined'
}

function isFunction(target: any) {
  return typeof target === 'function'
}

function hasBaseUrl(target: string) {
  return target.startsWith('http://') || target.startsWith('https://')
}

function useHRFContext() {
  return useContext(FetcherContext)
}

const windowExists = typeof window !== 'undefined'

const hasErrors: any = {}

/**
 * Fetcher hook
 */
const useFetcher = <FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
) => {
  const ctx = useHRFContext()

  const { cache = defaultCache } = ctx

  const optionsConfig =
    typeof init === 'string'
      ? {
          // Pass init as the url if init is a string
          url: init,
          ...options
        }
      : init

  const {
    onOnline = ctx.onOnline,
    onOffline = ctx.onOffline,
    onMutate,
    onPropsChange,
    revalidateOnMount = ctx.revalidateOnMount,
    url = '',
    id,
    config = {
      query: {},
      params: {},
      baseUrl: undefined,
      method: 'GET',
      headers: {} as Headers,
      body: undefined as unknown as Body,
      formatBody: false
    },
    resolver = isFunction(ctx.resolver) ? ctx.resolver : (d: any) => d.json(),
    onError,
    auto = isDefined(ctx.auto) ? ctx.auto : true,
    memory = isDefined(ctx.memory) ? ctx.memory : true,
    onResolve,
    onAbort,
    refresh = isDefined(ctx.refresh) ? ctx.refresh : 0,
    cancelOnChange = false,
    attempts = ctx.attempts,
    attemptInterval = ctx.attemptInterval,
    revalidateOnFocus = ctx.revalidateOnFocus
  } = optionsConfig

  const requestCallId = React.useMemo(
    () => `${Math.random()}`.split('.')[1],
    []
  )

  const willResolve = isDefined(onResolve)
  const handleError = isDefined(onError)
  const handlePropsChange = isDefined(onPropsChange)
  const handleOnAbort = isDefined(onAbort)
  const handleMutate = isDefined(onMutate)
  const handleOnline = isDefined(onOnline)
  const handleOffline = isDefined(onOffline)

  const retryOnReconnect =
    optionsConfig.auto === false
      ? false
      : isDefined(optionsConfig.retryOnReconnect)
      ? optionsConfig.retryOnReconnect
      : ctx.retryOnReconnect

  const idString = JSON.stringify(id)

  const [reqQuery, setReqQuery] = useState({
    ...ctx.query,
    ...config.query
  })

  const [configUrl, setConfigUrl] = useState({
    realUrl: '',
    rawUrl: ''
  })

  const [reqParams, setReqParams] = useState({
    ...ctx.params,
    ...config.params
  })

  const rawUrl =
    (hasBaseUrl(url)
      ? ''
      : !isDefined(config.baseUrl)
      ? !isDefined(ctx.baseUrl)
        ? ''
        : ctx.baseUrl
      : config.baseUrl) + url

  const urlWithParams = React.useMemo(
    () => setURLParams(rawUrl, reqParams),
    [JSON.stringify(reqParams), config.baseUrl, ctx.baseUrl, url]
  )

  const resolvedKey = JSON.stringify(
    isDefined(id)
      ? {
          idString
        }
      : {
          uri: rawUrl,
          config: {
            method: config?.method
          }
        }
  )

  const realUrl = urlWithParams + (urlWithParams.includes('?') ? `` : '?')

  if (!isDefined(previousProps[resolvedKey])) {
    if (url !== '') {
      previousProps[resolvedKey] = optionsConfig
    }
  }

  useEffect(() => {
    if (url !== '') {
      setReqParams(() => {
        const newParams = {
          ...ctx.params,
          ...config.params
        }
        return newParams
      })
    }
  }, [JSON.stringify({ ...ctx.params, ...config.params }), resolvedKey])

  const stringDeps = JSON.stringify(
    // We ignore children and resolver
    Object.assign(
      ctx,
      { children: undefined },
      config?.headers,
      config?.method,
      config?.body,
      config?.query,
      config?.params,
      { resolver: undefined },
      { reqQuery },
      { reqParams }
    )
  )

  const [resKey, qp] = realUrl.split('?')

  // This helps pass default values to other useFetcher calls using the same id
  useEffect(() => {
    if (isDefined(optionsConfig.default)) {
      if (!isDefined(fetcherDefaults[resolvedKey])) {
        if (url !== '') {
          if (!isDefined(cache.get(resolvedKey))) {
            fetcherDefaults[resolvedKey] = optionsConfig.default
          }
        } else {
          if (!isDefined(cache.get(resolvedKey))) {
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              data: optionsConfig.default
            })
          }
        }
      }
    } else {
      if (isDefined(fetcherDefaults[resolvedKey])) {
        if (!isDefined(cache.get(resolvedKey))) {
          setData(fetcherDefaults[resolvedKey])
        }
      }
    }
  }, [resolvedKey])

  const def =
    resolvedKey in fetcherDefaults
      ? fetcherDefaults[resolvedKey]
      : optionsConfig.default

  useEffect(() => {
    if (!auto) {
      runningRequests[resolvedKey] = false
    }
  }, [])

  useEffect(() => {
    let queryParamsFromString: any = {}
    try {
      // getting query params from passed url
      const queryParts = qp.split('&')
      queryParts.forEach((q, i) => {
        const [key, value] = q.split('=')
        if (queryParamsFromString[key] !== value) {
          queryParamsFromString[key] = `${value}`
        }
      })
    } finally {
      if (url !== '') {
        setReqQuery(() => {
          const newQuery = {
            ...ctx.query,
            ...queryParamsFromString,
            ...config.query
          }
          return newQuery
        })
      }
    }
  }, [
    resolvedKey,
    requestCallId,
    JSON.stringify({
      qp,
      ...ctx.query,
      ...config.query
    })
  ])

  const requestCache = cache.get(resolvedKey)

  const initialDataValue = isDefined(valuesMemory[resolvedKey])
    ? valuesMemory[resolvedKey]
    : isDefined(cache.get(resolvedKey))
    ? cache.get(resolvedKey)
    : def

  const [data, setData] = useState<FetchDataType | undefined>(
    memory ? initialDataValue : def
  )

  // Used JSON as deppendency instead of directly using a reference to data
  const rawJSON = JSON.stringify(data)

  const [online, setOnline] = useState(true)

  const [requestHeaders, setRequestHeades] = useState<
    object | Headers | undefined
  >({ ...ctx.headers, ...config.headers })

  const [response, setResponse] = useState<CustomResponse<FetchDataType>>()

  const [statusCode, setStatusCode] = useState<number>()
  const [error, setError] = useState<any>(hasErrors[resolvedKey])
  const [loading, setLoading] = useState(
    revalidateOnMount
      ? true
      : previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)
  )
  const [completedAttempts, setCompletedAttempts] = useState(0)
  const [requestAbortController, setRequestAbortController] =
    useState<AbortController>(new AbortController())

  const [reqMethod, setReqMethod] = useState(config.method)

  useEffect(() => {
    if (url !== '') {
      setReqMethod(config.method)
      requestEmitter.emit(resolvedKey, {
        requestCallId,
        method: config.method
      })
    }
  }, [stringDeps, response, requestAbortController, requestCallId])

  useEffect(() => {
    if (url !== '') {
      if (error) {
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          error: error
        })
      }
    }
  }, [url, error, resolvedKey, requestCallId])

  const isGqlRequest = isDefined((optionsConfig as any)['__gql'])

  const fetchData = React.useCallback(
    async function fetchData(
      c: { headers?: any; body?: BodyType; query?: any; params?: any } = {}
    ) {
      requestEmitter.emit(resolvedKey, {
        config: c
      })

      const rawUrl =
        (hasBaseUrl(url)
          ? ''
          : !isDefined(config.baseUrl)
          ? !isDefined(ctx.baseUrl)
            ? ''
            : ctx.baseUrl
          : config.baseUrl) + url

      const urlWithParams = setURLParams(rawUrl, c.params)

      const realUrl =
        urlWithParams +
        (urlWithParams.includes('?') ? (c?.query !== '' ? `&` : '') : '?')

      const [resKey] = realUrl.split('?')

      if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
        queue(() => {
          setReqMethod(config.method)
          if (url !== '') {
            setConfigUrl({
              rawUrl,
              realUrl
            })
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              realUrl: resKey,
              rawUrl
            })
          }
        })
        if (!runningRequests[resolvedKey]) {
          runningRequests[resolvedKey] = true
          setLoading(true)
          previousConfig[resolvedKey] = JSON.stringify(optionsConfig)
          let newAbortController = new AbortController()
          setRequestAbortController(newAbortController)
          setError(null)
          hasErrors[resolvedKey] = null
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            loading,
            requestAbortController: newAbortController,
            error: null
          })
          abortControllers[resolvedKey] = newAbortController
          try {
            const json = await fetch(realUrl + c.query, {
              signal: newAbortController.signal,
              method: config.method,
              headers: {
                'Content-Type':
                  // If body is form-data, set Content-Type header to 'multipart/form-data'
                  isFormData(config.body)
                    ? 'multipart/form-data'
                    : 'application/json',
                ...ctx.headers,
                ...config.headers,
                ...c.headers
              } as Headers,
              body: config.method?.match(/(POST|PUT|DELETE|PATCH)/)
                ? isFunction(config.formatBody)
                  ? (config.formatBody as any)(
                      (isFormData(config.body)
                        ? (config.body as BodyType)
                        : { ...config.body, ...c.body }) as BodyType
                    )
                  : config.formatBody === false || isFormData(config.body)
                  ? config.body
                  : JSON.stringify({ ...config.body, ...c.body })
                : undefined
            })
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              response: json
            })
            const code = json.status
            setStatusCode(code)
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              code
            })
            const _data = await (resolver as any)(json)
            if (code >= 200 && code < 400) {
              let __data = isGqlRequest
                ? {
                    ..._data,
                    variables: (optionsConfig as any)?.variables,
                    errors: _data?.errors ? _data.errors : undefined
                  }
                : _data

              if (_data?.errors && isGqlRequest) {
                setError(true)
              }
              if (memory) {
                cache.set(resolvedKey, __data)
                valuesMemory[resolvedKey] = __data
              }

              requestEmitter.emit(resolvedKey, {
                requestCallId,
                data: __data,
                isResolved: true,
                loading: false,
                error: _data?.errors && isGqlRequest ? true : null,
                variables: isGqlRequest
                  ? (optionsConfig as any)?.variables || {}
                  : undefined,
                completedAttempts: 0
              })
              setData(__data)
              cacheForMutation[idString] = __data

              if (!_data?.errors && isGqlRequest) {
                setError(null)
                hasErrors[resolvedKey] = null
              }
              setLoading(false)
              if (willResolve) {
                ;(onResolve as any)(__data, json)
              }
              runningRequests[resolvedKey] = false
              // If a request completes succesfuly, we reset the error attempts to 0
              setCompletedAttempts(0)
              queue(() => {
                cacheForMutation[resolvedKey] = __data
              })
            } else {
              if (_data.errors && isGqlRequest) {
                setData(previous => {
                  const newData = {
                    ...previous,
                    variables: (optionsConfig as any)?.variables,
                    errors: _data.errors
                  } as any
                  cacheForMutation[idString] = newData
                  requestEmitter.emit(resolvedKey, {
                    requestCallId,
                    data: newData
                  })
                  if (handleError) {
                    ;(onError as any)(newData.errors, json)
                  }
                  cache.set(resolvedKey, newData)
                  return newData
                })
              } else {
                if (def) {
                  setData(def)
                  cacheForMutation[idString] = def
                  requestEmitter.emit(resolvedKey, {
                    requestCallId,
                    data: def
                  })
                  if (handleError) {
                    ;(onError as any)(_data, json)
                  }
                }
              }
              setError(true)
              hasErrors[resolvedKey] = true
              runningRequests[resolvedKey] = false
            }
          } catch (err) {
            const errorString = err?.toString()
            // Only set error if no abort
            if (!`${errorString}`.match(/abort/i)) {
              let _error = new Error(err as any)
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                error: _error
              })
              if (!isDefined(cache.get(resolvedKey))) {
                setData(def)
                cacheForMutation[idString] = def
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: def
                })
              } else {
                setData(requestCache)
                cacheForMutation[idString] = requestCache
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: requestCache
                })
              }
              setError(_error)
              hasErrors[resolvedKey] = true
              if (handleError) {
                ;(onError as any)(err as any)
              }
            } else {
              if (!isDefined(cache.get(resolvedKey))) {
                if (isDefined(def)) {
                  setData(def)
                  cacheForMutation[idString] = def
                }
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: def
                })
              }
            }
          } finally {
            setLoading(false)
            runningRequests[resolvedKey] = false
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              loading: false
            })
          }
        }
      }
    },
    [
      auto,
      ctx.auto,
      stringDeps,
      resolvedKey,
      config.method,
      JSON.stringify(optionsConfig),
      realUrl,
      requestCallId,
      memory,
      def
    ]
  )

  useEffect(() => {
    const { signal } = requestAbortController || {}
    // Run onAbort callback
    const abortCallback = () => {
      if (loading) {
        if (runningRequests[resolvedKey]) {
          if (handleOnAbort) {
            ;(onAbort as any)()
          }
        }
      }
    }
    signal?.addEventListener('abort', abortCallback)
    return () => {
      signal?.removeEventListener('abort', abortCallback)
    }
  }, [requestAbortController, resolvedKey, onAbort, loading])

  const imperativeFetcher = React.useMemo(() => {
    const __headers = {
      ...ctx.headers,
      ...config.headers
    }

    const __params = {
      ...ctx.params,
      ...config.params
    }

    const __baseUrl = isDefined(config.baseUrl) ? config.baseUrl : ctx.baseUrl
    return createImperativeFetcher({
      ...ctx,
      headers: __headers,
      baseUrl: __baseUrl,
      params: __params
    })
  }, [JSON.stringify(ctx)])

  if (willResolve) {
    if (resolvedHookCalls[resolvedKey]) {
      if (isDefined(cache.get(resolvedKey))) {
        ;(onResolve as any)(cache.get(resolvedKey) as any, response)
        queue(() => {
          delete resolvedHookCalls[resolvedKey]
        })
      }
    }
  }

  useEffect(() => {
    async function waitFormUpdates(v: any) {
      if (v.requestCallId !== requestCallId) {
        const {
          isMutating,
          data: $data,
          error: $error,
          isResolved,
          online,
          loading,
          response,
          requestAbortController,
          code,
          config,
          rawUrl,
          realUrl,
          method,
          completedAttempts
        } = v

        if (isDefined(isResolved)) {
          resolvedHookCalls[resolvedKey] = true
        }
        if (isDefined(method)) {
          queue(() => {
            setReqMethod(method)
          })
        }
        if (isDefined(config?.query)) {
          queue(() => {
            setReqQuery(config.query)
          })
        }
        if (isDefined(rawUrl) && isDefined(realUrl)) {
          queue(() => {
            setConfigUrl({
              rawUrl,
              realUrl
            })
          })
        }
        if (isDefined(config?.params)) {
          queue(() => {
            setReqParams(config?.params)
          })
        }
        if (isDefined(config?.headers)) {
          queue(() => {
            setRequestHeades(config?.headers)
          })
        }
        if (isDefined(completedAttempts)) {
          queue(() => {
            setCompletedAttempts(completedAttempts)
          })
        }
        if (isDefined(code)) {
          queue(() => {
            setStatusCode(code)
          })
        }
        if (isDefined(requestAbortController)) {
          queue(() => {
            setRequestAbortController(requestAbortController)
          })
        }
        if (isDefined(response)) {
          queue(() => {
            setResponse(response)
          })
        }
        if (isDefined(loading)) {
          queue(() => {
            setLoading(loading)
          })
        }
        if (isDefined($data)) {
          queue(() => {
            if (
              JSON.stringify(data) !== JSON.stringify(cache.get(resolvedKey))
            ) {
              setData($data)
            }
            if (
              JSON.stringify($data) !==
              JSON.stringify(cacheForMutation[resolvedKey])
            ) {
              cacheForMutation[idString] = data
              if (isMutating) {
                if (handleMutate) {
                  ;(onMutate as any)($data, imperativeFetcher)
                }
              }
            }
          })
        }
        if (isDefined($error)) {
          queue(() => {
            setError($error)
            if ($error !== null) {
              hasErrors[resolvedKey] = true
              if (handleError) {
                ;(onError as any)($error)
              }
            }
          })
        }
        if (isDefined(online)) {
          queue(() => {
            setOnline(online)
          })
        }
      }
    }

    requestEmitter.addListener(resolvedKey, waitFormUpdates)

    return () => {
      requestEmitter.removeListener(resolvedKey, waitFormUpdates)
    }
  }, [
    resolvedKey,
    data,
    imperativeFetcher,
    reqMethod,
    id,
    error,
    requestCallId,
    stringDeps,
    onResolve
  ])

  const reValidate = React.useCallback(
    async function reValidate() {
      // Only revalidate if request was already completed
      if (!loading) {
        if (!runningRequests[resolvedKey]) {
          previousConfig[resolvedKey] = undefined
          setLoading(true)
          const reqQ = {
            ...ctx.query,
            ...config.query
          }
          const reqP = {
            ...ctx.params,
            ...config.params
          }
          if (url !== '') {
            fetchData({
              query: Object.keys(reqQ)
                .map(q => [q, reqQ[q]].join('='))
                .join('&'),
              params: reqP
            })
          }
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            loading: true
          })
        }
      }
    },
    [
      requestCallId,
      stringDeps,
      cancelOnChange,
      url,
      requestAbortController,
      loading,
      auto,
      ctx.auto
    ]
  )

  useEffect(() => {
    async function forceRefresh(v: any) {
      if (isDefined(v?.data)) {
        try {
          const { data: d } = v
          if (isDefined(data)) {
            setData(d)
            cacheForMutation[idString] = d
            cache.set(resolvedKey, d)
            valuesMemory[resolvedKey] = d
          }
        } catch (err) {}
      } else {
        setLoading(true)
        setError(null)
        hasErrors[resolvedKey] = null
        if (!runningRequests[resolvedKey]) {
          // We are preventing revalidation where we only need updates about
          // 'loading', 'error' and 'data' because the url can be ommited.
          if (url !== '') {
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              loading: true,
              error: null
            })
            const reqQ = {
              ...ctx.query,
              ...config.query
            }
            const reqP = {
              ...ctx.params,
              ...config.params
            }
            fetchData({
              query: Object.keys(reqQ)
                .map(q => [q, reqQ[q]].join('='))
                .join('&'),
              params: reqP
            })
          }
        }
      }
    }
    let idString = JSON.stringify(id)
    requestEmitter.addListener(idString, forceRefresh)
    return () => {
      requestEmitter.removeListener(idString, forceRefresh)
    }
  }, [resolvedKey, requestCallId, stringDeps, auto, ctx.auto, idString, id])

  useEffect(() => {
    function backOnline() {
      let willCancel = false
      function cancelReconectionAttempt() {
        willCancel = true
      }
      requestEmitter.emit(resolvedKey, {
        requestCallId,
        online: true
      })
      setOnline(true)
      if (handleOnline) {
        ;(onOnline as any)({ cancel: cancelReconectionAttempt })
      }
      if (!willCancel) {
        reValidate()
      }
    }

    function addOnlineListener() {
      if (windowExists) {
        if ('addEventListener' in window) {
          if (retryOnReconnect) {
            window.addEventListener('online', backOnline)
          }
        }
      }
    }

    addOnlineListener()

    return () => {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.removeEventListener('online', backOnline)
        }
      }
    }
  }, [onOnline, reValidate, resolvedKey, retryOnReconnect])

  useEffect(() => {
    function wentOffline() {
      runningRequests[resolvedKey] = false
      setOnline(false)
      requestEmitter.emit(resolvedKey, {
        requestCallId,
        online: false
      })
      if (handleOffline) {
        ;(onOffline as any)()
      }
    }

    function addOfflineListener() {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.addEventListener('offline', wentOffline)
        }
      }
    }

    addOfflineListener()

    return () => {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.removeEventListener('offline', wentOffline)
        }
      }
    }
  }, [onOffline, reValidate, resolvedKey, retryOnReconnect])

  useEffect(() => {
    const newHeaders = {
      ...ctx.headers,
      ...config.headers
    }
    setRequestHeades(newHeaders)
  }, [JSON.stringify({ ...ctx.headers, ...config.headers }), resolvedKey])

  useEffect(() => {
    if (revalidateOnMount) {
      previousConfig[resolvedKey] = undefined
    }
  }, [requestCallId, resolvedKey, revalidateOnMount])

  useEffect(() => {
    // Attempts will be made after a request fails
    const tm = queue(() => {
      if (error) {
        if (completedAttempts < (attempts as number)) {
          reValidate()
          setCompletedAttempts(previousAttempts => {
            let newAttemptsValue = previousAttempts + 1

            requestEmitter.emit(resolvedKey, {
              requestCallId,
              completedAttempts: newAttemptsValue
            })

            return newAttemptsValue
          })
        } else if (completedAttempts === attempts) {
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            online: false
          })
          setOnline(false)
        }
      }
    }, (attemptInterval as number) * 1000)

    return () => {
      clearTimeout(tm)
    }
  }, [error, attempts, rawJSON, attemptInterval, completedAttempts])

  useEffect(() => {
    if (completedAttempts === 0) {
      if ((refresh as any) > 0 && auto) {
        const tm = queue(reValidate, (refresh as any) * 1000)

        return () => {
          clearTimeout(tm)
        }
      }
    }
    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, loading, error, rawJSON, completedAttempts, config])

  const initMemo = React.useMemo(() => JSON.stringify(optionsConfig), [])

  useEffect(() => {
    if (auto) {
      if (url !== '') {
        if (runningRequests[resolvedKey]) {
          setLoading(true)
        }
        const reqQ = {
          ...ctx.query,
          ...config.query
        }
        const reqP = {
          ...ctx.params,
          ...config.params
        }
        fetchData({
          query: Object.keys(reqQ)
            .map(q => [q, reqQ[q]].join('='))
            .join('&'),
          params: reqP
        })
      }
      // It means a url is not passed
      else {
        setError(hasErrors[resolvedKey])
        setLoading(false)
      }
    } else {
      if (!isDefined(data)) {
        setData(def)
        cacheForMutation[idString] = def
      }
      setError(null)
      hasErrors[resolvedKey] = null
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requestCallId,
    initMemo,
    url,
    stringDeps,
    refresh,
    JSON.stringify(config),
    auto,
    ctx.auto
  ])

  useEffect(() => {
    function addFocusListener() {
      if (revalidateOnFocus && windowExists) {
        if ('addEventListener' in window) {
          window.addEventListener('focus', reValidate as any)
        }
      }
    }

    addFocusListener()

    return () => {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.removeEventListener('focus', reValidate as any)
        }
      }
    }
  }, [
    requestCallId,
    url,
    revalidateOnFocus,
    stringDeps,
    loading,
    reValidate,
    // ctx.children,
    refresh,
    JSON.stringify(config)
  ])

  const __config = {
    ...config,
    method: reqMethod,
    params: reqParams,
    headers: requestHeaders,
    body: config.body,
    baseUrl: ctx.baseUrl || config.baseUrl,
    url: configUrl?.realUrl,
    rawUrl: configUrl?.rawUrl,
    query: reqQuery
  }

  function forceMutate(
    newValue: FetchDataType | ((prev: FetchDataType) => FetchDataType),
    callback: (
      data: FetchDataType,
      fetcher: ImperativeFetcher
    ) => void = () => {}
  ) {
    if (!isFunction(newValue)) {
      if (JSON.stringify(cache.get(resolvedKey)) !== JSON.stringify(newValue)) {
        if (handleMutate) {
          ;(onMutate as any)(newValue, imperativeFetcher)
        }
        callback(newValue as any, imperativeFetcher)
        cache.set(resolvedKey, newValue)
        valuesMemory[resolvedKey] = newValue
        cacheForMutation[idString] = newValue
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          isMutating: true,
          data: newValue
        })
        setData(newValue as any)
      }
    } else {
      let newVal = (newValue as any)(data)
      if (JSON.stringify(cache.get(resolvedKey)) !== JSON.stringify(newVal)) {
        if (handleMutate) {
          ;(onMutate as any)(newVal, imperativeFetcher)
        }
        callback(newVal, imperativeFetcher)
        cache.set(resolvedKey, newVal)
        valuesMemory[resolvedKey] = newVal
        cacheForMutation[idString] = newVal
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          isMutating: true,
          data: newVal
        })

        setData(newVal)
      }
    }
  }

  useEffect(() => {
    const rev = {
      revalidate: () => queue(() => revalidate(id)),
      cancel: () => {
        try {
          if (url !== '') {
            if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
              requestAbortController?.abort()
            }
          }
        } catch (err) {}
      },
      fetcher: imperativeFetcher,
      props: optionsConfig,
      previousProps: previousProps[resolvedKey]
    }

    if (
      JSON.stringify(previousProps[resolvedKey]) !==
      JSON.stringify(optionsConfig)
    ) {
      if (handlePropsChange) {
        ;(onPropsChange as any)(rev as any)
      }
      if (url !== '') {
        previousProps[resolvedKey] = optionsConfig
      }
      if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
        if (cancelOnChange) {
          requestAbortController?.abort()
        }
      }
    }
  }, [
    url,
    cancelOnChange,
    JSON.stringify(id),
    JSON.stringify(optionsConfig),
    resolvedKey
  ])

  const resolvedData = React.useMemo(() => data, [rawJSON])

  return {
    data: resolvedData,
    loading,
    error,
    online,
    code: statusCode,
    reFetch: reValidate,
    mutate: forceMutate,
    fetcher: imperativeFetcher,
    abort: () => {
      abortControllers[resolvedKey]?.abort()
      if (loading) {
        setError(null)
        hasErrors[resolvedKey] = null
        setLoading(false)
        setData(requestCache)
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          error: false,
          loading: false,
          data: requestCache
        })
      }
    },
    config: __config,
    response,
    id,
    /**
     * The request key
     */
    key: resolvedKey
  } as unknown as {
    data: FetchDataType
    loading: boolean
    error: Error | null
    online: boolean
    code: number
    reFetch: () => Promise<void>
    mutate: (
      update: FetchDataType | ((prev: FetchDataType) => FetchDataType),
      callback?: (data: FetchDataType, fetcher: ImperativeFetcher) => void
    ) => FetchDataType
    fetcher: ImperativeFetcher
    abort: () => void
    config: FetcherConfigType<FetchDataType, BodyType>['config'] & {
      baseUrl: string
      url: string
      rawUrl: string
    }
    response: CustomResponse<FetchDataType>
    id: any
    key: string
  }
}

// Create a method for each request
useFetcher.get = createRequestFn('GET', '', {})
useFetcher.delete = createRequestFn('DELETE', '', {})
useFetcher.head = createRequestFn('HEAD', '', {})
useFetcher.options = createRequestFn('OPTIONS', '', {})
useFetcher.post = createRequestFn('POST', '', {})
useFetcher.put = createRequestFn('PUT', '', {})
useFetcher.patch = createRequestFn('PATCH', '', {})
useFetcher.purge = createRequestFn('PURGE', '', {})
useFetcher.link = createRequestFn('LINK', '', {})
useFetcher.unlink = createRequestFn('UNLINK', '', {})

export { useFetcher }
/**
 * @deprecated Everything with `extend` can be achieved with `useFetch` alone
 *
 *
 * Extend the useFetcher hook
 */
useFetcher.extend = function extendFetcher(props: FetcherContextType = {}) {
  const {
    baseUrl = undefined as any,
    headers = {} as Headers,
    query = {},
    // json by default
    resolver
  } = props

  function useCustomFetcher<T, BodyType = any>(
    init: FetcherConfigType<T, BodyType> | string,
    options?: FetcherConfigTypeNoUrl<T, BodyType>
  ) {
    const ctx = useHRFContext()

    const {
      url = '',
      config = {},
      ...otherProps
    } = typeof init === 'string'
      ? {
          // set url if init is a stringss
          url: init,
          ...options
        }
      : // `url` will be required in init if it is an object
        init

    return useFetcher<T, BodyType>({
      ...otherProps,
      url: `${url}`,
      // If resolver is present is hook call, use that instead
      resolver:
        resolver || otherProps.resolver || ctx.resolver || (d => d.json()),
      config: {
        baseUrl: !isDefined(config.baseUrl)
          ? !isDefined(ctx.baseUrl)
            ? baseUrl
            : ctx.baseUrl
          : config.baseUrl,
        method: config.method,
        headers: {
          ...headers,
          ...ctx.headers,
          ...config.headers
        },
        body: config.body as any
      }
    })
  }
  useCustomFetcher.config = {
    baseUrl,
    headers,
    query
  }

  // Creating methods for fetcher.extend
  useCustomFetcher.get = createRequestFn('GET', baseUrl, headers, query)
  useCustomFetcher.delete = createRequestFn('DELETE', baseUrl, headers, query)
  useCustomFetcher.head = createRequestFn('HEAD', baseUrl, headers, query)
  useCustomFetcher.options = createRequestFn('OPTIONS', baseUrl, headers, query)
  useCustomFetcher.post = createRequestFn('POST', baseUrl, headers, query)
  useCustomFetcher.put = createRequestFn('PUT', baseUrl, headers, query)
  useCustomFetcher.patch = createRequestFn('PATCH', baseUrl, headers, query)
  useCustomFetcher.purge = createRequestFn('PURGE', baseUrl, headers, query)
  useCustomFetcher.link = createRequestFn('LINK', baseUrl, headers, query)
  useCustomFetcher.unlink = createRequestFn('UNLINK', baseUrl, headers, query)

  useCustomFetcher.Config = FetcherConfig

  return useCustomFetcher
}

export const fetcher = useFetcher

// Http client

interface IRequestParam {
  headers?: any
  body?: any
  /**
   * Customize how body is formated for the request. By default it will be sent in JSON format
   * but you can set it to false if for example, you are sending a `FormData`
   * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
   * (the last one is the default behaviour so in that case you can ignore it)
   */
  formatBody?: boolean | ((b: any) => any)
}

export const isFormData = (target: any) => {
  if (typeof FormData !== 'undefined') {
    return target instanceof FormData
  } else return false
}

type requestType = <T>(path: string, data: IRequestParam) => Promise<T>

interface IHttpClient {
  baseUrl: string
  get: requestType
  post: requestType
  put: requestType
  delete: requestType
}

const defaultConfig = { headers: {}, body: undefined }

/**
 * Basic HttpClient
 */
class HttpClient implements IHttpClient {
  baseUrl = ''
  async get<T>(
    path: string,
    { headers, body }: IRequestParam = defaultConfig,
    method: string = 'GET'
  ): Promise<T> {
    const requestUrl = `${this.baseUrl}${path}`
    const responseBody = await fetch(requestUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    })
    const responseData: T = await responseBody.json()
    return responseData
  }
  async post<T>(
    path: string,
    props: IRequestParam = defaultConfig
  ): Promise<T> {
    return await this.get(path, props, 'POST')
  }
  async put<T>(path: string, props: IRequestParam = defaultConfig): Promise<T> {
    return await this.get(path, props, 'PUT')
  }

  async delete<T>(
    path: string,
    props: IRequestParam = defaultConfig
  ): Promise<T> {
    return await this.get(path, props, 'DELETE')
  }

  constructor(url: string) {
    this.baseUrl = url
  }
}

/**
 * @deprecated - Use the fetcher instead
 *
 * Basic HttpClient
 */
export function createHttpClient(url: string) {
  return new HttpClient(url)
}
