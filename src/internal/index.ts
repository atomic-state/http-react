import { createContext, useContext } from "react"
import EventEmitter from "events"

import { CacheStoreType, FetcherContextType } from "../types"

// Constants
export const DEFAULT_GRAPHQL_PATH = "/graphql"
export const DEFAULT_RESOLVER = (e: any) => e.json()

/**
 * This marks which requests are running
 */
export const runningRequests: any = {}

/**
 * Previous request configurations (useful for deduplication)
 */
export const previousConfig: any = {}

export const previousProps: any = {}

export const valuesMemory: any = {}

/**
 * For Suspense
 */
export const willSuspend: any = {}

export const resolvedRequests: any = {}

export const resolvedHookCalls: any = {}

export const abortControllers: any = {}

/**
 * Request with errors
 */
export const hasErrors: any = {}

/**
 * Suspense calls that resolved
 */
export const suspenseInitialized: any = {}

/**
 * Defaults used as fallback data (works with SSR)
 */
export const fetcherDefaults: any = {}

export const cacheForMutation: any = {}

export const urls: {
  [k: string]: {
    realUrl: string
    rawUrl: string
  }
} = {}

/**
 * Default store cache
 */
export const defaultCache: CacheStoreType = {
  get(k) {
    return resolvedRequests[k]
  },
  set(k, v) {
    resolvedRequests[k] = v
  },
  delete(k) {
    delete resolvedRequests[k]
  },
}

const createRequestEmitter = () => {
  const emitter = new EventEmitter()

  emitter.setMaxListeners(10e10)

  return emitter
}

export const requestEmitter = createRequestEmitter()

const defaultContextVaue = {
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
  revalidateOnMount: true,
}

export const FetcherContext =
  createContext<FetcherContextType>(defaultContextVaue)

export function useHRFContext() {
  return useContext(FetcherContext)
}
