'use client'
import { useEffect, useState, Suspense } from 'react'

import {
  defaultCache,
  FetchContext,
  fetcherDefaults,
  useHRFContext,
  valuesMemory,
  willSuspend
} from '../internal'

import { FetchContextType } from '../types'

import { isDefined, serialize, windowExists } from '../utils/shared'

let isServer: boolean = true
/**
 * This is a wrapper around `Suspense`. It will render `fallback` during the first render and then leave the rendering to `Suspense`. If you are not using SSR, you should continue using the `Suspense` component.
 */
export function SSRSuspense({
  fallback,
  children
}: {
  fallback?: React.ReactNode
  children?: React.ReactNode
}) {
  const [ssr, setSSR] = useState(isServer)

  useEffect(() => {
    setSSR(false)
    isServer = false
  }, [])

  // This will render the fallback in the server
  return (
    ssr ? fallback : <Suspense fallback={fallback}>{children}</Suspense>
  ) as JSX.Element
}

export function FetchConfig(props: FetchContextType) {
  const { children, defaults = {}, value: $val = {}, suspense = [] } = props

  const value = (windowExists ? $val : $val.value) ?? {}

  const previousConfig = useHRFContext()

  const { cacheProvider = defaultCache } = previousConfig

  const $values = new Map()

  for (let valueKey in value) {
    const resolvedKey = serialize({
      idString: serialize(valueKey)
    })

    /**
     *
     * When promises are passed in nextjs, they are sent as chunks, so here
     * we try to parse their values
     */

    let parsedChunk

    const dataChunk = value[valueKey]?.data ?? value[valueKey]

    if (dataChunk instanceof Promise) {
      try {
        const parsedChunkValue = JSON.parse((dataChunk as any).value)
        parsedChunk = parsedChunkValue?.data ?? parsedChunkValue
      } catch {
        parsedChunk = dataChunk
      }
    } else {
      parsedChunk = dataChunk
    }

    $values.set(resolvedKey, parsedChunk)

    if (windowExists) {
      valuesMemory.set(resolvedKey, parsedChunk)

      fetcherDefaults.set(resolvedKey, parsedChunk)

      cacheProvider.set(resolvedKey, parsedChunk)
    }
  }

  for (let defaultKey in defaults) {
    const { id = defaultKey } = defaults[defaultKey]
    const resolvedKey = serialize({
      idString: serialize(id)
    })

    if (isDefined(id)) {
      $values.set(resolvedKey, defaults[defaultKey]?.value)
      if (windowExists) {
        valuesMemory.set(resolvedKey, defaults[defaultKey]?.value)
        fetcherDefaults.set(resolvedKey, defaults[defaultKey]?.value)
        cacheProvider.set(resolvedKey, defaults[defaultKey]?.value)
      }
    }
  }

  for (let suspenseKey of suspense) {
    const key = serialize({
      idString: serialize(suspenseKey)
    })
    willSuspend.set(key, true)
  }

  let mergedConfig: FetchContextType = {
    ...previousConfig,
    ...props,
    headers: {
      ...previousConfig.headers,
      ...props.headers
    },

    value: {
      ...previousConfig?.value,
      ...Object.fromEntries($values.entries())
    },
    children: undefined
  }

  return (
    <FetchContext.Provider value={mergedConfig}>
      {children}
    </FetchContext.Provider>
  )
}
