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

import { isDefined, serialize } from '../utils/shared'

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
  const { children, defaults = {}, suspense = [] } = props

  const previousConfig = useHRFContext()

  const { cacheProvider = defaultCache } = previousConfig

  for (let defaultKey in defaults) {
    const { id = defaultKey } = defaults[defaultKey]
    const resolvedKey = serialize({
      idString: serialize(id)
    })

    if (isDefined(id)) {
      if (!isDefined(valuesMemory.get(resolvedKey))) {
        valuesMemory.set(resolvedKey, defaults[defaultKey]?.value)
      }
      if (!isDefined(fetcherDefaults.get(resolvedKey))) {
        fetcherDefaults.set(resolvedKey, defaults[defaultKey]?.value)
      }
    }

    if (!isDefined(cacheProvider.get(resolvedKey))) {
      cacheProvider.set(resolvedKey, defaults[defaultKey]?.value)
    }
  }

  for (let suspenseKey of suspense) {
    const key = serialize({
      idString: serialize(suspenseKey)
    })
    willSuspend.set(key, true)
  }

  let mergedConfig = {
    ...previousConfig,
    ...props,
    headers: {
      ...previousConfig.headers,
      ...props.headers
    },
    children: undefined
  }

  return (
    <FetchContext.Provider value={mergedConfig}>
      {children}
    </FetchContext.Provider>
  )
}
