import { createContext, useContext } from 'react'
import EventEmitter from 'events'

import { CacheStoreType, FetcherContextType } from '../types'
import {
  ATTEMPTS,
  ATTEMPT_INTERVAL,
  DEFAULTS,
  MAX_LISTENERS,
  ONLINE,
  ON_OFFLINE,
  ON_ONLINE,
  PARAMS,
  QUERY,
  RETRY_ON_RECONNECT,
  REVALIDATE_ON_FOCUS,
  REVALIDATE_ON_MOUNT
} from './constants'

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
  }
}

const createRequestEmitter = () => {
  const emitter = new EventEmitter()

  emitter.setMaxListeners(MAX_LISTENERS)

  return emitter
}

export const requestEmitter = createRequestEmitter()

const defaultContextVaue = {
  defaults: DEFAULTS,
  attempts: ATTEMPTS,
  attemptInterval: ATTEMPT_INTERVAL,
  revalidateOnFocus: REVALIDATE_ON_FOCUS,
  query: QUERY,
  params: PARAMS,
  onOffline: ON_OFFLINE,
  onOnline: ON_ONLINE,
  online: ONLINE,
  retryOnReconnect: RETRY_ON_RECONNECT,
  revalidateOnMount: REVALIDATE_ON_MOUNT
}

export const FetcherContext =
  createContext<FetcherContextType>(defaultContextVaue)

export function useHRFContext() {
  return useContext(FetcherContext)
}
