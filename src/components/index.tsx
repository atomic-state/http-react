import React, { useEffect, useState, Suspense } from 'react'

import {
  defaultCache,
  FetcherContext,
  fetcherDefaults,
  useHRFContext,
  valuesMemory,
  willSuspend
} from '../internal'

import { FetcherContextType } from '../types'

import { isDefined, serialize } from '../utils'

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
  const [ssr, setSSR] = useState(true)

  useEffect(() => {
    setSSR(false)
  }, [])

  // This will render the fallback in the server
  return (
    ssr ? fallback : <Suspense fallback={fallback}>{children}</Suspense>
  ) as JSX.Element
}

export function FetcherConfig(props: FetcherContextType) {
  const { children, defaults = {}, baseUrl, suspense = [] } = props

  const previousConfig = useHRFContext()

  const { cache = defaultCache } = previousConfig

  let base = !isDefined(baseUrl)
    ? !isDefined(previousConfig.baseUrl)
      ? ''
      : previousConfig.baseUrl
    : baseUrl

  for (let defaultKey in defaults) {
    const { id } = defaults[defaultKey]
    const resolvedKey = serialize(
      isDefined(id)
        ? {
            idString: serialize(id)
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

  for (let suspenseKey of suspense) {
    const key = serialize({
      idString: serialize(suspenseKey)
    })
    willSuspend[key] = true
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