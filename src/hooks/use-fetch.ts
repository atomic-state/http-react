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
  requestResponseTimes
} from '../internal'

import { DEFAULT_RESOLVER, METHODS } from '../internal/constants'

import {
  CustomResponse,
  FetchConfigType,
  FetchConfigTypeNoUrl,
  HTTP_METHODS,
  ImperativeFetch
} from '../types'

import {
  createImperativeFetch,
  createRequestFn,
  getTimePassed,
  hasBaseUrl,
  isDefined,
  isFunction,
  queue,
  revalidate,
  serialize,
  setURLParams,
  windowExists
} from '../utils'

/**
 * Fetch hook
 */
export function useFetch<FetchDataType = any, BodyType = any>(
  init: FetchConfigType<FetchDataType, BodyType> | string,
  options?: FetchConfigTypeNoUrl<FetchDataType, BodyType>
) {
  const ctx = useHRFContext()

  const optionsConfig =
    typeof init === 'string'
      ? {
          // Pass init as the url if init is a string
          url: init,
          ...options
        }
      : init

  const {
    onOnline = ctx.onOnline,
    onOffline = ctx.onOffline,
    onMutate,
    onPropsChange,
    revalidateOnMount = isDefined(options) ? ctx.revalidateOnMount : false,
    url = '',
    query = {},
    params = {},
    baseUrl = undefined,
    method = METHODS.GET as HTTP_METHODS,
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
    cancelOnChange = false,
    attempts = ctx.attempts,
    attemptInterval = ctx.attemptInterval,
    revalidateOnFocus = ctx.revalidateOnFocus,
    suspense: $suspense
  } = optionsConfig

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

  const { cacheProvider = $cacheProvider } = optionsConfig

  const requestCallId = React.useMemo(
    () => `${Math.random()}`.split('.')[1],
    []
  )

  const willResolve = isDefined(onResolve)
  const handleError = isDefined(onError)
  const handlePropsChange = isDefined(onPropsChange)
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

  const suspense = $suspense || willSuspend[resolvedKey]

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

  const [resKey, qp] = realUrl.split('?')

  // This helps pass default values to other useFetch calls using the same id
  useEffect(() => {
    if (isDefined(optionsConfig.default)) {
      if (!isDefined(fetcherDefaults[resolvedKey])) {
        if (url !== '') {
          if (!isDefined(cacheProvider.get(resolvedKey))) {
            fetcherDefaults[resolvedKey] = optionsConfig.default
          }
        } else {
          if (!isDefined(cacheProvider.get(resolvedKey))) {
            requestsProvider.emit(resolvedKey, {
              requestCallId,
              data: optionsConfig.default
            })
          }
        }
      }
    } else {
      if (isDefined(fetcherDefaults[resolvedKey])) {
        if (!isDefined(cacheProvider.get(resolvedKey))) {
          setData(fetcherDefaults[resolvedKey])
        }
      }
    }
  }, [resolvedKey])

  const def =
    resolvedKey in fetcherDefaults
      ? fetcherDefaults[resolvedKey]
      : optionsConfig.default

  useEffect(() => {
    if (!auto) {
      runningRequests[resolvedKey] = false
    }
  }, [])

  const requestCache = cacheProvider.get(resolvedKey)

  const initialDataValue = isDefined(valuesMemory[resolvedKey])
    ? valuesMemory[resolvedKey]
    : isDefined(cacheProvider.get(resolvedKey))
    ? cacheProvider.get(resolvedKey)
    : def

  const [data, setData] = useState<FetchDataType | undefined>(
    memory ? initialDataValue : def
  )

  // Used JSON as deppendency instead of directly using a reference to data
  const rawJSON = serialize(data)

  const [online, setOnline] = useState(true)

  const requestHeaders = {
    ...ctx.headers,
    ...config.headers
  }

  const [error, setError] = useState<any>(hasErrors[resolvedKey])
  const [loading, setLoading] = useState(
    revalidateOnMount
      ? suspense
        ? isPending(resolvedKey)
        : true
      : previousConfig[resolvedKey] !== serialize(optionsConfig)
  )
  const [completedAttempts, setCompletedAttempts] = useState(0)

  const [requestAbortController, setRequestAbortController] =
    useState<AbortController>(new AbortController())

  useEffect(() => {
    if (url !== '') {
      if (error && !hasErrors[resolvedKey]) {
        requestsProvider.emit(resolvedKey, {
          requestCallId,
          error: error
        })
      }
    }
  }, [url, error, resolvedKey, requestCallId])

  const isGqlRequest = isDefined((optionsConfig as any)['__gql'])

  const fetchData = React.useCallback(
    async function fetchData(
      c: { headers?: any; body?: BodyType; query?: any; params?: any } = {}
    ) {
      requestsProvider.emit(resolvedKey, {
        config: {
          query: {
            ...ctx.query,
            ...config.query
          },
          params: {
            ...ctx.params,
            ...config.params
          }
        }
      })

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

      const [resKey] = realUrl.split('?')

      if (previousConfig[resolvedKey] !== serialize(optionsConfig)) {
        previousProps[resolvedKey] = optionsConfig
        queue(() => {
          if (url !== '') {
            const newUrls = {
              realUrl,
              rawUrl
            }

            urls[resolvedKey] = newUrls

            requestsProvider.emit(resolvedKey, {
              requestCallId,
              realUrl: resKey,
              rawUrl
            })
          }
        })
        if (!isPending(resolvedKey)) {
          previousConfig[resolvedKey] = serialize(optionsConfig)
          runningRequests[resolvedKey] = true
          setLoading(true)
          let newAbortController = new AbortController()
          setRequestAbortController(newAbortController)
          setError(null)
          hasErrors[resolvedKey] = null
          requestsProvider.emit(resolvedKey, {
            requestCallId,
            loading,
            requestAbortController: newAbortController,
            error: null
          })
          abortControllers[resolvedKey] = newAbortController
          try {
            const json = await fetch(realUrl + c.query, {
              ...ctx,
              signal: (() => {
                requestInitialTimes[resolvedKey] = Date.now()
                return newAbortController.signal
              })(),
              ...optionsConfig,
              body: isFunction(formatBody)
                ? // @ts-ignore // If formatBody is a function
                  formatBody(optionsConfig?.body as any)
                : optionsConfig?.body,
              headers: {
                'Content-Type': 'application/json',
                ...ctx.headers,
                ...config.headers,
                ...c.headers
              } as Headers
            })
            requestResponseTimes[resolvedKey] = getTimePassed(resolvedKey)

            lastResponses[resolvedKey] = json

            const code = json.status
            statusCodes[resolvedKey] = code

            requestsProvider.emit(resolvedKey, {
              requestCallId,
              response: json
            })
            requestsProvider.emit(resolvedKey, {
              requestCallId,
              code
            })
            const _data = await (resolver as any)(json)
            if (code >= 200 && code < 400) {
              let __data = isGqlRequest
                ? {
                    ..._data,
                    variables: (optionsConfig as any)?.variables,
                    errors: _data?.errors ? _data.errors : undefined
                  }
                : _data

              if (_data?.errors && isGqlRequest) {
                setError(true)
                hasErrors[resolvedKey] = true
                if (handleError) {
                  if (!resolvedOnErrorCalls[resolvedKey]) {
                    resolvedOnErrorCalls[resolvedKey] = true
                    ;(onError as any)(true)
                  }
                }
              }
              if (memory) {
                cacheProvider.set(resolvedKey, __data)
                valuesMemory[resolvedKey] = __data
              }

              requestsProvider.emit(resolvedKey, {
                requestCallId,
                data: __data,
                isResolved: true,
                loading: false,
                error: _data?.errors && isGqlRequest ? true : null,
                variables: isGqlRequest
                  ? (optionsConfig as any)?.variables || {}
                  : undefined,
                completedAttempts: 0
              })

              setData(__data)
              cacheForMutation[idString] = __data

              if (!_data?.errors && isGqlRequest) {
                setError(null)
                hasErrors[resolvedKey] = null
              }
              setLoading(false)
              if (willResolve) {
                if (!resolvedHookCalls[resolvedKey]) {
                  ;(onResolve as any)(__data, lastResponses[resolvedKey])
                  resolvedHookCalls[resolvedKey] = true
                }
              }
              runningRequests[resolvedKey] = false
              // If a request completes succesfuly, we reset the error attempts to 0
              setCompletedAttempts(0)
              queue(() => {
                cacheForMutation[resolvedKey] = __data
              })
            } else {
              if (_data.errors && isGqlRequest) {
                setData(previous => {
                  const newData = {
                    ...previous,
                    variables: (optionsConfig as any)?.variables,
                    errors: _data.errors
                  } as any
                  cacheForMutation[idString] = newData
                  requestsProvider.emit(resolvedKey, {
                    requestCallId,
                    data: newData,
                    error: true
                  })
                  cacheProvider.set(resolvedKey, newData)
                  return newData
                })
                if (handleError) {
                  if (!resolvedOnErrorCalls[resolvedKey]) {
                    resolvedOnErrorCalls[resolvedKey] = true
                    ;(onError as any)(true, json)
                  }
                }
              } else {
                if (def) {
                  setData(def)
                  cacheForMutation[idString] = def
                  requestsProvider.emit(resolvedKey, {
                    requestCallId,
                    data: def
                  })
                }
                if (handleError) {
                  if (!resolvedOnErrorCalls[resolvedKey]) {
                    resolvedOnErrorCalls[resolvedKey] = true
                    ;(onError as any)(_data, json)
                  }
                }
                requestsProvider.emit(resolvedKey, {
                  requestCallId,
                  error: true
                })
              }
              setError(true)
              hasErrors[resolvedKey] = true
              runningRequests[resolvedKey] = false
            }
          } catch (err) {
            const errorString = err?.toString()
            // Only set error if no abort
            if (!`${errorString}`.match(/abort/i)) {
              let _error = new Error(err as any)
              requestsProvider.emit(resolvedKey, {
                requestCallId,
                error: _error
              })
              if (!isDefined(cacheProvider.get(resolvedKey))) {
                setData(def)
                cacheForMutation[idString] = def
                requestsProvider.emit(resolvedKey, {
                  requestCallId,
                  data: def
                })
              } else {
                setData(requestCache)
                cacheForMutation[idString] = requestCache
                requestsProvider.emit(resolvedKey, {
                  requestCallId,
                  data: requestCache
                })
              }
              setError(_error)
              hasErrors[resolvedKey] = true
              if (handleError) {
                if (!resolvedOnErrorCalls[resolvedKey]) {
                  resolvedOnErrorCalls[resolvedKey] = true
                  ;(onError as any)(err as any)
                }
              }
            } else {
              if (!isDefined(cacheProvider.get(resolvedKey))) {
                if (isDefined(def)) {
                  setData(def)
                  cacheForMutation[idString] = def
                }
                requestsProvider.emit(resolvedKey, {
                  requestCallId,
                  data: def
                })
              }
            }
          } finally {
            setLoading(false)
            queue(() => {
              canDebounce[resolvedKey] = true
            }, debounce)
            runningRequests[resolvedKey] = false
            requestsProvider.emit(resolvedKey, {
              requestCallId,
              loading: false
            })
            suspenseInitialized[resolvedKey] = true
            resolvedOnErrorCalls[resolvedKey] = true
          }
        }
      }
    },
    [
      auto,
      ctx.auto,
      stringDeps,
      resolvedKey,
      config.method,
      serialize(optionsConfig),
      realUrl,
      requestCallId,
      memory,
      def
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

  if (willResolve) {
    if (resolvedHookCalls[resolvedKey]) {
      if (isDefined(cacheProvider.get(resolvedKey))) {
        queue(() => {
          resolvedHookCalls[resolvedKey] = undefined
        })
      }
    }
    if (resolvedOnErrorCalls[resolvedKey]) {
      queue(() => {
        resolvedOnErrorCalls[resolvedKey] = undefined
      })
    }
  }

  useEffect(() => {
    async function waitFormUpdates(v: any) {
      const {
        isMutating,
        data: $data,
        error: $error,
        isResolved,
        online,
        loading,
        response,
        requestAbortController,
        code,
        config,
        rawUrl,
        realUrl,
        method,
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
        if (isDefined(isResolved)) {
          if (willResolve) {
            // onResolve($data, lastResponses[resolvedKey])
          }
        }
        if (isDefined(completedAttempts)) {
          queue(() => {
            setCompletedAttempts(completedAttempts)
          })
        }
        if (isDefined(requestAbortController)) {
          queue(() => {
            setRequestAbortController(requestAbortController)
          })
        }
        if (isDefined(loading)) {
          queue(() => {
            setLoading(loading)
          })
        }
        if (isDefined($data)) {
          queue(() => {
            setData($data)
            cacheProvider.set(resolvedKey, $data)
          })
        }
        if (isDefined($error)) {
          queue(() => {
            setError($error)
            if ($error !== null) {
              hasErrors[resolvedKey] = true
              if (handleError) {
                // ;(onError as any)($error)
              }
            }
          })
        }
        if (isDefined(online)) {
          queue(() => {
            setOnline(online)
          })
        }
      }
    }

    requestsProvider.addListener(resolvedKey, waitFormUpdates)

    return () => {
      requestsProvider.removeListener(resolvedKey, waitFormUpdates)
    }
  }, [JSON.stringify(optionsConfig)])

  const reValidate = React.useCallback(
    async function reValidate() {
      revalidate(id)
    },
    [
      idString,
      rawUrl,
      resolvedKey,
      requestCallId,
      stringDeps,
      cancelOnChange,
      url,
      requestAbortController,
      loading,
      auto,
      ctx.auto
    ]
  )

  useEffect(() => {
    async function forceRefresh(v: any) {
      if (isDefined(v?.data)) {
        try {
          const { data: d } = v
          if (isDefined(data)) {
            setData(d)
            cacheForMutation[idString] = d
            cacheProvider.set(resolvedKey, d)
            valuesMemory[resolvedKey] = d
          }
        } catch (err) {}
      } else {
        setLoading(true)
        setError(null)
        hasErrors[resolvedKey] = null
        if (!isPending(resolvedKey)) {
          // We are preventing revalidation where we only need updates about
          // 'loading', 'error' and 'data' because the url can be ommited.
          if (url !== '') {
            requestsProvider.emit(resolvedKey, {
              requestCallId,
              loading: true,
              error: null
            })

            fetchData({
              query: Object.keys(reqQuery)
                .map(q => [q, reqQuery[q]].join('='))
                .join('&'),
              params: reqParams
            })
          }
        }
      }
    }
    let idString = serialize(id)
    requestsProvider.addListener(idString, forceRefresh)
    return () => {
      requestsProvider.removeListener(idString, forceRefresh)
    }
  }, [
    resolvedKey,
    suspense,
    loading,
    requestCallId,
    stringDeps,
    auto,
    ctx.auto,
    idString,
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
      if (handleOnline) {
        ;(onOnline as any)({ cancel: cancelReconectionAttempt })
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
  }, [onOnline, reValidate, resolvedKey, retryOnReconnect])

  useEffect(() => {
    function wentOffline() {
      runningRequests[resolvedKey] = false
      setOnline(false)
      requestsProvider.emit(resolvedKey, {
        requestCallId,
        online: false
      })
      if (handleOffline) {
        ;(onOffline as any)()
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
  }, [onOffline, reValidate, resolvedKey, retryOnReconnect])

  useEffect(() => {
    if (revalidateOnMount) {
      if (suspense) {
        if (suspenseInitialized[resolvedKey]) {
          queue(() => {
            previousConfig[resolvedKey] = undefined
          })
        }
      } else {
        previousConfig[resolvedKey] = undefined
      }
    }
  }, [requestCallId, resolvedKey, revalidateOnMount, suspense])

  useEffect(() => {
    // Attempts will be made after a request fails
    const tm = queue(() => {
      if (error) {
        if (completedAttempts < (attempts as number)) {
          reValidate()
          setCompletedAttempts(previousAttempts => {
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
    }, (attemptInterval as number) * 1000)

    return () => {
      clearTimeout(tm)
    }
  }, [error, attempts, rawJSON, attemptInterval, completedAttempts])

  useEffect(() => {
    if (completedAttempts === 0) {
      if ((refresh as any) > 0 && auto) {
        const tm = queue(reValidate, (refresh as any) * 1000)

        return () => {
          clearTimeout(tm)
        }
      }
    }
    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, loading, error, rawJSON, completedAttempts, config])

  const { debounce } = optionsConfig

  const initializeRevalidation = React.useCallback(
    async function initializeRevalidation() {
      if (auto || canDebounce[resolvedKey]) {
        if (url !== '') {
          if (isPending(resolvedKey)) {
            setLoading(true)
          }
          fetchData({
            query: Object.keys(reqQuery)
              .map(q => [q, reqParams[q]].join('='))
              .join('&'),
            params: reqParams
          })
        }
        // It means a url is not passed
        else {
          setError(hasErrors[resolvedKey])
          setLoading(false)
        }
      } else {
        if (!isDefined(data)) {
          setData(def)
          cacheForMutation[idString] = def
        }
        setError(null)
        hasErrors[resolvedKey] = null
        setLoading(false)
      }
    },
    [serialize(serialize(optionsConfig))]
  )

  if (!suspense) {
    if (url !== '') {
      suspenseInitialized[resolvedKey] = true
    }
  }

  React.useMemo(() => {
    if (suspense) {
      if (windowExists) {
        if (!suspenseInitialized[resolvedKey]) {
          throw initializeRevalidation()
        }
      } else {
        throw {
          message:
            "Use 'SSRSuspense' instead of 'Suspense' when using SSR and suspense"
        }
      }
    }
  }, [loading, windowExists, suspense, resolvedKey, data])

  useEffect(() => {
    const revalidateAfterUnmount = revalidateOnMount
      ? true
      : previousConfig[resolvedKey] !== serialize(optionsConfig)

    let tm: any = null

    function revalidate() {
      if (debounce && canDebounce[resolvedKey]) {
        tm = queue(initializeRevalidation, debounce)
      } else {
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

    return () => {
      clearTimeout(tm)
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
    // ctx.children,
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
      if (serialize(cacheProvider.get(resolvedKey)) !== serialize(newValue)) {
        callback(newValue as any, imperativeFetch)
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
      if (serialize(cacheProvider.get(resolvedKey)) !== serialize(newVal)) {
        callback(newVal, imperativeFetch)
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

  useEffect(() => {
    const rev = {
      revalidate: () => queue(() => revalidate(id)),
      cancel: () => {
        try {
          if (url !== '') {
            if (previousConfig[resolvedKey] !== serialize(optionsConfig)) {
              requestAbortController?.abort()
            }
          }
        } catch (err) {}
      },
      fetcher: imperativeFetch,
      props: optionsConfig,
      previousProps: previousProps[resolvedKey]
    }

    queue(() => {
      if (!auto && url !== '' && debounce) {
        canDebounce[resolvedKey] = true
      }
    })

    if (serialize(previousProps[resolvedKey]) !== serialize(optionsConfig)) {
      if (debounce) {
        canDebounce[resolvedKey] = true
      }
      if (handlePropsChange) {
        ;(onPropsChange as any)(rev as any)
      }
      if (cancelOnChange) {
        ;(({ cancel, revalidate }) => {
          cancel()
          if (auto && url !== '') {
            revalidate()
          }
        })(rev)
      }
      if (url !== '') {
        previousProps[resolvedKey] = optionsConfig
      }
      if (previousConfig[resolvedKey] !== serialize(optionsConfig)) {
        if (cancelOnChange) {
          requestAbortController?.abort()
        }
      }
    }
  }, [serialize(optionsConfig)])

  const resolvedData = React.useMemo(() => data, [rawJSON])

  return {
    data: resolvedData,
    loading: isPending(resolvedKey),
    error: hasErrors[resolvedKey],
    online,
    code: statusCodes[resolvedKey],
    reFetch: reValidate,
    mutate: forceMutate,
    fetcher: imperativeFetch,
    abort: () => {
      abortControllers[resolvedKey]?.abort()
      if (loading) {
        setError(null)
        hasErrors[resolvedKey] = null
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
    key: resolvedKey,
    responseTime: requestResponseTimes[resolvedKey]
  } as unknown as {
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
