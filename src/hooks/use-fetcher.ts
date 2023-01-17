import * as React from 'react'
import { useState, useEffect } from 'react'

import {
  abortControllers,
  cacheForMutation,
  defaultCache,
  fetcherDefaults,
  hasErrors,
  previousConfig,
  previousProps,
  requestEmitter,
  resolvedHookCalls,
  runningRequests,
  suspenseInitialized,
  urls,
  useHRFContext,
  valuesMemory,
  willSuspend
} from '../internal'

import { DEFAULT_RESOLVER, METHODS } from '../internal/constants'

import {
  CustomResponse,
  FetcherConfigType,
  FetcherConfigTypeNoUrl,
  HTTP_METHODS,
  ImperativeFetcher
} from '../types'

import {
  canHaveBody,
  createImperativeFetcher,
  createRequestFn,
  hasBaseUrl,
  isDefined,
  isFormData,
  isFunction,
  queue,
  revalidate,
  serialize,
  setURLParams,
  windowExists
} from '../utils'

/**
 * Fetcher hook
 */
export function useFetcher<FetchDataType = any, BodyType = any>(
  init: FetcherConfigType<FetchDataType, BodyType> | string,
  options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
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
    revalidateOnMount = ctx.revalidateOnMount,
    url = '',
    id,

    query = {},
    params = {},
    baseUrl = undefined,
    method = METHODS.GET as HTTP_METHODS,
    headers = {} as Headers,
    body = undefined as unknown as Body,
    formatBody = (e) => JSON.stringify(e),

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

  const { cache: $cache = defaultCache } = ctx

  const { cache = $cache } = optionsConfig

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

  const idString = serialize(id)

  const [reqQuery, setReqQuery] = useState({
    ...ctx.query,
    ...config.query
  })

  const [reqParams, setReqParams] = useState({
    ...ctx.params,
    ...config.params
  })

  const rawUrl =
    (hasBaseUrl(url)
      ? ''
      : !isDefined(config.baseUrl)
      ? !isDefined(ctx.baseUrl)
        ? ''
        : ctx.baseUrl
      : config.baseUrl) + url

  const urlWithParams = React.useMemo(
    () => setURLParams(rawUrl, reqParams),
    [serialize(reqParams), config.baseUrl, ctx.baseUrl, url]
  )

  const resolvedKey = serialize(
    isDefined(id)
      ? {
          idString
        }
      : {
          uri: rawUrl,
          config: {
            method: config?.method
          }
        }
  )

  const [configUrl, setConfigUrl] = useState(urls[resolvedKey])

  useEffect(() => {
    setConfigUrl(urls[resolvedKey])
  }, [serialize(urls[resolvedKey])])

  const suspense = $suspense || willSuspend[resolvedKey]

  const realUrl = urlWithParams + (urlWithParams.includes('?') ? `` : '?')

  if (!isDefined(previousProps[resolvedKey])) {
    if (url !== '') {
      previousProps[resolvedKey] = optionsConfig
    }
  }

  useEffect(() => {
    if (url !== '') {
      setReqParams(() => {
        const newParams = {
          ...ctx.params,
          ...config.params
        }
        return newParams
      })
    }
  }, [serialize({ ...ctx.params, ...config.params }), resolvedKey])

  const stringDeps = serialize(
    // We ignore children and resolver
    Object.assign(
      ctx,
      { children: undefined },
      config?.headers,
      config?.method,
      config?.body,
      config?.query,
      config?.params,
      { resolver: undefined },
      { reqQuery },
      { reqParams }
    )
  )

  const [resKey, qp] = realUrl.split('?')

  // This helps pass default values to other useFetcher calls using the same id
  useEffect(() => {
    if (isDefined(optionsConfig.default)) {
      if (!isDefined(fetcherDefaults[resolvedKey])) {
        if (url !== '') {
          if (!isDefined(cache.get(resolvedKey))) {
            fetcherDefaults[resolvedKey] = optionsConfig.default
          }
        } else {
          if (!isDefined(cache.get(resolvedKey))) {
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              data: optionsConfig.default
            })
          }
        }
      }
    } else {
      if (isDefined(fetcherDefaults[resolvedKey])) {
        if (!isDefined(cache.get(resolvedKey))) {
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

  useEffect(() => {
    let queryParamsFromString: any = {}
    try {
      // getting query params from passed url
      const queryParts = qp.split('&')
      queryParts.forEach((q, i) => {
        const [key, value] = q.split('=')
        if (queryParamsFromString[key] !== value) {
          queryParamsFromString[key] = `${value}`
        }
      })
    } finally {
      if (url !== '') {
        setReqQuery(() => {
          const newQuery = {
            ...ctx.query,
            ...queryParamsFromString,
            ...config.query
          }
          return newQuery
        })
      }
    }
  }, [
    resolvedKey,
    requestCallId,
    serialize({
      qp,
      ...ctx.query,
      ...config.query
    })
  ])

  const requestCache = cache.get(resolvedKey)

  const initialDataValue = isDefined(valuesMemory[resolvedKey])
    ? valuesMemory[resolvedKey]
    : isDefined(cache.get(resolvedKey))
    ? cache.get(resolvedKey)
    : def

  const [data, setData] = useState<FetchDataType | undefined>(
    memory ? initialDataValue : def
  )

  // Used JSON as deppendency instead of directly using a reference to data
  const rawJSON = serialize(data)

  const [online, setOnline] = useState(true)

  const [requestHeaders, setRequestHeades] = useState<
    object | Headers | undefined
  >({ ...ctx.headers, ...config.headers })

  const [response, setResponse] = useState<CustomResponse<FetchDataType>>()

  const [statusCode, setStatusCode] = useState<number>()
  const [error, setError] = useState<any>(hasErrors[resolvedKey])
  const [loading, setLoading] = useState(
    revalidateOnMount
      ? true
      : previousConfig[resolvedKey] !== serialize(optionsConfig)
  )
  const [completedAttempts, setCompletedAttempts] = useState(0)
  const [requestAbortController, setRequestAbortController] =
    useState<AbortController>(new AbortController())

  const [reqMethod, setReqMethod] = useState(config.method)

  useEffect(() => {
    if (url !== '') {
      setReqMethod(config.method)
      requestEmitter.emit(resolvedKey, {
        requestCallId,
        method: config.method
      })
    }
  }, [stringDeps, response, requestAbortController, requestCallId])

  useEffect(() => {
    if (url !== '') {
      if (error && !hasErrors[resolvedKey]) {
        requestEmitter.emit(resolvedKey, {
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
      requestEmitter.emit(resolvedKey, {
        config: c
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
          setReqMethod(config.method)
          if (url !== '') {
            const newUrls = {
              realUrl,
              rawUrl
            }

            urls[resolvedKey] = newUrls

            setConfigUrl({
              rawUrl,
              realUrl
            })
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              realUrl: resKey,
              rawUrl
            })
          }
        })
        if (!runningRequests[resolvedKey]) {
          previousConfig[resolvedKey] = serialize(optionsConfig)
          runningRequests[resolvedKey] = true
          setLoading(true)
          let newAbortController = new AbortController()
          setRequestAbortController(newAbortController)
          setError(null)
          hasErrors[resolvedKey] = null
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            loading,
            requestAbortController: newAbortController,
            error: null
          })
          abortControllers[resolvedKey] = newAbortController
          try {
            const json = await fetch(realUrl + c.query, {
              signal: newAbortController.signal,
              method: config.method,
              headers: {
                'Content-Type':
                  // If body is form-data, set Content-Type header to 'multipart/form-data'
                  isFormData(config.body)
                    ? 'multipart/form-data'
                    : 'application/json',
                ...ctx.headers,
                ...config.headers,
                ...c.headers
              } as Headers,
              body: canHaveBody(config.method)
                ? isFunction(config.formatBody)
                  ? (config.formatBody as any)(
                      (isFormData(config.body)
                        ? (config.body as BodyType)
                        : { ...config.body, ...c.body }) as BodyType
                    )
                  : config.formatBody === false || isFormData(config.body)
                  ? config.body
                  : serialize({ ...config.body, ...c.body })
                : undefined
            })

            requestEmitter.emit(resolvedKey, {
              requestCallId,
              response: json
            })
            const code = json.status
            setStatusCode(code)
            requestEmitter.emit(resolvedKey, {
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
                  ;(onError as any)(true)
                }
              }
              if (memory) {
                cache.set(resolvedKey, __data)
                valuesMemory[resolvedKey] = __data
              }

              requestEmitter.emit(resolvedKey, {
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
                ;(onResolve as any)(__data, json)
              }
              runningRequests[resolvedKey] = false
              // If a request completes succesfuly, we reset the error attempts to 0
              setCompletedAttempts(0)
              queue(() => {
                cacheForMutation[resolvedKey] = __data
              })
            } else {
              if (_data.errors && isGqlRequest) {
                setData((previous) => {
                  const newData = {
                    ...previous,
                    variables: (optionsConfig as any)?.variables,
                    errors: _data.errors
                  } as any
                  cacheForMutation[idString] = newData
                  requestEmitter.emit(resolvedKey, {
                    requestCallId,
                    data: newData,
                    error: true
                  })
                  cache.set(resolvedKey, newData)
                  return newData
                })
                if (handleError) {
                  ;(onError as any)(true, json)
                }
              } else {
                if (def) {
                  setData(def)
                  cacheForMutation[idString] = def
                  requestEmitter.emit(resolvedKey, {
                    requestCallId,
                    data: def
                  })
                }
                if (handleError) {
                  ;(onError as any)(_data, json)
                }
                requestEmitter.emit(resolvedKey, {
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
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                error: _error
              })
              if (!isDefined(cache.get(resolvedKey))) {
                setData(def)
                cacheForMutation[idString] = def
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: def
                })
              } else {
                setData(requestCache)
                cacheForMutation[idString] = requestCache
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: requestCache
                })
              }
              setError(_error)
              hasErrors[resolvedKey] = true
              if (handleError) {
                ;(onError as any)(err as any)
              }
            } else {
              if (!isDefined(cache.get(resolvedKey))) {
                if (isDefined(def)) {
                  setData(def)
                  cacheForMutation[idString] = def
                }
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: def
                })
              }
            }
          } finally {
            setLoading(false)
            runningRequests[resolvedKey] = false
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              loading: false
            })
            suspenseInitialized[resolvedKey] = true
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
        if (runningRequests[resolvedKey]) {
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

  const imperativeFetcher = React.useMemo(() => {
    const __headers = {
      ...ctx.headers,
      ...config.headers
    }

    const __params = {
      ...ctx.params,
      ...config.params
    }

    const __baseUrl = isDefined(config.baseUrl) ? config.baseUrl : ctx.baseUrl
    return createImperativeFetcher({
      ...ctx,
      headers: __headers,
      baseUrl: __baseUrl,
      params: __params
    })
  }, [serialize(ctx)])

  if (willResolve) {
    if (resolvedHookCalls[resolvedKey]) {
      if (isDefined(cache.get(resolvedKey))) {
        if (!suspense) {
          ;(onResolve as any)(cache.get(resolvedKey) as any, response)
        }
        queue(() => {
          delete resolvedHookCalls[resolvedKey]
        })
      }
    }
  }

  useEffect(() => {
    async function waitFormUpdates(v: any) {
      if (v.requestCallId !== requestCallId) {
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
        } = v

        if (isDefined(isResolved)) {
          resolvedHookCalls[resolvedKey] = true
        }
        if (isDefined(method)) {
          queue(() => {
            setReqMethod(method)
          })
        }
        if (isDefined(config?.query)) {
          queue(() => {
            setReqQuery(config.query)
          })
        }
        if (isDefined(rawUrl) && isDefined(realUrl)) {
          queue(() => {
            setConfigUrl({
              rawUrl,
              realUrl
            })
          })
        }
        if (isDefined(config?.params)) {
          queue(() => {
            setReqParams(config?.params)
          })
        }
        if (isDefined(config?.headers)) {
          queue(() => {
            setRequestHeades(config?.headers)
          })
        }
        if (isDefined(completedAttempts)) {
          queue(() => {
            setCompletedAttempts(completedAttempts)
          })
        }
        if (isDefined(code)) {
          queue(() => {
            setStatusCode(code)
          })
        }
        if (isDefined(requestAbortController)) {
          queue(() => {
            setRequestAbortController(requestAbortController)
          })
        }
        if (isDefined(response)) {
          queue(() => {
            setResponse(response)
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
            cache.set(resolvedKey, $data)
            if (serialize($data) !== serialize(cacheForMutation[resolvedKey])) {
              cacheForMutation[idString] = data
              if (isMutating) {
                if (handleMutate) {
                  ;(onMutate as any)($data, imperativeFetcher)
                }
              }
            }
          })
        }
        if (isDefined($error)) {
          queue(() => {
            setError($error)
            if ($error !== null) {
              hasErrors[resolvedKey] = true
              if (handleError) {
                ;(onError as any)($error)
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

    requestEmitter.addListener(resolvedKey, waitFormUpdates)

    return () => {
      requestEmitter.removeListener(resolvedKey, waitFormUpdates)
    }
  }, [
    resolvedKey,
    data,
    imperativeFetcher,
    reqMethod,
    id,
    error,
    requestCallId,
    stringDeps,
    onResolve
  ])

  const reValidate = React.useCallback(
    async function reValidate() {
      revalidate(id)
    },
    [
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
            cache.set(resolvedKey, d)
            valuesMemory[resolvedKey] = d
          }
        } catch (err) {}
      } else {
        setLoading(true)
        setError(null)
        hasErrors[resolvedKey] = null
        if (!runningRequests[resolvedKey]) {
          // We are preventing revalidation where we only need updates about
          // 'loading', 'error' and 'data' because the url can be ommited.
          if (url !== '') {
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              loading: true,
              error: null
            })
            const reqQ = {
              ...ctx.query,
              ...config.query
            }
            const reqP = {
              ...ctx.params,
              ...config.params
            }
            fetchData({
              query: Object.keys(reqQ)
                .map((q) => [q, reqQ[q]].join('='))
                .join('&'),
              params: reqP
            })
          }
        }
      }
    }
    let idString = serialize(id)
    requestEmitter.addListener(idString, forceRefresh)
    return () => {
      requestEmitter.removeListener(idString, forceRefresh)
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
      requestEmitter.emit(resolvedKey, {
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
      requestEmitter.emit(resolvedKey, {
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
    const newHeaders = {
      ...ctx.headers,
      ...config.headers
    }
    setRequestHeades(newHeaders)
  }, [serialize({ ...ctx.headers, ...config.headers }), resolvedKey])

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
          setCompletedAttempts((previousAttempts) => {
            let newAttemptsValue = previousAttempts + 1

            requestEmitter.emit(resolvedKey, {
              requestCallId,
              completedAttempts: newAttemptsValue
            })

            return newAttemptsValue
          })
        } else if (completedAttempts === attempts) {
          requestEmitter.emit(resolvedKey, {
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

  const initMemo = React.useMemo(() => serialize(optionsConfig), [])

  const initializeRevalidation = React.useCallback(
    async function initializeRevalidation() {
      if (auto) {
        if (url !== '') {
          if (runningRequests[resolvedKey]) {
            setLoading(true)
          }
          const reqQ = {
            ...ctx.query,
            ...config.query
          }
          const reqP = {
            ...ctx.params,
            ...config.params
          }
          fetchData({
            query: Object.keys(reqQ)
              .map((q) => [q, reqQ[q]].join('='))
              .join('&'),
            params: reqP
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
    suspenseInitialized[resolvedKey] = true
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
    if (suspense) {
      if (previousConfig[resolvedKey] !== serialize(optionsConfig)) {
        if (suspenseInitialized[resolvedKey]) {
          initializeRevalidation()
        }
      }
    } else {
      if (
        revalidateOnMount
          ? true
          : previousConfig[resolvedKey] !== serialize(optionsConfig)
      ) {
        initializeRevalidation()
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
    // ctx.children,
    refresh,
    serialize(config)
  ])

  const __config = {
    ...config,
    method: reqMethod,
    params: reqParams,
    headers: requestHeaders,
    body: config.body,
    baseUrl: ctx.baseUrl || config.baseUrl,
    url: configUrl?.realUrl,
    rawUrl: configUrl?.rawUrl,
    query: reqQuery
  }

  function forceMutate(
    newValue: FetchDataType | ((prev: FetchDataType) => FetchDataType),
    callback: (
      data: FetchDataType,
      fetcher: ImperativeFetcher
    ) => void = () => {}
  ) {
    if (!isFunction(newValue)) {
      if (serialize(cache.get(resolvedKey)) !== serialize(newValue)) {
        if (handleMutate) {
          ;(onMutate as any)(newValue, imperativeFetcher)
        }
        callback(newValue as any, imperativeFetcher)
        cache.set(resolvedKey, newValue)
        valuesMemory[resolvedKey] = newValue
        cacheForMutation[idString] = newValue
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          isMutating: true,
          data: newValue
        })
        setData(newValue as any)
      }
    } else {
      let newVal = (newValue as any)(data)
      if (serialize(cache.get(resolvedKey)) !== serialize(newVal)) {
        if (handleMutate) {
          ;(onMutate as any)(newVal, imperativeFetcher)
        }
        callback(newVal, imperativeFetcher)
        cache.set(resolvedKey, newVal)
        valuesMemory[resolvedKey] = newVal
        cacheForMutation[idString] = newVal
        requestEmitter.emit(resolvedKey, {
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
      fetcher: imperativeFetcher,
      props: optionsConfig,
      previousProps: previousProps[resolvedKey]
    }

    if (serialize(previousProps[resolvedKey]) !== serialize(optionsConfig)) {
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
  }, [
    url,
    auto,
    cancelOnChange,
    serialize(id),
    serialize(optionsConfig),
    resolvedKey
  ])

  const resolvedData = React.useMemo(() => data, [rawJSON])

  return {
    data: resolvedData,
    loading,
    error,
    online,
    code: statusCode,
    reFetch: reValidate,
    mutate: forceMutate,
    fetcher: imperativeFetcher,
    abort: () => {
      abortControllers[resolvedKey]?.abort()
      if (loading) {
        setError(null)
        hasErrors[resolvedKey] = null
        setLoading(false)
        setData(requestCache)
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          error: false,
          loading: false,
          data: requestCache
        })
      }
    },
    config: __config,
    response,
    id,
    /**
     * The request key
     */
    key: resolvedKey
  } as unknown as {
    data: FetchDataType
    loading: boolean
    error: Error | null
    online: boolean
    code: number
    reFetch: () => Promise<void>
    mutate: (
      update: FetchDataType | ((prev: FetchDataType) => FetchDataType),
      callback?: (data: FetchDataType, fetcher: ImperativeFetcher) => void
    ) => FetchDataType
    fetcher: ImperativeFetcher
    abort: () => void
    config: FetcherConfigType<FetchDataType, BodyType> & {
      baseUrl: string
      url: string
      rawUrl: string
    }
    response: CustomResponse<FetchDataType>
    id: any
    key: string
  }
}

useFetcher.get = createRequestFn('GET', '', {})
useFetcher.delete = createRequestFn('DELETE', '', {})
useFetcher.head = createRequestFn('HEAD', '', {})
useFetcher.options = createRequestFn('OPTIONS', '', {})
useFetcher.post = createRequestFn('POST', '', {})
useFetcher.put = createRequestFn('PUT', '', {})
useFetcher.patch = createRequestFn('PATCH', '', {})
useFetcher.purge = createRequestFn('PURGE', '', {})
useFetcher.link = createRequestFn('LINK', '', {})
useFetcher.unlink = createRequestFn('UNLINK', '', {})
