import React, { useEffect } from 'react'

import {
  FetcherConfigType,
  FetcherConfigTypeNoUrl,
  ImperativeFetcher
} from '../types'

import {
  defaultCache,
  DEFAULT_GRAPHQL_PATH,
  fetcherDefaults,
  requestEmitter,
  runningRequests,
  useHRFContext
} from '../internal'

import { useFetcher } from './use-fetcher'

import {
  createImperativeFetcher,
  isDefined,
  isFunction,
  serialize
} from '../utils'

/**
 * Get the current fetcher config
 */
export function useFetcherConfig(id?: string): any {
  const ftxcf = useHRFContext()

  const { config } = useFetcher({ id })

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
      : ResponseType
  ) => void
) {
  const { cache = defaultCache } = useHRFContext()

  const defaultsKey = serialize({
    idString: serialize(id)
  })

  const def = cache.get(defaultsKey)

  const { data } = useFetcher<typeof id>({
    default: def,
    id: id
  })

  useResolve(id as any, onResolve as any)

  return data as ResponseType
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
  const idString = serialize({ idString: serialize(id) })

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
  const defaultsKey = serialize({
    idString: serialize(id)
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
  const defaultsKey = serialize({
    idString: serialize(id)
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
export function useGET<FetchDataType = any, BodyType = any>(
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
export function useDELETE<FetchDataType = any, BodyType = any>(
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
export function useHEAD<FetchDataType = any, BodyType = any>(
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
export function useOPTIONS<FetchDataType = any, BodyType = any>(
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
export function usePOST<FetchDataType = any, BodyType = any>(
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
export function usePUT<FetchDataType = any, BodyType = any>(
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
export function usePATCH<FetchDataType = any, BodyType = any>(
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
export function usePURGE<FetchDataType = any, BodyType = any>(
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
export function useLINK<FetchDataType = any, BodyType = any>(
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
export function useUNLINK<FetchDataType = any, BodyType = any>(
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

  const {
    variables = {},
    graphqlPath = DEFAULT_GRAPHQL_PATH,
    ...otherArgs
  } = cfg

  const { config = {} } = otherArgs

  const JSONBody = serialize({
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

/**
 * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
 */
export function useImperative() {
  const ctx = useFetcherConfig()

  const imperativeFetcher = React.useMemo(
    () => createImperativeFetcher(ctx),
    [serialize(ctx)]
  )

  return imperativeFetcher
}
