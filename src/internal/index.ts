"use client"
import { createContext, useContext } from "react"

import { CacheStoreType, FetchContextType } from "../types"
import {
  ATTEMPTS,
  ATTEMPT_INTERVAL,
  DEFAULTS,
  DEFAULT_MIDDLEWARE,
  DEFAULT_TRANSFORM,
  ONLINE,
  ON_OFFLINE,
  ON_ONLINE,
  PARAMS,
  QUERY,
  RETRY_ON_RECONNECT,
  REVALIDATE_ON_FOCUS,
  REVALIDATE_ON_MOUNT,
} from "./constants"
import { $context } from "./shared"

/**
 * This marks which requests are running
 */
export const runningRequests = new Map()

export function isPending(id: any): boolean {
  return runningRequests.get(id)
}

export const statusCodes = new Map()

export const lastResponses = new Map()

/**
 * Previous request configurations (useful for deduplication)
 */
export const previousConfig = new Map()

export const previousProps = new Map()

export const valuesMemory = new Map()

export const willStartFetch = new Map()

/**
 * Online / offline
 */
export const onlineHandled = new Map()

export const offlineHandled = new Map()

/**
 * To let know if it's revalidating there is at least one succesful request
 */

export const hasData = new Map()

/**
 * Max pagination age
 */

export const pageStarted = new Map()

export const maxAges = new Map()

/**
 * For Suspense
 */

export const willSuspend = new Map()

export const resolvedRequests = new Map()

export const resolvedHookCalls = new Map()

export const resolvedOnErrorCalls = new Map()

export const abortControllers = new Map()

export const canDebounce = new Map()

export const requestInitialTimes = new Map()

export const requestResponseTimes = new Map()

export const requestStarts = new Map()

export const requestEnds = new Map()

export const suspenseRevalidationStarted = new Map()

export const maxPaginationAges = new Map()

/**
 * Request with errors
 */
export const hasErrors = new Map()

/**
 * Keep track of initialized attempts
 */
export const gettingAttempts = new Map()

/**
 * Suspense calls that resolved
 */
export const suspenseInitialized = new Map()

/**
 * Defaults used as fallback data (works with SSR)
 */
export const fetcherDefaults = new Map()

export const cacheForMutation = new Map()

export const runningMutate = new Map()

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
    return resolvedRequests.get(k)
  },
  set(k, v) {
    resolvedRequests.set(k, v)
  },
  remove(k) {
    resolvedRequests.delete(k)
  },
}

const requestsSubscribers = new Map()

export const requestsProvider = {
  addListener(requestId?: any, listener?: any) {
    if (!requestsSubscribers.has(requestId)) {
      requestsSubscribers.set(requestId, [])
    }
    requestsSubscribers.get(requestId).push(listener)
  },
  removeListener(requestId?: any, listener?: any) {
    if (!requestsSubscribers.has(requestId)) {
      requestsSubscribers.set(requestId, [])
    }

    requestsSubscribers.set(
      requestId,
      requestsSubscribers.get(requestId).filter((l: any) => l !== listener)
    )
  },
  emit(requestId?: any, payload?: any) {
    if (requestsSubscribers.has(requestId)) {
      requestsSubscribers.get(requestId).forEach((listener: any) => {
        listener(payload)
      })
    }
  },
}

const defaultContextVaue: FetchContextType = {
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
  revalidateOnMount: REVALIDATE_ON_MOUNT,
  cacheIfError: true,
  middleware: DEFAULT_MIDDLEWARE,
  transform: DEFAULT_TRANSFORM,
  ...$context.value,
}

export const FetchContext = createContext<FetchContextType>(defaultContextVaue)

export function useHRFContext() {
  return useContext(FetchContext)
}
