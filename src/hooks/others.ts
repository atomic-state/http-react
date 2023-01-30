'use client'
import * as React from 'react'
import { useEffect } from 'react'

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
  requestResponseTimes,
  requestsProvider,
  runningRequests,
  useHRFContext
} from '../internal'

import { useFetch } from './use-fetch'

import { createImperativeFetch, getMiliseconds } from '../utils'

import { isDefined, isFunction, serialize } from '../utils/shared'

import {
  ALLOWED_CONTEXT_KEYS,
  DEFAULT_GRAPHQL_PATH
} from '../internal/constants'

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
  const idString = serialize({ idString: serialize(id) })

  const { data } = useFetch({
    id: id
  })

  return !isDefined(runningRequests[idString]) ? true : isPending(idString)
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

  const { error } = useFetch({
    id: id
  })

  return error
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
  const def = fetcherDefaults[defaultsKey]

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
          onResolve(data, lastResponses[defaultsKey])
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

  const imperativeFetch = React.useMemo(
    () => createImperativeFetch(ctx as any),
    [serialize(ctx)]
  )

  return imperativeFetch
}
