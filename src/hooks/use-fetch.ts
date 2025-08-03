'use client'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

import {
  abortControllers,
  cacheForMutation,
  defaultCache,
  fetcherDefaults,
  hasErrors,
  isPending,
  gettingAttempts,
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
  FetchContextType,
  HTTP_METHODS,
  ImperativeFetch,
  TimeSpan
} from '../types'

import {
  createImperativeFetch,
  getMiliseconds,
  getTimePassed,
  revalidate,
  useIsomorphicLayoutEffect
} from '../utils'
import {
  createRequestFn,
  getRequestHeaders,
  hasBaseUrl,
  isDefined,
  isFormData,
  isFunction,
  jsonCompare,
  notNull,
  queue,
  serialize,
  setURLParams,
  windowExists
} from '../utils/shared'
import { $context } from '../internal/shared'

/**
 * Passing `undefined` to `new Date()` returns `Invalid Date {}`, so return null instead
 */
const getDateIfValid = (d: Date | null) =>
  // @ts-ignore - Evals to a Date
  (d?.toString() === 'Invalid Date' || d === null ? null : d) as Date

/**
 * Termporary form data is set with the submit method in useFetch and is deleted immediately after resolving (see line #858)
 * */
const temporaryFormData = new Map()

/**
 * Fetch hook
 */
export function useFetch<FetchDataType = any, TransformData = any>(
  init: FetchConfigType<FetchDataType, TransformData> | string | Request,
  options?: FetchConfigTypeNoUrl<FetchDataType, TransformData>
) {
  const $ctx = useHRFContext()

  const ctx: FetchContextType = {
    ...$context.value,
    ...$ctx,
    query: {
      ...$context?.value?.query,
      ...$ctx?.query
    },
    headers: {
      ...$context.value?.headers,
      ...$ctx?.headers
    }
  }

  const valueMap = new Map(Object.entries(ctx.value ?? {}))

  const formRef = useRef<HTMLFormElement>(null)

  // @ts-ignore
  const isRequest = init instanceof Object && init?.json

  const optionsConfig =
    typeof init === 'string'
      ? {
          // Pass init as the url if init is a string
          url: init,
          ...options,
          id: options?.id ?? options?.key
        }
      : isRequest
      ? {
          url: init.url,
          method: init.method,
          init,
          ...options,
          id: options?.id ?? options?.key
        }
      : ({
          ...init,
          ...options,
          // @ts-expect-error
          id: init?.id ?? init?.key
        } as Required<FetchConfigType<FetchDataType, TransformData>>)

  const {
    onOnline = ctx.onOnline,
    onOffline = ctx.onOffline,
    onMutate,
    revalidateOnMount = ctx.revalidateOnMount,
    url = new String(),
    query = {},
    params = {},
    baseUrl = undefined,
    method = isRequest ? init.method : (METHODS.GET as HTTP_METHODS),
    headers = {} as Headers,
    body = undefined as unknown as Body,
    formatBody = (e: any) => JSON.stringify(e),
    resolver = isFunction(ctx.resolver) ? ctx.resolver : DEFAULT_RESOLVER,
    onError,
    auto = isDefined(ctx.auto) ? ctx.auto : true,
    memory = isDefined(ctx.memory) ? ctx.memory : true,
    onResolve,
    onSubmit,
    onAbort,
    refresh = isDefined(ctx.refresh) ? ctx.refresh : 0,
    attempts: $attempts = ctx.attempts,
    attemptInterval = ctx.attemptInterval,
    revalidateOnFocus = ctx.revalidateOnFocus,
    suspense: $suspense,
    onFetchStart = ctx.onFetchStart,
    onFetchEnd = ctx.onFetchEnd,
    cacheIfError = ctx.cacheIfError,
    maxCacheAge = ctx.maxCacheAge,
    fetcher = ctx.fetcher,
    middleware = ctx.middleware,
    transform = ctx.transform
  } = optionsConfig

  const $fetch = isFunction(fetcher)
    ? fetcher
    : windowExists
    ? fetch
    : () => new Response(serialize(initialDataValue))

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

  const requestCallId = useMemo(() => `${Math.random()}`.split('.')[1], [])

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
      : !isDefined(config.baseUrl!)
      ? !isDefined(ctx.baseUrl!)
        ? ''
        : ctx.baseUrl!
      : config.baseUrl!) + url

  const defaultId = optionsConfig.key ?? [method, url].join(' ')

  const { id = defaultId } = optionsConfig

  const idString = serialize(id)

  const urlWithParams = useMemo(
    () => setURLParams(rawUrl, reqParams),
    [serialize(reqParams), config.baseUrl, ctx.baseUrl, url]
  )

  const resolvedKey = serialize({ idString })

  if (!statusCodes.has(resolvedKey)) {
    statusCodes.set(resolvedKey, null)
  }

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

  const suspense = $suspense || willSuspend.get(resolvedKey)

  if (!suspense) {
    if (url !== '') {
      suspenseInitialized.set(resolvedKey, true)
    }
  }

  if (suspense && !willSuspend.get(resolvedKey)) {
    if (!suspenseInitialized.get(resolvedKey)) {
      willSuspend.set(resolvedKey, true)
    }
  }

  const realUrl =
    urlWithParams +
    (urlWithParams.includes('?') ? (optionsConfig?.query ? `&` : '') : '?')

  if (!previousProps.has(resolvedKey)) {
    if (url !== '') {
      previousProps.set(resolvedKey, optionsConfig)
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

  const setData = useCallback((v: any) => {
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
  }, [])

  // This helps pass default values to other useFetch calls using the same id
  useEffect(() => {
    if (isDefined(optionsConfig.default)) {
      if (!fetcherDefaults.has(resolvedKey)) {
        if (url !== '') {
          if (!isDefined(cacheProvider.get(resolvedDataKey))) {
            fetcherDefaults.set(resolvedKey, optionsConfig.default)
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
      if (fetcherDefaults.has(resolvedKey)) {
        if (!isDefined(cacheProvider.get(resolvedDataKey))) {
          setData(fetcherDefaults.get(resolvedKey))
        }
      }
    }
  }, [
    resolvedKey,
    resolvedDataKey,
    optionsConfig.default,
    url,
    requestCallId,
    setData
  ])

  const def = optionsConfig?.default ?? fetcherDefaults.get(resolvedKey)

  useEffect(() => {
    if (!canRevalidate) {
      runningRequests.set(resolvedKey, false)
    }
  }, [canRevalidate, resolvedKey])

  const requestCache = cacheProvider.get(resolvedDataKey)

  const defaultFromContext = valueMap.get(resolvedKey)

  const initialDataValue =
    valuesMemory.get(resolvedKey) ?? requestCache ?? defaultFromContext ?? def

  const hasInitialOrFallbackData = isDefined(initialDataValue)

  const [fetchState, setFetchState] = useState({
    data: initialDataValue,
    online: true,
    loading: auto
      ? isPending(resolvedKey) ||
        (revalidateOnMount
          ? !jsonCompare(
              JSON.parse(previousConfig.get(resolvedKey) || '{}'),
              optionsConfig
            )
          : !jsonCompare(
              JSON.parse(previousConfig.get(resolvedKey) || '{}'),
              optionsConfig
            ))
      : false,
    error: (hasErrors.get(resolvedDataKey) || false) as boolean,
    completedAttempts: 0
  })

  const thisDeps = useRef({
    data: false,
    online: false,
    loading: false,
    error: false,
    completedAttempts: false
  }).current

  const inDeps = (k: keyof typeof thisDeps) => {
    return thisDeps[k]
  }

  const { data, loading, online, error, completedAttempts } = fetchState

  const isLoading = isExpired ? isPending(resolvedKey) || loading : false

  const loadingFirst =
    !(hasData.get(resolvedDataKey) || hasData.get(resolvedKey)) && isLoading

  const setOnline = useCallback((v: any) => {
    setFetchState(p => {
      if (isFunction(v)) {
        const newVal = v(p.online)
        if (newVal !== p.online) {
          return { ...p, online: newVal }
        }
      } else {
        if (v !== p.online) {
          return { ...p, online: v }
        }
      }
      return p
    })
  }, [])

  const requestHeaders = {
    ...ctx.headers,
    ...config.headers
  }

  const setError = useCallback((v: any) => {
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
  }, [])

  const setLoading = useCallback((v: any) => {
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
  }, [])

  const setCompletedAttempts = useCallback((v: any) => {
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
  }, [])

  const requestAbortController: AbortController =
    abortControllers.get(resolvedKey) ?? new AbortController()

  const isGqlRequest = isDefined((optionsConfig as any)['__gql'])

  const fetchData = useCallback(
    async function fetchData(
      c: { headers?: any; body?: any; query?: any; params?: any } = {}
    ) {
      const rawUrl =
        (hasBaseUrl(url)
          ? ''
          : !isDefined(config.baseUrl!)
          ? !isDefined(ctx.baseUrl!)
            ? ''
            : ctx.baseUrl!
          : config.baseUrl!) + url

      const urlWithParams = setURLParams(rawUrl, c.params)

      const realUrl =
        urlWithParams +
        (urlWithParams.includes('?') ? (c?.query !== '' ? `&` : '') : '')

      if (
        !jsonCompare(
          JSON.parse(previousConfig.get(resolvedKey) || '{}'),
          optionsConfig
        )
      ) {
        setError(false)
        setLoading(true)

        previousProps.set(resolvedKey, optionsConfig)

        if (!isPending(resolvedKey)) {
          runningRequests.set(resolvedKey, auto)
          hasErrors.set(resolvedDataKey, false)
          hasErrors.set(resolvedKey, false)

          resolvedOnErrorCalls.set(resolvedKey, false)
          resolvedHookCalls.set(resolvedKey, false)

          previousConfig.set(resolvedKey, serialize(optionsConfig))

          let newAbortController = new AbortController()

          cacheProvider.set(ageKey, Date.now() - 1)

          requestsProvider.emit(resolvedKey, {
            requestCallId,
            loading: true,
            requestAbortController: newAbortController,
            error: false
          })

          abortControllers.set(resolvedKey, newAbortController)

          let $$data: any

          let rpc: any = {}

          try {
            let reqConfig = {}

            // @ts-ignore
            let _headers = isRequest ? getRequestHeaders(init) : {}

            if (isRequest) {
              for (let k in init) {
                // @ts-ignore Getting keys from Request init
                reqConfig[k] = init[k]
              }
            }

            cacheProvider.set('requestStart' + resolvedDataKey, Date.now())
            requestInitialTimes.set(resolvedDataKey, Date.now())

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
                    body:
                      temporaryFormData.get(resolvedKey) ??
                      (isFunction(formatBody)
                        ? // @ts-ignore // If formatBody is a function
                          formatBody(optionsConfig?.body as any)
                        : optionsConfig?.body),
                    headers: {
                      ...(temporaryFormData.get(resolvedKey)
                        ? {}
                        : { 'Content-Type': 'application/json' }),
                      ...ctx.headers,
                      ...config.headers,
                      ...c.headers
                    }
                  }
            ) as any

            const r = new Request(
              (
                realUrl +
                (realUrl.includes('?')
                  ? c.query
                  : c.query
                  ? '?' + c.query
                  : c.query)
              ).replace('?&', '?'),
              newRequestConfig
            )

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
            requestResponseTimes.set(
              resolvedDataKey,
              getTimePassed(resolvedDataKey)
            )

            lastResponses.set(resolvedKey, json)

            const code = json.status as number
            statusCodes.set(resolvedKey, code)

            rpc = {
              ...rpc,
              response: json,
              error: false,
              code
            }

            // @ts-ignore - 'data' is priority because 'fetcher' can return it
            const incoming = json?.['data'] ?? (await (resolver as any)(json))

            // @ts-ignore
            const actionError = json?.['error']

            const _data = isFunction(middleware)
              ? await middleware!(incoming as any, data)
              : incoming

            let __data = isGqlRequest
              ? {
                  ..._data,
                  variables: (optionsConfig as any)?.variables,
                  errors: _data?.errors ? _data.errors : undefined
                }
              : _data

            cacheProvider.set(resolvedDataKey, __data)
            cacheProvider.set(resolvedKey, __data)
            valuesMemory.set(resolvedKey, __data)
            $$data = __data
            cacheForMutation.set(idString, __data)

            if (code >= 200 && code < 400) {
              gettingAttempts.set(resolvedKey, true)

              hasData.set(resolvedDataKey, true)
              hasData.set(resolvedKey, true)

              rpc = {
                ...rpc,
                error: false
              }

              const dataExpirationTime = Date.now() + maxAge
              cacheProvider.set(ageKey, dataExpirationTime)

              if (_data?.errors && isGqlRequest) {
                hasErrors.set(resolvedDataKey, true)
                hasErrors.set(resolvedKey, true)
                rpc = {
                  ...rpc,
                  error: true
                }
                if (handleError) {
                  if (!resolvedOnErrorCalls.get(resolvedKey)) {
                    resolvedOnErrorCalls.set(resolvedKey, true)
                    ;(onError as any)(true)
                  }
                }
              }

              rpc = {
                ...rpc,
                data: __data,
                isResolved: true,
                loading: false,
                variables: isGqlRequest
                  ? (optionsConfig as any)?.variables || {}
                  : undefined,
                completedAttempts: 0
              }

              $$data = __data
              cacheForMutation.set(idString, __data)

              if (!_data?.errors && isGqlRequest) {
                rpc = {
                  ...rpc,
                  error: false
                }

                hasErrors.set(resolvedDataKey, false)
                hasErrors.set(resolvedKey, false)
              }

              if (willResolve) {
                if (!resolvedHookCalls.get(resolvedKey)) {
                  ;(onResolve as any)(__data, lastResponses.get(resolvedKey))

                  resolvedHookCalls.set(resolvedKey, true)
                }
              }
              runningRequests.set(resolvedKey, false)
              // If a request completes succesfuly, reset the error attempts to 0

              queue(() => {
                cacheForMutation.set(resolvedKey, __data)
              })
            } else {
              rpc = {
                ...rpc,
                error: actionError ?? true
              }
              if (!cacheIfError) {
                hasData.set(resolvedDataKey, false)
                hasData.set(resolvedKey, false)
              }
              if (_data.errors && isGqlRequest) {
                if (!cacheIfError) {
                  hasData.set(resolvedDataKey, false)
                  hasData.set(resolvedKey, false)
                }
                setFetchState(previous => {
                  const newData = {
                    ...previous,
                    variables: (optionsConfig as any)?.variables,
                    errors: _data.errors
                  } as any

                  $$data = newData

                  cacheForMutation.set(idString, newData)

                  rpc = {
                    ...rpc,
                    data: newData,
                    error: actionError ?? true
                  }

                  cacheProvider.set(resolvedDataKey, newData)
                  cacheProvider.set(resolvedKey, newData)

                  return previous
                })
                if (handleError) {
                  if (!resolvedOnErrorCalls.get(resolvedKey)) {
                    resolvedOnErrorCalls.set(resolvedKey, actionError ?? true)
                    ;(onError as any)(actionError ?? true, json)
                  }
                }
              } else {
                if (def) {
                  $$data = data
                  cacheForMutation.set(idString, def)

                  rpc = {
                    ...rpc,
                    data: def
                  }
                }
                if (handleError) {
                  if (!resolvedOnErrorCalls.get(resolvedKey)) {
                    resolvedOnErrorCalls.set(resolvedKey, actionError ?? true)
                    ;(onError as any)(_data, json)
                  }
                }
              }

              hasErrors.set(resolvedDataKey, actionError ?? true)
              hasErrors.set(resolvedKey, actionError ?? true)
              runningRequests.set(resolvedKey, false)
            }
            if (logEnd) {
              ;(onFetchEnd as any)(
                lastResponses.get(resolvedKey),
                optionsConfig,
                ctx
              )
            }
          } catch (err) {
            const errorString = err?.toString()
            // Only set error if no abort
            // @ts-ignore
            if (!/abort/i.test(errorString)) {
              if (!cacheIfError) {
                hasData.set(resolvedDataKey, false)
                hasData.set(resolvedKey, false)
              }

              rpc = {
                ...rpc,
                error: err ?? true
              }

              if (cacheIfError) {
                if (notNull(data) && isDefined(data)) {
                  $$data = data
                  cacheForMutation.set(idString, data)

                  rpc = {
                    ...rpc,
                    data: data
                  }
                }
              } else {
                $$data = def

                rpc = {
                  ...rpc,
                  data: def
                }

                cacheForMutation.set(idString, def)
              }

              rpc = {
                ...rpc,
                error: err ?? true
              }

              hasErrors.set(resolvedDataKey, err ?? true)
              hasErrors.set(resolvedKey, err ?? true)
              if (handleError) {
                if (!resolvedOnErrorCalls.get(resolvedKey)) {
                  resolvedOnErrorCalls.set(resolvedKey, true)
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
                    cacheForMutation.set(idString, def)
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
            if (rpc.error) {
              gettingAttempts.set(resolvedKey, false)
            }
            temporaryFormData.delete(resolvedKey)
            runningRequests.set(resolvedKey, false)
            suspenseInitialized.set(resolvedKey, true)

            requestsProvider.emit(resolvedKey, {
              error:
                hasErrors.get(resolvedKey) ||
                hasErrors.get(resolvedDataKey) ||
                false,
              ...rpc,
              loading: false
            })

            willSuspend.set(resolvedKey, false)
            queue(() => {
              canDebounce.set(resolvedKey, true)
            }, debounce)
            return $$data
          }
        }
      }
    },
    [
      // No longer depends on data
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
      loadingFirst,
      setError,
      setLoading
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

  const imperativeFetch = useMemo(() => {
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

  const forceMutate = useCallback(
    (
      newValue: FetchDataType | ((prev: FetchDataType) => FetchDataType),
      callback: (
        data: FetchDataType,
        fetcher: ImperativeFetch
      ) => void = () => {}
    ) => {
      const updater = (prevData: FetchDataType) => {
        const dataToSet = isFunction(newValue)
          ? // @ts-expect-error
            newValue(prevData)
          : (newValue as FetchDataType)

        if (
          serialize(cacheProvider.get(resolvedDataKey)) !== serialize(dataToSet)
        ) {
          callback(dataToSet, imperativeFetch)
          cacheProvider.set(resolvedDataKey, dataToSet)
          cacheProvider.set(resolvedKey, dataToSet)
          valuesMemory.set(resolvedKey, dataToSet)
          cacheForMutation.set(idString, dataToSet)
          runningMutate.set(resolvedKey, false)
          requestsProvider.emit(resolvedKey, {
            requestCallId,
            isMutating: true,
            data: dataToSet
          })
        }
        return dataToSet
      }
      setData(updater)
    },
    [
      imperativeFetch,
      resolvedDataKey,
      resolvedKey,
      idString,
      requestCallId,
      setData
    ]
  )

  useEffect(() => {
    function waitFormUpdates(v: any) {
      const {
        isMutating,
        data: $data,
        error: $error,
        online,
        loading,
        completedAttempts
      } = v || {}

      if (isMutating) {
        if (serialize($data) !== serialize(cacheForMutation.get(resolvedKey))) {
          cacheForMutation.set(idString, $data)
          if (isMutating) {
            forceMutate($data)
            if (handleMutate) {
              if (url === '') {
                ;(onMutate as any)($data, imperativeFetch)
              } else {
                if (!runningMutate.get(resolvedKey)) {
                  runningMutate.set(resolvedKey, true)
                  ;(onMutate as any)($data, imperativeFetch)
                }
              }
            }
          }
        }
      }

      if (v.requestCallId !== requestCallId) {
        if (!willSuspend.get(resolvedKey)) {
          if (inDeps('data') && isDefined($data)) {
            setData($data)
          }
          if (inDeps('online') && isDefined(online)) {
            setOnline(online)
          }
          if (inDeps('loading') && isDefined(loading)) {
            setLoading(loading)
          }
          if (inDeps('error') && isDefined($error)) {
            setError($error)
          }
          if (inDeps('completedAttempts') && isDefined(completedAttempts)) {
            setCompletedAttempts(completedAttempts)
          }
        }
      }
    }

    requestsProvider.addListener(resolvedKey, waitFormUpdates)

    return () => {
      requestsProvider.removeListener(resolvedKey, waitFormUpdates)
    }
  }, [
    thisDeps,
    resolvedKey,
    idString,
    requestCallId,
    forceMutate,
    imperativeFetch,
    setData,
    setOnline,
    setLoading,
    setError,
    setCompletedAttempts,
    handleMutate,
    url,
    onMutate
  ])

  const reValidate = useCallback(
    async function reValidate() {
      if (!isPending(resolvedKey)) {
        revalidate(id)
      }
    },
    [id, loading]
  )

  useEffect(() => {
    function forceRefresh() {
      if (!isPending(resolvedKey)) {
        // preventing revalidation where only need updates about
        // 'loading', 'error' and 'data' because the url can be ommited.
        if (url !== '') {
          fetchData({
            query: Object.keys(reqQuery)
              .map(q =>
                Array.isArray(reqQuery[q])
                  ? reqQuery[q]
                      .map((queryItem: any) => [q, queryItem].join('='))
                      .join('&')
                  : [q, reqQuery[q]].join('=')
              )
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
  }, [fetchData, id, reqQuery, reqParams, url])

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
      offlineHandled.set(resolvedKey, false)
      if (handleOnline) {
        if (!onlineHandled.get(resolvedKey)) {
          onlineHandled.set(resolvedKey, true)
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
  }, [
    onOnline,
    reValidate,
    requestCallId,
    resolvedKey,
    retryOnReconnect,
    setOnline
  ])

  useEffect(() => {
    function wentOffline() {
      runningRequests.set(resolvedKey, false)
      setOnline(false)
      requestsProvider.emit(resolvedKey, {
        requestCallId,
        online: false
      })
      onlineHandled.set(resolvedKey, false)
      if (handleOffline) {
        if (!offlineHandled.get(resolvedKey)) {
          offlineHandled.set(resolvedKey, true)
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
  }, [onOffline, requestCallId, resolvedKey, setOnline])

  useEffect(() => {
    return () => {
      if (revalidateOnMount) {
        if (canRevalidate) {
          if (url !== '') {
            if (suspenseInitialized.get(resolvedKey)) {
              queue(() => {
                previousConfig.set(resolvedKey, undefined)
                hasErrors.set(resolvedKey, false)
                hasErrors.set(resolvedDataKey, false)
                runningRequests.set(resolvedKey, false)
                // Wait for 100ms after suspense unmount
              }, 100)
            } else {
              previousConfig.set(resolvedKey, undefined)
              hasErrors.set(resolvedKey, false)
              hasErrors.set(resolvedDataKey, false)
              runningRequests.set(resolvedKey, false)
            }
          }
        }
      }
    }
  }, [
    requestCallId,
    resolvedKey,
    revalidateOnMount,
    suspense,
    canRevalidate,
    url,
    resolvedDataKey
  ])

  if (!gettingAttempts.has(resolvedKey)) {
    gettingAttempts.set(resolvedKey, false)
  }

  useEffect(() => {
    // Attempts will be made after a request fails
    const tm = setTimeout(() => {
      if (!gettingAttempts.get(resolvedKey)) {
        gettingAttempts.set(resolvedKey, true)
        const attempts =
          typeof $attempts === 'function'
            ? $attempts({
                status:
                  statusCodes.get(resolvedKey) ||
                  statusCodes.get(resolvedDataKey),
                res: lastResponses.get(resolvedKey),
                error:
                  hasErrors.get(resolvedKey) ||
                  hasErrors.get(resolvedDataKey) ||
                  (error as any),
                completedAttempts
              })
            : $attempts

        if ((attempts as number) > 0) {
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
              online: false,
              error: true
            })
            if (inDeps('online')) setOnline(false)
          }
        }
      }
    }, getMiliseconds(attemptInterval as TimeSpan))

    return () => {
      clearTimeout(tm)
    }
  }, [
    error,
    $attempts,
    reValidate,
    attemptInterval,
    resolvedKey,
    completedAttempts,
    setCompletedAttempts,
    setOnline,
    resolvedDataKey,
    requestCallId,
    statusCodes,
    lastResponses,
    hasErrors
  ])

  useEffect(() => {
    const refreshAmount = getMiliseconds(refresh as TimeSpan)
    if (completedAttempts === 0) {
      if (refreshAmount > 0 && canRevalidate) {
        const tm = setInterval(reValidate, refreshAmount)

        return () => {
          clearInterval(tm)
        }
      }
    }
    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    refresh,
    loading,
    error,
    serialize(data),
    canRevalidate,
    completedAttempts,
    config,
    reValidate
  ])

  const initializeRevalidation = useCallback(
    windowExists
      ? async function initializeRevalidation() {
          let d = undefined
          if (canRevalidate) {
            if (url !== '') {
              d = await fetchData({
                query: Object.keys(reqQuery)
                  .map(q =>
                    Array.isArray(reqQuery[q])
                      ? reqQuery[q]
                          .map((queryItem: any) => [q, queryItem].join('='))
                          .join('&')
                      : [q, reqQuery[q]].join('=')
                  )
                  .join('&'),
                params: reqParams
              })
            } else {
              d = def
              // It means a url is not passed
              setFetchState(prev => ({
                ...prev,
                loading: false,
                error:
                  hasErrors.get(resolvedDataKey) || hasErrors.get(resolvedKey),
                completedAttempts: prev.completedAttempts
              }))
            }
          } else {
            d = def
          }
          return d
        }
      : () => {
          return new Promise(resolve => {
            queue(() => resolve(initialDataValue))
          })
        },
    [
      fetchData,
      canRevalidate,
      url,
      reqQuery,
      reqParams,
      def,
      resolvedDataKey,
      resolvedKey,
      initialDataValue
    ]
  )

  if (!suspense) {
    if (url !== '') {
      suspenseInitialized.set(resolvedKey, true)
    }
  }

  // @ts-ignore
  useIsomorphicLayoutEffect(() => {
    const revalidationLogic = () => {
      const configChanged = !jsonCompare(
        JSON.parse(previousConfig.get(resolvedKey) || '{}'),
        optionsConfig
      )

      if (!configChanged && !revalidateOnMount) {
        return
      }

      if (isPending(resolvedKey)) {
        setLoading(true)
        setError(false)
        return
      }

      if (auto && canRevalidate && url !== '') {
        initializeRevalidation()
      }
    }

    if (debounce) {
      const handler = setTimeout(revalidationLogic, debounce)
      return () => clearTimeout(handler)
    }

    revalidationLogic()
  }, [
    resolvedKey,
    serialize(optionsConfig),
    revalidateOnMount,
    auto,
    canRevalidate,
    url,
    initializeRevalidation,
    setLoading,
    setError,
    debounce
  ])

  if (suspense) {
    if (auto) {
      if (windowExists) {
        if (!suspenseInitialized.get(resolvedKey)) {
          if (!suspenseRevalidationStarted.get(resolvedKey)) {
            suspenseRevalidationStarted.set(
              resolvedKey,
              initializeRevalidation()
            )
          }

          throw suspenseRevalidationStarted.get(resolvedKey)
        }
      }

      if (!hasInitialOrFallbackData) {
        throw new Error(
          `Request with id "${id}" uses suspense but no fallback data was provided for SSR. See https://httpr.vercel.app/docs/fetch_config/defaults.

If you want to use suspense without fallback data, wrap with the <Suspense> component from 'http-react', which renders <React.Suspense> client-side and the fallback ui server-side:

import { Suspense } from "http-react"

Learn more: https://httpr.vercel.app/docs/api#suspense

          `
        )
      }
    }
  }

  useEffect(() => {
    function addFocusListener() {
      if (revalidateOnFocus && windowExists) {
        if ('addEventListener' in window) {
          window.addEventListener('focus', reValidate as any)
        }
      }
    }

    if (auto) addFocusListener()

    return () => {
      if (windowExists) {
        if ('addEventListener' in window) {
          window.removeEventListener('focus', reValidate as any)
        }
      }
    }
  }, [revalidateOnFocus, auto, reValidate])

  const __config = {
    ...config,
    ...optionsConfig,
    ...previousProps.get(resolvedKey),
    params: {
      ...reqParams,
      ...previousProps.get(resolvedKey)?.params
    },
    headers: {
      ...requestHeaders,
      ...previousProps.get(resolvedKey)?.headers
    },
    body: config.body,
    baseUrl: ctx.baseUrl || config.baseUrl,
    url: configUrl?.realUrl?.replace('?', ''),
    rawUrl: configUrl?.rawUrl,
    query: {
      ...reqQuery,
      ...previousProps.get(resolvedKey)?.query
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

  const isFailed =
    hasErrors.get(resolvedDataKey) || hasErrors.get(resolvedKey) || error

  const dataCandidate =
    (error && isFailed ? (cacheIfError ? data : null) : data) ?? def

  const responseData = isDefined(dataCandidate)
    ? transform!(dataCandidate)
    : dataCandidate

  const isSuccess = !isLoading && !isFailed

  const oneRequestResolved =
    !loadingFirst &&
    (hasData.get(resolvedDataKey) ||
      hasData.get(resolvedKey) ||
      (cacheIfError ? isDefined(responseData) && notNull(responseData) : false))

  const submit = useCallback(
    (form: FormData) => {
      if (isFormData(form)) {
        if (formRef.current) {
          if (onSubmit) {
            if (onSubmit !== 'reset') {
              onSubmit(formRef.current, form)
            } else {
              if (formRef.current) {
                formRef.current.reset()
              }
            }
          }
        }
      }
      temporaryFormData.set(
        resolvedKey,
        isFormData(form) ? form : serialize(form)
      )
      reValidate()
    },
    [resolvedKey, onSubmit, reValidate]
  )

  function resetError() {
    hasErrors.set(resolvedKey, false)
    hasErrors.set(resolvedDataKey, false)

    requestsProvider.emit(resolvedKey, {
      error: false
    })
  }

  const refreshRequest = useCallback(() => {
    revalidate(id)
  }, [id])

  return {
    get resetError() {
      thisDeps.error = true
      return resetError
    },
    formProps: {
      action: submit,
      ref: formRef
    },
    formRef,
    get revalidating() {
      thisDeps.loading = true
      return oneRequestResolved && isLoading
    },
    get isRevalidating() {
      thisDeps.loading = true
      return oneRequestResolved && isLoading
    },
    get hasData() {
      thisDeps.data = true
      return oneRequestResolved
    },
    get success() {
      thisDeps.loading = true
      thisDeps.error = true
      return isSuccess
    },
    get loadingFirst() {
      thisDeps.loading = true
      return loadingFirst
    },
    get isLoadingFirst() {
      thisDeps.loading = true
      return loadingFirst
    },
    get requestStart() {
      thisDeps.loading = true
      return getDateIfValid($requestStart)
    },
    get requestEnd() {
      thisDeps.loading = true
      return getDateIfValid($requestEnd)
    },
    get expiration() {
      thisDeps.loading = true
      return getDateIfValid(isFailed ? null : expirationDate)
    },
    get responseTime() {
      thisDeps.loading = true
      return requestResponseTimes.get(resolvedDataKey) ?? null
    },
    get data() {
      thisDeps.data = true
      return responseData
    },
    get loading() {
      thisDeps.loading = true
      return isLoading
    },
    get isLoading() {
      thisDeps.loading = true
      return isLoading
    },
    get isPending() {
      thisDeps.loading = true
      return isLoading
    },
    get error() {
      thisDeps.error = true
      return isFailed || false
    },
    get online() {
      thisDeps.online = true
      return online
    },
    get code() {
      thisDeps.loading = true
      return statusCodes.get(resolvedKey)
    },
    refresh: refreshRequest,
    get reFetch() {
      thisDeps.loading = true
      return reValidate
    },
    submit,
    get mutate() {
      thisDeps.data = true
      return forceMutate
    },
    get fetcher() {
      return imperativeFetch
    },
    get abort() {
      return () => {
        abortControllers.get(resolvedKey)?.abort()
        if (loading) {
          setError(false)
          hasErrors.set(resolvedDataKey, false)
          setLoading(false)
          setData(requestCache)
          requestsProvider.emit(resolvedKey, {
            requestCallId,
            error: false,
            loading: false,
            data: requestCache
          })
        }
      }
    },
    config: __config,
    get response() {
      thisDeps.loading = true
      return lastResponses.get(resolvedKey)
    },
    id,
    /**
     * The request key
     */
    key: id
  } as unknown as {
    refresh(): void
    resetError(): void
    formProps: {
      action: (form: FormData) => Promise<void>
      ref: typeof formRef
    }
    formRef: typeof formRef
    hasData: boolean
    /**
     * Revalidating means that at least one request has finished succesfuly and a new request is being sent
     */
    revalidating: boolean
    success: boolean
    loadingFirst: boolean
    isLoadingFirst: boolean
    expiration: Date
    data: 0 extends 1 & TransformData ? FetchDataType : TransformData
    isPending?: boolean
    loading: boolean
    isLoading: boolean
    isRevalidating: boolean
    error: any
    online: boolean
    code: number
    reFetch: () => Promise<void>
    submit: (submitData: any) => Promise<void>
    mutate: (
      update: FetchDataType | ((prev: FetchDataType) => FetchDataType),
      callback?: (data: FetchDataType, fetcher: ImperativeFetch) => void
    ) => FetchDataType
    fetcher: ImperativeFetch
    abort: () => void
    config: Required<FetchConfigType<FetchDataType, TransformData>> & {
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
