'use client'

import React from 'react'
import { defaultCache, FetchConfig, useIsomorphicLayoutEffect } from '../'

let isCacheHydrated = false

const loadFromLocalStorage = () => {
  if (typeof localStorage !== 'undefined') {
    for (let key in localStorage) {
      try {
        const currentValue = localStorage.getItem(key)
        if (typeof currentValue !== 'undefined') {
          console.log({ key, currentValue })

          defaultCache.set(key, JSON.parse(currentValue!))
        }
      } catch (error) {
        // Remove cache key if parsing fails
        localStorage.removeItem(key)
      }
    }

    isCacheHydrated = true
    console.log('Cache hydration complete.')
  }
}

function useCacheHydration({ instant }: { instant?: boolean }) {
  if (instant && !isCacheHydrated) {
    loadFromLocalStorage()
  }

  useIsomorphicLayoutEffect(() => {
    if (!isCacheHydrated && !instant) {
      const handle = window.requestIdleCallback(loadFromLocalStorage)

      return () => window.cancelIdleCallback(handle)
    }

    return () => {}
  }, [instant])
}

/**
 * Provider component to configure the fetch library with a persistent cache.
 * Uses in-memory cache (defaultCache) for fast access and localStorage (storage)
 * for persistence, with asynchronous writes and deferred hydration.
 */
export function LocalStorageCacheProvider({
  children,
  instant
}: React.PropsWithChildren<{ instant?: boolean }>) {
  useCacheHydration({ instant })

  return (
    // @ts-expect-error
    <FetchConfig
      cacheProvider={{
        get(k) {
          return defaultCache.get(k)
        },

        set(k, v) {
          defaultCache.set(k, v)

          queueMicrotask(() => {
            localStorage.setItem(k, JSON.stringify(v))
          })
        },

        remove(k) {
          defaultCache.remove?.(k)

          queueMicrotask(() => {
            localStorage.removeItem(k)
          })
        }
      }}
    >
      {children}
    </FetchConfig>
  )
}
