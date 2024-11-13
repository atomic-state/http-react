'use client'
import { useLayoutEffect, useEffect, useMemo } from 'react'
import { useGql } from '../hooks/others'
import { useFetch } from '../hooks/use-fetch'

import {
  abortControllers,
  cacheForMutation,
  isPending,
  previousConfig,
  requestInitialTimes,
  requestsProvider,
  runningMutate,
  valuesMemory
} from '../internal'

import { UNITS_MILISECONDS_EQUIVALENTS } from '../internal/constants'

import {
  CacheStoreType,
  FetchContextType,
  ImperativeFetch,
  FetchInit,
  TimeSpan
} from '../types'
import {
  gql,
  hasBaseUrl,
  isDefined,
  isFunction,
  queue,
  serialize,
  windowExists
} from './shared'

export function getMiliseconds(v: TimeSpan): number {
  if (typeof v === 'number') return v

  const [amount, unit] = (v as string).split(' ')

  const amountNumber = parseFloat(amount)

  if (!(unit in UNITS_MILISECONDS_EQUIVALENTS)) {
    return amountNumber
  }
  // @ts-ignore - This should return the value in miliseconds
  return amountNumber * UNITS_MILISECONDS_EQUIVALENTS[unit]
}

export function getTimePassed(key: any) {
  return (
    Date.now() -
    (isDefined(requestInitialTimes.get(key)) ? requestInitialTimes.get(key) : 0)
  )
}

export const createImperativeFetch = (ctx: FetchContextType) => {
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

  return {
    ...Object.fromEntries(
      new Map(
        keys.map(k => [
          k.toLowerCase(),
          (url, config = {}) =>
            (useFetch as any)[k.toLowerCase()](
              hasBaseUrl(url) ? url : baseUrl + url,
              {
                ...ctx,
                ...config
              }
            )
        ])
      )
    ),
    config: ctx
  } as ImperativeFetch
}

export const useIsomorphicLayoutEffect = windowExists
  ? useLayoutEffect
  : useEffect

/**
 * Revalidate requests that match an id or ids
 */
export function revalidate(id: any | any[], __reval__ = true) {
  if (Array.isArray(id)) {
    id.map(reqId => {
      if (isDefined(reqId)) {
        const key = serialize(reqId)

        const resolveKey = serialize({ idString: key })

        if (__reval__) {
          previousConfig.set(resolveKey, undefined)
        }

        abortControllers.get(resolveKey)?.abort()

        if (__reval__) {
          if (!isPending(key)) {
            queue(() => {
              requestsProvider.emit(key, {
                loading: true,
                error: false
              })
            })
          }
        }
      }
    })
  } else {
    if (isDefined(id)) {
      const key = serialize(id)

      const resolveKey = serialize({ idString: key })

      if (__reval__) {
        previousConfig.set(resolveKey, undefined)
      }

      abortControllers.get(resolveKey)?.abort()

      if (__reval__) {
        if (!isPending(key)) {
          queue(() => {
            requestsProvider.emit(key, {
              loading: true,
              error: false
            })
          })
        }
      }
    }
  }
}

export function cancelRequest(id: any | any[]) {
  if (Array.isArray(id)) {
    id.map(reqId => {
      if (isDefined(reqId)) {
        const key = serialize({
          idString: serialize(reqId)
        })
        if (isPending(key)) {
          revalidate(reqId, false)
          queue(() => {
            requestsProvider.emit(key, {
              loading: false,
              error: false
            })
          })
        }
      }
    })
  } else {
    if (isDefined(id)) {
      const key = serialize({
        idString: serialize(id)
      })
      if (isPending(key)) {
        revalidate(id, false)
        queue(() => {
          requestsProvider.emit(key, {
            loading: false,
            error: false
          })
        })
      }
    }
  }
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
      cacheProvider?: CacheStoreType
    }
  }
) {
  type QuerysType = typeof queries

  return function useQuery<P extends keyof R>(
    queryName: P,
    otherConfig?: Omit<
      FetchInit<
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

    const { cacheProvider, ...others } = config

    const g = useGql(queries[queryName] as any, {
      cacheProvider: config?.cacheProvider,
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

    const thisData = useMemo(
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
        let newVal = v(cacheForMutation.get(key))
        runningMutate.set(key, undefined)
        requestsProvider.emit(key, {
          data: newVal,
          isMutating: true,
          requestCallId
        })
        if (_revalidate) {
          previousConfig.set(key, undefined)
          requestsProvider.emit(serialize(k), {})
        }
        queue(() => {
          valuesMemory.set(key, newVal)
          cacheForMutation.set(key, newVal)
        })
      } else {
        runningMutate.set(key, undefined)
        requestsProvider.emit(key, {
          requestCallId,
          isMutating: true,
          data: v
        })
        if (_revalidate) {
          previousConfig.set(key, undefined)
          requestsProvider.emit(serialize(k), {})
        }
        queue(() => {
          valuesMemory.set(key, v)
          cacheForMutation.set(key, v)
        })
      }
    } catch (err) {}
  }
}
