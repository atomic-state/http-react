'use client'
import { useCallback, useEffect, useMemo } from 'react'

import {
  FetchConfigType,
  FetchConfigTypeNoUrl,
  FetchContextType,
  FetchInit,
  ImperativeFetch,
  TimeSpan
} from '../types'

import {
  defaultCache,
  fetcherDefaults,
  hasErrors,
  isPending,
  lastResponses,
  requestsProvider,
  useHRFContext
} from '../internal'

import { useFetch } from './use-fetch'

import { createImperativeFetch, getMiliseconds, revalidate } from '../utils'

import { isDefined, isFunction, serialize } from '../utils/shared'

import { DEFAULT_GRAPHQL_PATH } from '../internal/constants'

/**
 * Get the current fetcher config
 */
export function useFetchConfig(id?: unknown) {
  const ftxcf = useHRFContext()

  const { config } = useFetch({ id })

  const thisConfig = isDefined(id) ? config : ftxcf

  return thisConfig as FetchInit & FetchContextType
}

export function useFetchSuspense<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  let o =
    typeof init === 'string'
      ? {
          url: init,
          ...options
        }
      : options

  return useFetch({
    ...o,
    suspense: true
  })
}

/**
 * Get the data state of a request using its id
 */
export function useFetchData<ResponseType = any, VT = any>(
  id: ResponseType extends {
    value: ResponseType
    variables: VT
    errors?: any[]
  }
    ? {
        value: ResponseType
        variables: VT
        errors?: any[]
      }
    : string | number | object,
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
      : ResponseType,

    res: Response
  ) => void
) {
  const { cacheProvider = defaultCache } = useHRFContext()

  const defaultsKey = serialize({
    idString: serialize(id)
  })

  const def = cacheProvider.get(defaultsKey)

  const { data } = useFetch<typeof id>({
    default: def,
    id: id,
    onResolve: onResolve as any
  })

  return data as ResponseType
}

export function useFetchCode(id: any) {
  const { code } = useFetch({
    id: id
  })

  return code
}

/**
 * Get the loading state of a request using its id
 */
export function useFetchLoading(id: any): boolean {
  const { loading, ...all } = useFetch({
    id
  })
  return (
    loading &&
    isPending(
      serialize({
        idString: serialize(id)
      })
    )
  )
}

/**
 * Get the error state of a request using its id
 */
export function useFetchError(id: any, onError?: (err?: any) => void) {
  const resolvedKey = serialize({
    idString: serialize(id)
  })

  useEffect(() => {
    function listenToErrorEvent(e: any) {
      if (e?.error) {
        if (isFunction(onError)) {
          ;(onError as any)(e?.error)
        }
      }
    }

    requestsProvider.addListener(resolvedKey, listenToErrorEvent)

    return () => {
      requestsProvider.removeListener(resolvedKey, listenToErrorEvent)
    }
  }, [resolvedKey])

  return (
    useFetch({
      id: id
    }).error || hasErrors.get(resolvedKey)
  )
}

/**
 * Get the mutate the request data using its id
 */
export function useFetchMutate<T = any>(
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
     * An imperative version of `useFetch`
     */
    fetcher: ImperativeFetch
  ) => void
) {
  const { mutate } = useFetch({
    id: id,
    onMutate
  })

  return mutate
}

export function useOnline(id: any) {
  return useFetch({ id }).online
}

export function useLoadingFirst(id: any) {
  return useFetch({ id }).loadingFirst
}

export function useReFetch(id: any) {
  return useFetch({ id }).reFetch
}

export function useRevalidating(id: any) {
  return useFetch({ id }).revalidating
}

export function useExpiration(id: any) {
  return useFetch({ id }).expiration
}

export function useHasData(id: any) {
  return useFetch({ id }).hasData
}

export function useSuccess(id: any) {
  return useFetch({ id }).success
}

/**
 * Get everything from a `useFetch` call using its id
 */
export function useFetchId<ResponseType = any, BodyType = any>(id: any) {
  const defaultsKey = serialize({
    idString: serialize(id)
  })
  const def = fetcherDefaults.get(defaultsKey)

  return useFetch<ResponseType, BodyType>({
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
      : ResponseType,
    res: Response
  ) => void
) {
  const defaultsKey = serialize({
    idString: serialize(id)
  })

  useEffect(() => {
    async function resolve(v: any) {
      const { isResolved, data } = v
      if (isResolved) {
        if (isFunction(onResolve)) {
          onResolve(data, lastResponses.get(defaultsKey))
        }
      }
    }
    requestsProvider.addListener(defaultsKey, resolve)
    return () => {
      requestsProvider.removeListener(defaultsKey, resolve)
    }
  }, [defaultsKey, onResolve])

  return useFetch({ id })?.data
}

/**
 * User a `GET` request
 */
export function useGET<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'GET'
  })
}

/**
 * Use a `DELETE` request
 */
export function useDELETE<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'DELETE'
  })
}

/**
 * Use a `HEAD` request
 */
export function useHEAD<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'HEAD'
  })
}

/**
 * Use an `OPTIONS` request
 */
export function useOPTIONS<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,

    method: 'OPTIONS'
  })
}

/**
 * Use a `POST` request
 */
export function usePOST<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'POST'
  })
}

/**
 * Use a `PUT` request
 */
export function usePUT<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'PUT'
  })
}

/**
 * Use a `PATCH` request
 */
export function usePATCH<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'PATCH'
  })
}

/**
 * Use a `PURGE` request
 */
export function usePURGE<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'PURGE'
  })
}

/**
 * Use a `LINK` request
 */
export function useLINK<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'LINK'
  })
}

/**
 * Use an `UNLINK` request
 */
export function useUNLINK<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    method: 'UNLINK'
  })
}

/**
 * Use a request without making it automatically
 */
export function useManualFetch<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  return useFetch(init, {
    ...options,
    auto: false
  })
}

/**
 * Get a blob of the response. You can pass an `objectURL` property that will convet that blob into a string using `URL.createObjectURL`
 */
export function useFetchBlob<FetchDataType = string, BodyType = any>(
  init:
    | (FetchConfigType<FetchDataType, BodyType> & { objectURL?: boolean })
    | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType> & {
    objectURL?: boolean
  }
) {
  return useFetch<FetchDataType, BodyType>(init, {
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
export function useFetchText<FetchDataType = string, BodyType = any>(
  init: FetchConfigType<string, BodyType> | string,
  options?: FetchConfigTypeNoUrl<string, BodyType>
) {
  return useFetch<string, BodyType>(init, {
    ...options,
    async resolver(res) {
      const text = await res.text()
      return text
    }
  })
}

export function useFetchResponseTime(id: any) {
  return useFetch({
    id
  }).responseTime
}

/**
 * Get the `Date` the request started
 */
export function useRequestStart(id: any) {
  return useFetch({
    id
  }).requestStart
}

/**
 * Get the `Date` the request finished
 */
export function useRequestEnd(id: any) {
  return useFetch({
    id
  }).requestEnd
}

/**
 * Debounce a fetch by the time given
 */
export function useDebounceFetch<FetchDataType = any, BodyType = any>(
  init:
    | (Omit<FetchConfigType<FetchDataType, BodyType>, 'debounce'> & {
        debounce?: TimeSpan
      })
    | string
    | Request,
  options?: Omit<FetchConfigTypeNoUrl<FetchDataType, BodyType>, 'debounce'> & {
    debounce?: TimeSpan
  }
) {
  // @ts-ignore - auto can be present in the first arg
  const canDebounce = init?.auto ?? options?.auto ?? true

  const res = useFetch<FetchDataType, BodyType>(init, {
    ...options,
    auto: false
  })

  // @ts-ignore - debounce can be present in the first arg
  const debounce = getMiliseconds(init?.debounce || options?.debounce || '0 ms')

  useEffect(() => {
    let debounceTimeout: any = null
    if (canDebounce) {
      debounceTimeout = setTimeout(res.reFetch, debounce)
    }
    return () => {
      clearTimeout(debounceTimeout)
    }
  }, [serialize({ init, options }), canDebounce])

  return res
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
  cfg: FetchConfigTypeNoUrl<T, any> & {
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

  const {
    variables = {},
    graphqlPath = DEFAULT_GRAPHQL_PATH,
    ...otherArgs
  } = cfg

  const config = otherArgs

  const JSONBody = serialize({
    query,
    variables
  })

  const usingProvider = isDefined((cfg as any)['__fromProvider'])

  const g = useFetch({
    ...config,
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
    params: {
      // Caching versions of different variables values
      variables
    },
    formatBody: () => JSONBody,
    body: JSONBody,
    method: 'POST',
    url: graphqlPath
  })
  return g as Omit<typeof g, 'data'> & {
    data: {
      data: T
      errors: any[]
      variables: VT
    }
  }
}

/**
 * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
 */
export function useImperative() {
  const ctx = useFetchConfig()

  const imperativeFetch = useMemo(
    () => createImperativeFetch(ctx as any),
    [serialize(ctx)]
  )

  return imperativeFetch
}

/**
 * This code is related to using server actions with http-react.
 *
 * Mock ids are necessary because server actions are proxied and reading their Function's `name`
 * in client side code always returns `proxy`, which could cause conflicts between useFetch calls.
 *
 * An `id` can also be passed in config (the second argument of `useServerAction`)
 */

/**
 * ServerActionIds
 */
const serverActionIds = new WeakMap()

/**
 * Uses the action proxy as the weakmap key
 */
function getMockServerActionId(action: any) {
  let mockServerActionId = serverActionIds.get(action)

  if (!mockServerActionId) {
    let mockServerActionId = `${Math.random()}`.split('.')[1]
    try {
      mockServerActionId = crypto.randomUUID()
    } catch {}

    serverActionIds.set(action, mockServerActionId)
  }

  return mockServerActionId
}

/**
 * Uses a server action as fetcher. It provides complete TypeScript support.
 *
 *
 * @param action The Server action. It must, at least, return a `data` property which will help with type inference. It can also return a `status` code. @example {
 *    data: 'Some data',
 *    status: 200
 *  }
 * @param config The request config. Use it to pass the server action argument in the `params` property. For now, only passing a single argument is supported.
 * You can pass other things like `onResolve`, `onError`, etc.
 *
 * @example { params: { userId: 32 }, onResolve(data){ console.log("Data is", data)  } }
 */

const actionForms = new Map()

export function useServerAction<T extends (args: any) => any>(
  action: T,
  config?: Omit<
    FetchConfigTypeNoUrl<Awaited<ReturnType<T>>['data']>,
    'params'
  > &
    (Parameters<T>[0] extends typeof undefined
      ? {}
      : Parameters<T>[0] extends FormData
      ? {
          params?: FormData
        }
      : {
          params: Parameters<T>[0]
        })
) {
  let mockServerActionId = config?.id ?? getMockServerActionId(action)

  useResolve(mockServerActionId, () => {
    actionForms.delete(mockServerActionId)
  })

  const submit = useCallback(
    (form: FormData) => {
      actionForms.set(mockServerActionId, form)
      revalidate(mockServerActionId)
    },
    [action, config, mockServerActionId]
  )

  const $action = useFetch(action.name, {
    fetcher: async function proxied(_, config) {
      const actionParam = actionForms.get(mockServerActionId) ?? config?.params

      const actionResult = await action(actionParam)
      /**
       * Default status code is 200 if no status is returned from the server action.
       */
      const { data, error, status = 200 } = actionResult

      return { data, error, status }
    },
    id: mockServerActionId,
    ...config
  })

  // @ts-expect-error - Adding the submit method
  $action.submit = submit

  return $action as typeof $action & {
    submit: (form: FormData) => void
  }
}

/**
 * `useServerMutation` works exactly like `useServerAction` except it is not automatic
 */

export function useServerMutation<T extends (args: any) => any>(
  action: T,
  config?: Omit<
    FetchConfigTypeNoUrl<Awaited<ReturnType<T>>['data']>,
    'params'
  > &
    (Parameters<T>[0] extends typeof undefined
      ? {}
      : Parameters<T>[0] extends FormData
      ? {
          params?: FormData
        }
      : {
          params: Parameters<T>[0]
        })
) {
  // @ts-expect-error
  return useServerAction(action, {
    ...config,
    auto: false
  })
}
