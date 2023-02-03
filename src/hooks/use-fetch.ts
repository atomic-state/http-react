'use client'
import * as React from 'react'
import { useState, useEffect } from 'react'

import {
  abortControllers,
  cacheForMutation,
  defaultCache,
  fetcherDefaults,
  hasErrors,
  isPending,
  lastResponses,
  previousConfig,
  previousProps,
  requestsProvider,
  resolvedHookCalls,
  runningMutate,
  runningRequests,
  statusCodes,
  suspenseInitialized,
  urls,
  useHRFContext,
  valuesMemory,
  willSuspend,
  canDebounce,
  resolvedOnErrorCalls,
  requestInitialTimes,
  requestResponseTimes,
  suspenseRevalidationStarted,
  onlineHandled,
  offlineHandled,
  hasData
} from '../internal'

import { DEFAULT_RESOLVER, METHODS } from '../internal/constants'

import {
  CustomResponse,
  FetchConfigType,
  FetchConfigTypeNoUrl,
  HTTP_METHODS,
  ImperativeFetch,
  TimeSpan
} from '../types'

import {
  createImperativeFetch,
  getMiliseconds,
  getTimePassed,
  revalidate
} from '../utils'
import {
  createRequestFn,
  getRequestHeaders,
  hasBaseUrl,
  isDefined,
  isFunction,
  jsonCompare,
  notNull,
  queue,
  serialize,
  setURLParams,
  windowExists
} from '../utils/shared'

/**
 * Passing `undefined` to `new Date()` returns `Invalid Date {}`, so return null instead
 */
const getDateIfValid = (d: Date | null) =>
  // @ts-ignore - Evals to a Date
  (d?.toString() === 'Invalid Date' || d === null ? null : d) as Date

/**
 * Fetch hook
 */
export function useFetch<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string | Request,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  const ctx = useHRFContext()

  const isRequest = init instanceof Object && init?.json

  const optionsConfig =
    typeof init === 'string'
      ? {
          // Pass init as the url if init is a string
          url: init,
          ...options
        }
      : isRequest
      ? {
          url: init.url,
          method: init.method,
          init,
          ...options
        }
      : (init as FetchConfigType<FetchDataType, BodyType>)

  const {
    onOnline = ctx.onOnline,
    onOffline = ctx.onOffline,
    onMutate,
    revalidateOnMount = ctx.revalidateOnMount,
    url = '',
    query = {},
    params = {},
    baseUrl = undefined,
    method = isRequest ? init.method : (METHODS.GET as HTTP_METHODS),
    headers = {} as Headers,
    body = undefined as unknown as Body,
    formatBody = e => JSON.stringify(e),
    resolver = isFunction(ctx.resolver) ? ctx.resolver : DEFAULT_RESOLVER,
    onError,
    auto = isDefined(ctx.auto) ? ctx.auto : true,
    memory = isDefined(ctx.memory) ? ctx.memory : true,
    onResolve,
    onAbort,
    refresh = isDefined(ctx.refresh) ? ctx.refresh : 0,
    attempts = ctx.attempts,
    attemptInterval = ctx.attemptInterval,
    revalidateOnFocus = ctx.revalidateOnFocus,
    suspense: $suspense,
    onFetchStart = ctx.onFetchStart,
    onFetchEnd = ctx.onFetchEnd,
    cacheIfError = ctx.cacheIfError,
    maxCacheAge = ctx.maxCacheAge,
    fetcher = ctx.fetcher
  } = optionsConfig

  const $fetch = isFunction(fetcher) ? fetcher : fetch

  const config = {
    query,
    params,
    baseUrl,
    method,
    headers,
    body,
    formatBody
  }

  const { cacheProvider: $cacheProvider = defaultCache } = ctx

  const logStart = isFunction(onFetchStart)
  const logEnd = isFunction(onFetchEnd)

  const { cacheProvider = $cacheProvider } = optionsConfig

  const requestCallId = React.useMemo(
    () => `${Math.random()}`.split('.')[1],
    []
  )

  const willResolve = isDefined(onResolve)
  const handleError = isDefined(onError)
  const handleOnAbort = isDefined(onAbort)
  const handleMutate = isDefined(onMutate)
  const handleOnline = isDefined(onOnline)
  const handleOffline = isDefined(onOffline)

  const retryOnReconnect =
    optionsConfig.auto === false
      ? false
      : isDefined(optionsConfig.retryOnReconnect)
      ? optionsConfig.retryOnReconnect
      : ctx.retryOnReconnect

  const reqQuery = {
    ...ctx.query,
    ...config.query
  }

  const reqParams = {
    ...ctx.params,
    ...config.params
  }

  const rawUrl =
    (hasBaseUrl(url)
      ? ''
      : !isDefined(config.baseUrl)
      ? !isDefined(ctx.baseUrl)
        ? ''
        : ctx.baseUrl
      : config.baseUrl) + url

  const defaultId = [method, url].join(' ')

  const { id = defaultId } = optionsConfig

  const idString = serialize(id)

  const urlWithParams = React.useMemo(
    () => setURLParams(rawUrl, reqParams),
    [serialize(reqParams), config.baseUrl, ctx.baseUrl, url]
  )

  const resolvedKey = serialize({ idString })

  const resolvedDataKey = serialize({ idString, reqQuery, reqParams })

  const ageKey = ['max-age', resolvedDataKey].join('-')

  const paginationCache = cacheProvider.get(resolvedDataKey)

  const normalCache = cacheProvider.get(resolvedKey)

  const maxAge = getMiliseconds(maxCacheAge || '0 ms')

  // Revalidates if passed maxCacheAge has changed

  if (!cacheProvider.get('maxAgeValue' + resolvedDataKey)) {
    cacheProvider.set('maxAgeValue' + resolvedDataKey, maxCacheAge || '0 ms')
  } else {
    if (cacheProvider.get('maxAgeValue' + resolvedDataKey) !== maxCacheAge) {
      cacheProvider.set(ageKey, 0)
      cacheProvider.set('maxAgeValue' + resolvedDataKey, maxCacheAge)
    }
  }

  if (
    !isDefined(cacheProvider.get(ageKey)) ||
    !notNull(cacheProvider.get(ageKey))
  ) {
    cacheProvider.set(ageKey, maxAge)
  }

  const isExpired = Date.now() > cacheProvider.get(ageKey)

  const debounce = optionsConfig.debounce
    ? getMiliseconds(optionsConfig.debounce)
    : 0

  const canRevalidate = auto && isExpired

  const suspense = $suspense || willSuspend[resolvedKey]

  if (!suspense) {
    if (url !== '') {
      suspenseInitialized[resolvedKey] = true
    }
  }

  if (suspense && !willSuspend[resolvedKey]) {
    if (!suspenseInitialized[resolvedKey]) {
      willSuspend[resolvedKey] = true
    }
  }

  const realUrl =
    urlWithParams +
    (urlWithParams.includes('?') ? (optionsConfig?.query ? `&` : '') : '?')

  if (!isDefined(previousProps[resolvedKey])) {
    if (url !== '') {
      previousProps[resolvedKey] = optionsConfig
    }
  }

  const configUrl = urls[resolvedKey] || {
    realUrl,
    rawUrl
  }

  const stringDeps = serialize(
    Object.assign(
      {},
      ctx,
      config?.headers,
      { method: config?.method },
      config?.body,
      config?.query,
      config?.params,
      { resolver: undefined },
      { reqQuery },
      { reqParams }
    )
  )

  // This helps pass default values to other useFetch calls using the same id
  useEffect(() => {
    if (isDefined(optionsConfig.default)) {
      if (!isDefined(fetcherDefaults[resolvedKey])) {
        if (url !== '') {
          if (!isDefined(cacheProvider.get(resolvedDataKey))) {
            fetcherDefaults[resolvedKey] = optionsConfig.default
          }
        } else {
          if (!isDefined(cacheProvider.get(resolvedDataKey))) {
            requestsProvider.emit(resolvedKey, {
              requestCallId,
              data: optionsConfig.default
            })
          }
        }
      }
    } else {
      if (isDefined(fetcherDefaults[resolvedKey])) {
        if (!isDefined(cacheProvider.get(resolvedDataKey))) {
          setData(fetcherDefaults[resolvedKey])
        }
      }
    }
  }, [resolvedKey])

  const def = optionsConfig?.default ?? fetcherDefaults[resolvedKey]

  useEffect(() => {
    if (!canRevalidate) {
      runningRequests[resolvedKey] = false
    }
  }, [])

  const requestCache = cacheProvider.get(resolvedDataKey)

  const initialDataValue = valuesMemory[resolvedKey] ?? requestCache ?? def

  const [fetchState, setFetchState] = useState({
    data: initialDataValue,
    online: true,
    loading:
      url !== '' && auto
        ? isPending(resolvedKey) ||
          (revalidateOnMount
            ? suspense
              ? isPending(resolvedKey)
              : true
            : previousConfig[resolvedKey] !== serialize(optionsConfig))
        : false,
    error: (hasErrors[resolvedDataKey] || false) as boolean,
    completedAttempts: 0
  })

  const { data, loading, online, error, completedAttempts } = fetchState

  const isLoading = isExpired ? isPending(resolvedKey) || loading : false

  const loadingFirst =
    !(hasData[resolvedDataKey] || hasData[resolvedKey]) && isLoading

  if (!isExpired) {
    if (error) {
      setError(false)
    }
  }

  function setData(v: any) {
    setFetchState(p => {
      if (isFunction(v)) {
        const newVal = v(p.data)
        if (!jsonCompare(p.data, newVal)) {
          return {
            ...p,
            data: newVal
          }
        }
      } else {
        if (!jsonCompare(p.data, v)) {
          return {
            ...p,
            data: v
          }
        }
      }
      return p
    })
  }

  const thisCache = paginationCache ?? normalCache ?? data ?? def ?? null
  // Used JSON as deppendency instead of directly using a reference to data
  const rawJSON = serialize(data)

  function setOnline(v: any) {
    setFetchState(p => {
      if (online !== p.online) {
        return {
          ...p,
          online: v
        }
      }
      return p
    })
  }

  const requestHeaders = {
    ...ctx.headers,
    ...config.headers
  }

  function setError(v: any) {
    setFetchState(p => {
      if (isFunction(v)) {
        const newErroValue = v(p.error)
        if (newErroValue !== p.error) {
          return {
            ...p,
            error: newErroValue
          }
        }
      } else {
        if (v !== p.error) {
          return {
            ...p,
            error: v
          }
        }
      }
      return p
    })
  }

  function setLoading(v: any) {
    setFetchState(p => {
      if (isFunction(v)) {
        const newLoadingValue = v(p.loading)
        if (newLoadingValue !== p.loading) {
          return {
            ...p,
            loading: newLoadingValue
          }
        }
      } else {
        if (v !== p.loading) {
          return {
            ...p,
            loading: v
          }
        }
      }
      return p
    })
  }

  function setCompletedAttempts(v: any) {
    setFetchState(p => {
      if (isFunction(v)) {
        const newCompletedAttempts = v(p.completedAttempts)
        if (newCompletedAttempts !== p.completedAttempts) {
          return {
            ...p,
            completedAttempts: newCompletedAttempts
          }
        }
      } else {
        if (v !== p.completedAttempts) {
          return {
            ...p,
            completedAttempts: v
          }
        }
      }
      return p
    })
  }

  const requestAbortController: AbortController =
    abortControllers[resolvedKey] ?? new AbortController()

  const isGqlRequest = isDefined((optionsConfig as any)['__gql'])

  const fetchData = React.useCallback(
    async function fetchData(
      c: { headers?: any; body?: BodyType; query?: any; params?: any } = {}
    ) {
      const rawUrl =
        (hasBaseUrl(url)
          ? ''
          : !isDefined(config.baseUrl)
          ? !isDefined(ctx.baseUrl)
            ? ''
            : ctx.baseUrl
          : config.baseUrl) + url

      const urlWithParams = setURLParams(rawUrl, c.params)

      const realUrl =
        urlWithParams +
        (urlWithParams.includes('?') ? (c?.query !== '' ? `&` : '') : '?')

      if (previousConfig[resolvedKey] !== serialize(optionsConfig)) {
        previousProps[resolvedKey] = optionsConfig
        queue(() => {
          if (url !== '') {
            const newUrls = {
              realUrl,
              rawUrl
            }

            urls[resolvedKey] = newUrls
          }
        })
        if (!isPending(resolvedKey)) {
          runningRequests[resolvedKey] = auto
          hasErrors[resolvedDataKey] = false
          hasErrors[resolvedKey] = false

          resolvedOnErrorCalls[resolvedKey] = false
          resolvedHookCalls[resolvedKey] = false

          previousConfig[resolvedKey] = serialize(optionsConfig)

          let newAbortController = new AbortController()

          cacheProvider.set(ageKey, Date.now() - 1)

          requestsProvider.emit(resolvedKey, {
            requestCallId: loadingFirst ? requestCallId : undefined,
            loading: true,
            requestAbortController: newAbortController,
            error: false
          })

          abortControllers[resolvedKey] = newAbortController

          let $$data: any
          let $$error: any = false
          let $$response
          let $$code
          let $$loading
          let $$completedAttempts: number

          let rpc: any = {}

          try {
            let reqConfig = {}

            let _headers = isRequest ? getRequestHeaders(init) : {}

            if (isRequest) {
              for (let k in init) {
                // @ts-ignore Getting keys from Request init
                reqConfig[k] = init[k]
              }
            }

            cacheProvider.set('requestStart' + resolvedDataKey, Date.now())
            requestInitialTimes[resolvedDataKey] = Date.now()

            const newRequestConfig = (
              isRequest
                ? {
                    ...ctx,
                    ...reqConfig,
                    ...optionsConfig,
                    signal: (() => {
                      return newAbortController.signal
                    })(),
                    headers: {
                      'Content-Type': 'application/json',
                      ...ctx.headers,
                      ..._headers,
                      ...config.headers,
                      ...c.headers
                    }
                  }
                : {
                    ...ctx,
                    ...optionsConfig,
                    signal: (() => {
                      return newAbortController.signal
                    })(),
                    body: isFunction(formatBody)
                      ? // @ts-ignore // If formatBody is a function
                        formatBody(optionsConfig?.body as any)
                      : optionsConfig?.body,
                    headers: {
                      'Content-Type': 'application/json',
                      ...ctx.headers,
                      ...config.headers,
                      ...c.headers
                    }
                  }
            ) as any

            const r = new Request(realUrl + c.query, newRequestConfig)

            if (logStart) {
              ;(onFetchStart as any)(r, optionsConfig, ctx)
            }

            // @ts-ignore - This could use 'axios' or something similar
            const json = await $fetch(r.url, newRequestConfig)

            const resolvedDate = Date.now()

            cacheProvider.set(
              'expiration' + resolvedDataKey,
              resolvedDate + maxAge
            )

            cacheProvider.set('requestEnds' + resolvedDataKey, resolvedDate)
            requestResponseTimes[resolvedDataKey] =
              getTimePassed(resolvedDataKey)

            lastResponses[resolvedKey] = json

            const code = json.status as number
            statusCodes[resolvedKey] = code

            $$error = false

            rpc = {
              ...rpc,
              response: json,
              error: false,
              code
            }

            // @ts-ignore - 'data' is priority because 'fetcher' can return it
            const _data = json?.['data'] ?? (await (resolver as any)(json))
            if (code >= 200 && code < 400) {
              hasData[resolvedDataKey] = true
              hasData[resolvedKey] = true

              rpc = {
                ...rpc,
                error: false
              }

              const dataExpirationTime = Date.now() + maxAge
              cacheProvider.set(ageKey, dataExpirationTime)

              let __data = isGqlRequest
                ? {
                    ..._data,
                    variables: (optionsConfig as any)?.variables,
                    errors: _data?.errors ? _data.errors : undefined
                  }
                : _data

              if (_data?.errors && isGqlRequest) {
                $$error = true
                hasErrors[resolvedDataKey] = true
                hasErrors[resolvedKey] = true
                rpc = {
                  ...rpc,
                  error: true
                }
                if (handleError) {
                  if (!resolvedOnErrorCalls[resolvedKey]) {
                    resolvedOnErrorCalls[resolvedKey] = true
                    ;(onError as any)(true)
                  }
                }
              }
              cacheProvider.set(resolvedDataKey, __data)
              cacheProvider.set(resolvedKey, __data)
              valuesMemory[resolvedKey] = __data

              rpc = {
                ...rpc,
                data: __data,
                isResolved: true,
                loading: false,
                error: _data?.errors && isGqlRequest,
                variables: isGqlRequest
                  ? (optionsConfig as any)?.variables || {}
                  : undefined,
                completedAttempts: 0
              }

              $$data = __data
              cacheForMutation[idString] = __data

              if (!_data?.errors && isGqlRequest) {
                rpc = {
                  ...rpc,
                  error: false
                }

                $$error = false

                hasErrors[resolvedDataKey] = false
                hasErrors[resolvedKey] = false
              }
              $$loading = false
              if (willResolve) {
                if (!resolvedHookCalls[resolvedKey]) {
                  ;(onResolve as any)(__data, lastResponses[resolvedKey])
                  resolvedHookCalls[resolvedKey] = true
                }
              }
              runningRequests[resolvedKey] = false
              // If a request completes succesfuly, reset the error attempts to 0
              $$completedAttempts = 0
              queue(() => {
                cacheForMutation[resolvedKey] = __data
              })
            } else {
              if (!cacheIfError) {
                hasData[resolvedDataKey] = false
                hasData[resolvedKey] = false
              }
              if (_data.errors && isGqlRequest) {
                if (!cacheIfError) {
                  hasData[resolvedDataKey] = false
                  hasData[resolvedKey] = false
                }
                setFetchState(previous => {
                  const newData = {
                    ...previous,
                    variables: (optionsConfig as any)?.variables,
                    errors: _data.errors
                  } as any

                  $$data = newData

                  cacheForMutation[idString] = newData

                  rpc = {
                    ...rpc,
                    data: newData,
                    error: true
                  }

                  cacheProvider.set(resolvedDataKey, newData)
                  cacheProvider.set(resolvedKey, newData)

                  return previous
                })
                if (handleError) {
                  if (!resolvedOnErrorCalls[resolvedKey]) {
                    resolvedOnErrorCalls[resolvedKey] = true
                    ;(onError as any)(true, json)
                  }
                }
              } else {
                if (def) {
                  $$data = thisCache
                  cacheForMutation[idString] = def

                  rpc = {
                    ...rpc,
                    data: def
                  }
                }
                if (handleError) {
                  if (!resolvedOnErrorCalls[resolvedKey]) {
                    resolvedOnErrorCalls[resolvedKey] = true
                    ;(onError as any)(_data, json)
                  }
                }
              }
              $$error = true
              hasErrors[resolvedDataKey] = true
              hasErrors[resolvedKey] = true
              runningRequests[resolvedKey] = false
            }
            if (logEnd) {
              ;(onFetchEnd as any)(
                lastResponses[resolvedKey],
                optionsConfig,
                ctx
              )
            }
          } catch (err) {
            const errorString = err?.toString()
            // Only set error if no abort
            if (!/abort/i.test(errorString)) {
              if (!cacheIfError) {
                hasData[resolvedDataKey] = false
                hasData[resolvedKey] = false
              }

              let _error = new Error(err as any)

              rpc = {
                ...rpc,
                error: _error
              }

              if (cacheIfError) {
                if (notNull(thisCache) && isDefined(thisCache)) {
                  $$data = thisCache
                  cacheForMutation[idString] = thisCache

                  rpc = {
                    ...rpc,
                    data: thisCache
                  }
                }
              } else {
                $$data = def

                rpc = {
                  ...rpc,
                  data: def
                }

                cacheForMutation[idString] = def
              }
              $$error = _error

              rpc = {
                ...rpc,
                error: _error
              }

              hasErrors[resolvedDataKey] = true
              hasErrors[resolvedKey] = true
              if (handleError) {
                if (!resolvedOnErrorCalls[resolvedKey]) {
                  resolvedOnErrorCalls[resolvedKey] = true
                  ;(onError as any)(err as any)
                }
              }
            } else {
              rpc = {
                ...rpc,
                loading: true
              }
              if (!isPending(resolvedKey)) {
                if (!isDefined(cacheProvider.get(resolvedDataKey))) {
                  if (isDefined(def)) {
                    $$data = def
                    cacheForMutation[idString] = def
                  }
                  rpc = {
                    ...rpc,
                    data: def,
                    loading: true
                  }
                }
              }
            }
          } finally {
            setFetchState(p => {
              const n = {
                ...p,
                data: $$data ?? p.data,
                loading: rpc?.loading ?? false,
                error: isDefined($$error) ? $$error : p.error,
                completedAttempts: $$completedAttempts ?? p.completedAttempts
              }
              if (jsonCompare(n, p)) return p
              return n
            })

            runningRequests[resolvedKey] = false
            suspenseInitialized[resolvedKey] = true

            requestsProvider.emit(resolvedKey, {
              requestCallId,
              loading: false,
              error:
                hasErrors[resolvedKey] || hasErrors[resolvedDataKey] || false,
              ...rpc
            })

            willSuspend[resolvedKey] = false
            queue(() => {
              canDebounce[resolvedKey] = true
            }, debounce)
          }
        }
      }
    },
    [
      canRevalidate,
      ctx.auto,
      stringDeps,
      resolvedKey,
      config.method,
      serialize(optionsConfig),
      realUrl,
      requestCallId,
      memory,
      def,
      loadingFirst
    ]
  )

  useEffect(() => {
    const { signal } = requestAbortController || {}
    // Run onAbort callback
    const abortCallback = () => {
      if (loading) {
        if (isPending(resolvedKey)) {
          if (handleOnAbort) {
            ;(onAbort as any)()
          }
        }
      }
    }
    signal?.addEventListener('abort', abortCallback)
    return () => {
      signal?.removeEventListener('abort', abortCallback)
    }
  }, [requestAbortController, resolvedKey, onAbort, loading])

  const imperativeFetch = React.useMemo(() => {
    const __headers = {
      ...ctx.headers,
      ...config.headers
    }

    const __params = {
      ...ctx.params,
      ...config.params
    }

    const __baseUrl = isDefined(config.baseUrl) ? config.baseUrl : ctx.baseUrl
    return createImperativeFetch({
      ...ctx,
      headers: __headers,
      baseUrl: __baseUrl,
      params: __params
    })
  }, [serialize(ctx)])

  useEffect(() => {
    async function waitFormUpdates(v: any) {
      const {
        isMutating,
        data: $data,
        error: $error,
        online,
        loading,
        completedAttempts
      } = v || {}

      if (isMutating) {
        if (serialize($data) !== serialize(cacheForMutation[resolvedKey])) {
          cacheForMutation[idString] = data
          if (isMutating) {
            if (handleMutate) {
              if (url === '') {
                ;(onMutate as any)($data, imperativeFetch)
              } else {
                if (!runningMutate[resolvedKey]) {
                  runningMutate[resolvedKey] = true
                  ;(onMutate as any)($data, imperativeFetch)
                }
              }
            }
          }
        }
      }

      if (v.requestCallId !== requestCallId) {
        if (!willSuspend[resolvedKey]) {
          queue(() => {
            setFetchState(p => {
              const n = {
                ...p,
                data: !jsonCompare($data, p.data) ? $data : p.data ?? p.data,
                online: online ?? p.online,
                loading: loading ?? p.loading,
                error: $error,
                completedAttempts: completedAttempts ?? p.completedAttempts
              }

              if (jsonCompare(n, p)) return p

              return n
            })
          })
        }
      }
    }

    requestsProvider.addListener(resolvedKey, waitFormUpdates)

    return () => {
      requestsProvider.removeListener(resolvedKey, waitFormUpdates)
    }
  }, [
    JSON.stringify(optionsConfig),
    resolvedKey,
    resolvedDataKey,
    requestCallId,
    fetchState
  ])

  const reValidate = React.useCallback(
    async function reValidate() {
      if (!isPending(resolvedKey) && !loading) {
        revalidate(id)
      }
    },
    [serialize(id), loading]
  )

  useEffect(() => {
    function forceRefresh() {
      if (!isPending(resolvedKey)) {
        // preventing revalidation where only need updates about
        // 'loading', 'error' and 'data' because the url can be ommited.
        if (url !== '') {
          fetchData({
            query: Object.keys(reqQuery)
              .map(q => [q, reqQuery[q]].join('='))
              .join('&'),
            params: reqParams
          })
        }
      }
    }
    let idString = serialize(id)
    requestsProvider.addListener(idString, forceRefresh)
    return () => {
      requestsProvider.removeListener(idString, forceRefresh)
    }
  }, [
    fetchState,
    resolvedKey,
    suspense,
    loading,
    requestCallId,
    stringDeps,
    canRevalidate,
    ctx.auto,
    idString,
    fetchState,
    id
  ])

  useEffect(() => {
    function backOnline() {
      let willCancel = false
      function cancelReconectionAttempt() {
        willCancel = true
      }
      requestsProvider.emit(resolvedKey, {
        requestCallId,
        online: true
      })
      setOnline(true)
      offlineHandled[resolvedKey] = false
      if (handleOnline) {
        if (!onlineHandled[resolvedKey]) {
          onlineHandled[resolvedKey] = true
          ;(onOnline as any)({ cancel: cancelReconectionAttempt })
        }
      }
      if (!willCancel) {
        reValidate()
      }
    }

    function addOnlineListener() {
      if (windowExists) {
        if ('addEventListener' in window) {
          if (retryOnReconnect) {
            window.addEventListener('online', backOnline)
          }
        }
      }
    }

    addOnlineListener()

    return () => {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.removeEventListener('online', backOnline)
        }
      }
    }
  }, [onOnline, reValidate, requestCallId, resolvedKey, retryOnReconnect])

  useEffect(() => {
    function wentOffline() {
      runningRequests[resolvedKey] = false
      setOnline(false)
      requestsProvider.emit(resolvedKey, {
        requestCallId,
        online: false
      })
      onlineHandled[resolvedKey] = false
      if (handleOffline) {
        if (!offlineHandled[resolvedKey]) {
          offlineHandled[resolvedKey] = true
          ;(onOffline as any)()
        }
      }
    }

    function addOfflineListener() {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.addEventListener('offline', wentOffline)
        }
      }
    }

    addOfflineListener()

    return () => {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.removeEventListener('offline', wentOffline)
        }
      }
    }
  }, [onOffline, reValidate, requestCallId, resolvedKey, retryOnReconnect])

  useEffect(() => {
    return () => {
      if (revalidateOnMount) {
        if (canRevalidate) {
          if (url !== '') {
            if (suspenseInitialized[resolvedKey]) {
              queue(() => {
                previousConfig[resolvedKey] = undefined
                hasErrors[resolvedKey] = false
                hasErrors[resolvedDataKey] = false
                runningRequests[resolvedKey] = false
                // Wait for 100ms after suspense unmount
              }, 100)
            } else {
              previousConfig[resolvedKey] = undefined
              hasErrors[resolvedKey] = false
              hasErrors[resolvedDataKey] = false
              runningRequests[resolvedKey] = false
            }
          }
        }
      }
    }
  }, [requestCallId, resolvedKey, revalidateOnMount, suspense])

  useEffect(() => {
    // Attempts will be made after a request fails
    if ((attempts as number) > 0) {
      const tm = setTimeout(() => {
        if (error) {
          if (completedAttempts < (attempts as number)) {
            reValidate()
            setCompletedAttempts((previousAttempts: number) => {
              let newAttemptsValue = previousAttempts + 1

              requestsProvider.emit(resolvedKey, {
                requestCallId,
                completedAttempts: newAttemptsValue
              })

              return newAttemptsValue
            })
          } else if (completedAttempts === attempts) {
            requestsProvider.emit(resolvedKey, {
              requestCallId,
              online: false
            })
            setOnline(false)
          }
        }
      }, getMiliseconds(attemptInterval as TimeSpan))

      return () => {
        clearTimeout(tm)
      }
    }
    return () => {}
  }, [error, attempts, rawJSON, attemptInterval, completedAttempts])

  useEffect(() => {
    const refreshAmount = getMiliseconds(refresh as TimeSpan)
    if (completedAttempts === 0) {
      if (refreshAmount > 0 && canRevalidate) {
        const tm = setTimeout(reValidate, refreshAmount)

        return () => {
          clearTimeout(tm)
        }
      }
    }
    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, loading, error, rawJSON, completedAttempts, config])

  const initializeRevalidation = React.useCallback(
    async function initializeRevalidation() {
      if (canRevalidate) {
        if (url !== '') {
          fetchData({
            query: Object.keys(reqQuery)
              .map(q => [q, reqQuery[q]].join('='))
              .join('&'),
            params: reqParams
          })
        } else {
          // It means a url is not passed
          setFetchState(prev => ({
            ...prev,
            loading: false,
            error: hasErrors[resolvedDataKey] || hasErrors[resolvedKey]
          }))
        }
      }
    },
    [serialize(serialize(optionsConfig)), fetchState]
  )

  if (!suspense) {
    if (url !== '') {
      suspenseInitialized[resolvedKey] = true
    }
  }
  useEffect(() => {
    if (url !== '') {
      if (!jsonCompare(previousProps[resolvedKey], optionsConfig)) {
        abortControllers[resolvedKey]?.abort()
        queue(initializeRevalidation)
      }
    }
  }, [serialize(optionsConfig)])

  if (suspense) {
    if (auto) {
      if (windowExists) {
        if (!suspenseInitialized[resolvedKey]) {
          if (!suspenseRevalidationStarted[resolvedKey]) {
            suspenseRevalidationStarted[resolvedKey] = initializeRevalidation()
          }
          throw suspenseRevalidationStarted[resolvedKey]
        }
      } else {
        throw {
          message:
            "Use 'SSRSuspense' instead of 'Suspense' when using SSR and suspense"
        }
      }
    }
  }

  React.useMemo(() => {
    if (!runningRequests[resolvedKey] && isExpired) {
      if (windowExists) {
        if (canRevalidate && url !== '') {
          if (!jsonCompare(previousConfig[resolvedKey], optionsConfig)) {
            if (!isPending(resolvedKey)) {
              initializeRevalidation()
            } else {
              setLoading(true)
            }
          }
        }
      }
    }
  }, [resolvedKey, serialize(optionsConfig), canRevalidate])

  useEffect(() => {
    const revalidateAfterUnmount = revalidateOnMount
      ? true
      : previousConfig[resolvedKey] !== serialize(optionsConfig)

    function revalidate() {
      if (!debounce && !canDebounce[resolvedKey]) {
        initializeRevalidation()
      }
    }

    if (revalidateAfterUnmount) {
      if (suspense) {
        if (suspenseInitialized[resolvedKey]) {
          revalidate()
        }
      } else {
        revalidate()
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialize(optionsConfig)])

  useEffect(() => {
    function addFocusListener() {
      if (revalidateOnFocus && windowExists) {
        if ('addEventListener' in window) {
          window.addEventListener('focus', reValidate as any)
        }
      }
    }

    addFocusListener()

    return () => {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.removeEventListener('focus', reValidate as any)
        }
      }
    }
  }, [
    requestCallId,
    url,
    revalidateOnFocus,
    stringDeps,
    loading,
    reValidate,
    refresh,
    serialize(config)
  ])

  const __config = {
    ...config,
    ...optionsConfig,
    ...previousProps[resolvedKey],
    params: {
      ...reqParams,
      ...previousProps[resolvedKey]?.params
    },
    headers: {
      ...requestHeaders,
      ...previousProps[resolvedKey]?.headers
    },
    body: config.body,
    baseUrl: ctx.baseUrl || config.baseUrl,
    url: configUrl?.realUrl?.replace('?', ''),
    rawUrl: configUrl?.rawUrl,
    query: {
      ...reqQuery,
      ...previousProps[resolvedKey]?.query
    }
  }

  function forceMutate(
    newValue: FetchDataType | ((prev: FetchDataType) => FetchDataType),
    callback: (data: FetchDataType, fetcher: ImperativeFetch) => void = () => {}
  ) {
    if (!isFunction(newValue)) {
      if (
        serialize(cacheProvider.get(resolvedDataKey)) !== serialize(newValue)
      ) {
        callback(newValue as any, imperativeFetch)
        cacheProvider.set(resolvedDataKey, newValue)
        cacheProvider.set(resolvedKey, newValue)
        valuesMemory[resolvedKey] = newValue
        cacheForMutation[idString] = newValue
        runningMutate[resolvedKey] = false
        requestsProvider.emit(resolvedKey, {
          requestCallId,
          isMutating: true,
          data: newValue
        })
        setData(newValue as any)
      }
    } else {
      let newVal = (newValue as any)(data)
      if (serialize(cacheProvider.get(resolvedDataKey)) !== serialize(newVal)) {
        callback(newVal, imperativeFetch)
        cacheProvider.set(resolvedDataKey, newVal)
        cacheProvider.set(resolvedKey, newVal)
        valuesMemory[resolvedKey] = newVal
        cacheForMutation[idString] = newVal
        runningMutate[resolvedKey] = false
        requestsProvider.emit(resolvedKey, {
          requestCallId,
          isMutating: true,
          data: newVal
        })

        setData(newVal)
      }
    }
  }

  const [$requestStart, $requestEnd] = [
    notNull(cacheProvider.get('requestStart' + resolvedDataKey))
      ? new Date(cacheProvider.get('requestStart' + resolvedDataKey))
      : null,
    notNull(cacheProvider.get('requestEnds' + resolvedDataKey))
      ? new Date(cacheProvider.get('requestEnds' + resolvedDataKey))
      : null
  ]

  const expirationDate = error
    ? notNull($requestEnd)
      ? $requestEnd
      : null
    : maxAge === 0
    ? null
    : notNull(cacheProvider.get('expiration' + resolvedDataKey))
    ? new Date(cacheProvider.get('expiration' + resolvedDataKey))
    : null

  const isFailed = (hasErrors[resolvedDataKey] || error) && !isLoading

  const responseData =
    (error && isFailed ? (cacheIfError ? thisCache : null) : thisCache) ?? def

  const isSuccess = !isLoading && !isFailed

  const oneRequestResolved =
    !loadingFirst &&
    (hasData[resolvedDataKey] ||
      hasData[resolvedKey] ||
      (cacheIfError ? isDefined(responseData) && notNull(responseData) : false))

  return {
    revalidating: oneRequestResolved && isLoading,
    hasData: oneRequestResolved,
    success: isSuccess,
    loadingFirst,
    requestStart: getDateIfValid($requestStart),
    requestEnd: getDateIfValid($requestEnd),
    expiration: getDateIfValid(isFailed ? null : expirationDate),
    responseTime: requestResponseTimes[resolvedDataKey] ?? null,
    data: responseData,
    loading: isLoading,
    error: isFailed || false,
    online,
    code: statusCodes[resolvedKey],
    reFetch: reValidate,
    mutate: forceMutate,
    fetcher: imperativeFetch,
    abort: () => {
      abortControllers[resolvedKey]?.abort()
      if (loading) {
        setError(false)
        hasErrors[resolvedDataKey] = false
        setLoading(false)
        setData(requestCache)
        requestsProvider.emit(resolvedKey, {
          requestCallId,
          error: false,
          loading: false,
          data: requestCache
        })
      }
    },
    config: __config,
    response: lastResponses[resolvedKey],
    id,
    /**
     * The request key
     */
    key: resolvedKey
  } as unknown as {
    hasData: boolean
    /**
     * Revalidating means that at least one request has finished succesfuly and a new request is being sent
     */
    revalidating: boolean
    success: boolean
    loadingFirst: boolean
    expiration: Date
    data: FetchDataType
    loading: boolean
    error: Error | null
    online: boolean
    code: number
    reFetch: () => Promise<void>
    mutate: (
      update: FetchDataType | ((prev: FetchDataType) => FetchDataType),
      callback?: (data: FetchDataType, fetcher: ImperativeFetch) => void
    ) => FetchDataType
    fetcher: ImperativeFetch
    abort: () => void
    config: FetchConfigType<FetchDataType, BodyType> & {
      baseUrl: string
      url: string
      rawUrl: string
    }
    response: CustomResponse<FetchDataType>
    id: any
    key: string
    responseTime: number
    requestStart: Date
    requestEnd: Date
  }
}

useFetch.get = createRequestFn('GET', '', {})
useFetch.delete = createRequestFn('DELETE', '', {})
useFetch.head = createRequestFn('HEAD', '', {})
useFetch.options = createRequestFn('OPTIONS', '', {})
useFetch.post = createRequestFn('POST', '', {})
useFetch.put = createRequestFn('PUT', '', {})
useFetch.patch = createRequestFn('PATCH', '', {})
useFetch.purge = createRequestFn('PURGE', '', {})
useFetch.link = createRequestFn('LINK', '', {})
useFetch.unlink = createRequestFn('UNLINK', '', {})

useFetch.extend = createImperativeFetch
