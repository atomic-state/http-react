/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
;(() => {
  class EventEmitter {
    listeners = []
    emit(eventName, data) {
      this.listeners
        .filter(({ name }) => name === eventName)
        .forEach(({ callback }) => callback(data))
    }
    addListener(name, callback) {
      if (typeof callback === 'function' && typeof name === 'string') {
        this.listeners.push({ name, callback })
      }
    }
    removeListener(eventName, callback) {
      this.listeners = this.listeners.filter(
        listener =>
          !(listener.name === eventName && listener.callback === callback)
      )
    }
    destroy() {
      this.listener.length = 0
    }
  }

  var __rest =
    (this && this.__rest) ||
    function (s, e) {
      var t = {}
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p]
      if (s != null && typeof Object.getOwnPropertySymbols === 'function')
        for (
          var i = 0, p = Object.getOwnPropertySymbols(s);
          i < p.length;
          i++
        ) {
          if (
            e.indexOf(p[i]) < 0 &&
            Object.prototype.propertyIsEnumerable.call(s, p[i])
          )
            t[p[i]] = s[p[i]]
        }
      return t
    }
  const { useState, useEffect, createContext, useContext } = React

  /**
   *
   * @param str The target string
   * @param $params The params to parse in the url
   *
   * Params should be separated by `"/"`, (e.g. `"/api/[resource]/:id"`)
   *
   * URL search params will not be affected
   */
  function setURLParams(str = '', $params = {}) {
    const hasQuery = str.includes('?')
    const queryString =
      '?' +
      str
        .split('?')
        .filter((_, i) => i > 0)
        .join('?')
    return (
      str
        .split('/')
        .map($segment => {
          const [segment] = $segment.split('?')
          if (segment.startsWith('[') && segment.endsWith(']')) {
            const paramName = segment.replace(/\[|\]/g, '')
            if (!(paramName in $params)) {
              console.warn(
                `Param '${paramName}' does not exist in params configuration for '${str}'`
              )
              return paramName
            }
            return $params[segment.replace(/\[|\]/g, '')]
            // return $params[segment.replace(/\[|\]/g, '')] + hasQ ? '?' + hasQ : ''
          } else if (segment.startsWith(':')) {
            const paramName = segment.split('').slice(1).join('')
            if (!(paramName in $params)) {
              console.warn(
                `Param '${paramName}' does not exist in params configuration for '${str}'`
              )
              return paramName
            }
            return $params[paramName]
          } else {
            return segment
          }
        })
        .join('/') + (hasQuery ? queryString : '')
    )
  }
  /**
   * Creates a new request function. This is for usage with fetcher and fetcher.extend
   */
  function createRequestFn(method, baseUrl, $headers, q) {
    return async function (url, init = {}) {
      const {
        default: def,
        resolver = e => e.json(),
        config: c = {},
        onResolve = () => {},
        onError = () => {}
      } = init
      const { params = {} } = c || {}
      let query = Object.assign(Object.assign({}, q), c.query)
      const rawUrl = setURLParams(url, params)
      const [, qp = ''] = rawUrl.split('?')
      qp.split('&').forEach(q => {
        const [key, value] = q.split('=')
        if (query[key] !== value) {
          query = Object.assign(Object.assign({}, query), { [key]: value })
        }
      })
      const reqQueryString = Object.keys(query)
        .map(q => [q, query[q]].join('='))
        .join('&')
      const { headers = {}, body, formatBody } = c
      const reqConfig = {
        method,
        headers: Object.assign(
          Object.assign({ 'Content-Type': 'application/json' }, $headers),
          headers
        ),
        body: (
          method === null || method === void 0
            ? void 0
            : method.match(/(POST|PUT|DELETE|PATCH)/)
        )
          ? isFunction(formatBody)
            ? formatBody(body)
            : formatBody === false || isFormData(body)
            ? body
            : JSON.stringify(body)
          : undefined
      }
      let r = undefined
      try {
        const req = await fetch(
          `${baseUrl || ''}${rawUrl}${
            url.includes('?') ? `&${reqQueryString}` : `?${reqQueryString}`
          }`,
          reqConfig
        )
        r = req
        const data = await resolver(req)
        if ((req === null || req === void 0 ? void 0 : req.status) >= 400) {
          onError(true)
          return {
            res: req,
            data: def,
            error: true,
            code: req === null || req === void 0 ? void 0 : req.status,
            config: Object.assign(
              Object.assign({ url: `${baseUrl || ''}${rawUrl}` }, reqConfig),
              { query }
            )
          }
        } else {
          onResolve(data, req)
          return {
            res: req,
            data: data,
            error: false,
            code: req === null || req === void 0 ? void 0 : req.status,
            config: Object.assign(
              Object.assign({ url: `${baseUrl || ''}${rawUrl}` }, reqConfig),
              { query }
            )
          }
        }
      } catch (err) {
        onError(err)
        return {
          res: r,
          data: def,
          error: true,
          code: r === null || r === void 0 ? void 0 : r.status,
          config: Object.assign(
            Object.assign({ url: `${baseUrl || ''}${rawUrl}` }, reqConfig),
            { query }
          )
        }
      }
    }
  }
  const runningRequests = {}
  const previousConfig = {}
  const previousProps = {}
  const createRequestEmitter = () => {
    const emitter = new EventEmitter()
    emitter.setMaxListeners(10e10)
    return emitter
  }
  const requestEmitter = createRequestEmitter()
  const FetcherContext = createContext({
    defaults: {},
    attempts: 0,
    // By default its 5 seconds
    attemptInterval: 2,
    revalidateOnFocus: false,
    query: {},
    params: {},
    onOffline() {},
    onOnline() {},
    online: true,
    retryOnReconnect: true
  })
  const resolvedRequests = {}
  const resolvedHookCalls = {}
  const abortControllers = {}
  /**
   * Default store cache
   */
  const defaultCache = {
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
  const valuesMemory = {}
  function FetcherConfig(props) {
    var _a, _b, _c, _d, _e
    const { children, defaults = {}, baseUrl } = props
    const previousConfig = useHRFContext()
    const { cache = defaultCache } = previousConfig
    let base = !isDefined(baseUrl)
      ? !isDefined(previousConfig.baseUrl)
        ? ''
        : previousConfig.baseUrl
      : baseUrl
    for (let defaultKey in defaults) {
      const { id } = defaults[defaultKey]
      const resolvedKey = JSON.stringify(
        isDefined(id)
          ? {
              idString: JSON.stringify(id)
            }
          : {
              uri: `${base}${defaultKey}`,
              config: {
                method:
                  (_b =
                    (_a = defaults[defaultKey]) === null || _a === void 0
                      ? void 0
                      : _a.config) === null || _b === void 0
                    ? void 0
                    : _b.method
              }
            }
      )
      if (isDefined(id)) {
        if (!isDefined(valuesMemory[resolvedKey])) {
          valuesMemory[resolvedKey] =
            (_c = defaults[defaultKey]) === null || _c === void 0
              ? void 0
              : _c.value
        }
        if (!isDefined(fetcherDefaults[resolvedKey])) {
          fetcherDefaults[resolvedKey] =
            (_d = defaults[defaultKey]) === null || _d === void 0
              ? void 0
              : _d.value
        }
      }
      if (!isDefined(cache.get(resolvedKey))) {
        cache.set(
          resolvedKey,
          (_e = defaults[defaultKey]) === null || _e === void 0
            ? void 0
            : _e.value
        )
      }
    }
    let mergedConfig = Object.assign(
      Object.assign(Object.assign({}, previousConfig), props),
      {
        headers: Object.assign(
          Object.assign({}, previousConfig.headers),
          props.headers
        )
      }
    )
    return React.createElement(
      FetcherContext.Provider,
      { value: mergedConfig },
      children
    )
  }
  /**
   * Revalidate requests that match an id or ids
   */
  function revalidate(id) {
    if (Array.isArray(id)) {
      id.map(reqId => {
        if (isDefined(reqId)) {
          const key = JSON.stringify(reqId)
          const resolveKey = JSON.stringify({ idString: key })
          previousConfig[resolveKey] = undefined
          requestEmitter.emit(key)
        }
      })
    } else {
      if (isDefined(id)) {
        const key = JSON.stringify(id)
        const resolveKey = JSON.stringify({ idString: key })
        previousConfig[resolveKey] = undefined
        requestEmitter.emit(key)
      }
    }
  }
  const fetcherDefaults = {}
  const cacheForMutation = {}
  function queue(callback, time = 0) {
    // let tm = null
    const tm = setTimeout(() => {
      callback()
      clearTimeout(tm)
    }, time)
    return tm
  }
  /**
   * Force mutation in requests from anywhere. This doesn't revalidate requests
   */
  function mutateData(...pairs) {
    for (let pair of pairs) {
      try {
        const [k, v, _revalidate] = pair
        const key = JSON.stringify({ idString: JSON.stringify(k) })
        const requestCallId = ''
        if (isFunction(v)) {
          let newVal = v(cacheForMutation[key])
          requestEmitter.emit(key, {
            data: newVal,
            isMutating: true,
            requestCallId
          })
          if (_revalidate) {
            previousConfig[key] = undefined
            requestEmitter.emit(JSON.stringify(k))
          }
          queue(() => {
            cacheForMutation[key] = newVal
          })
        } else {
          requestEmitter.emit(key, {
            requestCallId,
            isMutating: true,
            data: v
          })
          if (_revalidate) {
            previousConfig[key] = undefined
            requestEmitter.emit(JSON.stringify(k))
          }
          queue(() => {
            cacheForMutation[key] = v
          })
        }
      } catch (err) {}
    }
  }
  /**
   * Get the current fetcher config
   */
  function useFetcherConfig(id) {
    const ftxcf = useHRFContext()
    const { config } = useFetcherId(id)
    let allowedKeys = [
      'headers',
      'baseUrl',
      'body',
      'defaults',
      'resolver',
      'auto',
      'memory',
      'refresh',
      'attempts',
      'attemptInterval',
      'revalidateOnFocus',
      'query',
      'params',
      'onOnline',
      'onOffline',
      'online',
      'retryOnReconnect',
      'cache'
    ]
    // Remove the 'method' strings
    for (let k in ftxcf) {
      if (allowedKeys.indexOf(k) === -1) {
        delete ftxcf[k]
      }
    }
    return isDefined(id) ? config : ftxcf
  }
  /**
   * Get the data state of a request using its id
   */
  function useFetcherData(id, onResolve) {
    const { cache = defaultCache } = useHRFContext()
    const defaultsKey = JSON.stringify({
      idString: JSON.stringify(id)
    })
    const def = cache.get(defaultsKey)
    const { data } = useFetcher({
      default: def,
      id: id
    })

    useResolve(id, onResolve)

    return data
  }
  function useFetcherCode(id) {
    const { code } = useFetcher({
      id: id
    })
    return code
  }
  /**
   * Get the loading state of a request using its id
   */
  function useFetcherLoading(id) {
    const idString = JSON.stringify({ idString: JSON.stringify(id) })
    const { data } = useFetcher({
      id: id
    })
    return !isDefined(runningRequests[idString])
      ? true
      : runningRequests[idString]
  }
  /**
   * Get the error state of a request using its id
   */
  function useFetcherError(id, onError) {
    const { error } = useFetcher({
      id: id,
      onError
    })
    return error
  }
  /**
   * Get the mutate the request data using its id
   */
  function useFetcherMutate(
    /**
     * The id of the `useFetch` call
     */
    id,
    /**
     * The function to run after mutating
     */
    onMutate
  ) {
    const { mutate } = useFetcher({
      id: id,
      onMutate
    })
    return mutate
  }
  /**
   * Get everything from a `useFetcher` call using its id
   */
  function useFetcherId(id) {
    const defaultsKey = JSON.stringify({
      idString: JSON.stringify(id)
    })
    const def = fetcherDefaults[defaultsKey]
    return useFetcher({
      id,
      default: def
    })
  }
  /**
   * Create an effect for when the request completes
   */
  function useResolve(id, onResolve) {
    const defaultsKey = JSON.stringify({
      idString: JSON.stringify(id)
    })

    useFetcher({
      id
    })

    useEffect(() => {
      async function resolve(v) {
        const { isResolved, data } = v
        if (isResolved) {
          if (isFunction(onResolve)) {
            onResolve(data)
          }
        }
      }
      requestEmitter.addListener(defaultsKey, resolve)
      return () => {
        requestEmitter.removeListener(defaultsKey, resolve)
      }
    }, [defaultsKey, onResolve])
  }
  /**
   * User a `GET` request
   */
  function useGET(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'GET' }
        )
      })
    )
  }
  /**
   * Use a `DELETE` request
   */
  function useDELETE(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'DELETE' }
        )
      })
    )
  }
  /**
   * Use a `HEAD` request
   */
  function useHEAD(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'HEAD' }
        )
      })
    )
  }
  /**
   * Use an `OPTIONS` request
   */
  function useOPTIONS(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'OPTIONS' }
        )
      })
    )
  }
  /**
   * Use a `POST` request
   */
  function usePOST(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'POST' }
        )
      })
    )
  }
  /**
   * Use a `PUT` request
   */
  function usePUT(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'PUT' }
        )
      })
    )
  }
  /**
   * Use a `PATCH` request
   */
  function usePATCH(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'PATCH' }
        )
      })
    )
  }
  /**
   * Use a `PURGE` request
   */
  function usePURGE(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'PURGE' }
        )
      })
    )
  }
  /**
   * Use a `LINK` request
   */
  function useLINK(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'LINK' }
        )
      })
    )
  }
  /**
   * Use an `UNLINK` request
   */
  function useUNLINK(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        config: Object.assign(
          Object.assign(
            {},
            options === null || options === void 0 ? void 0 : options.config
          ),
          { method: 'UNLINK' }
        )
      })
    )
  }
  /**
   * Get a blob of the response. You can pass an `objectURL` property that will convet that blob into a string using `URL.createObjectURL`
   */
  function useFetcherBlob(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        async resolver(res) {
          const blob = await res.blob()
          if (typeof URL !== 'undefined') {
            if (init.objectURL) {
              return URL.createObjectURL(blob)
            } else {
              if (
                options === null || options === void 0
                  ? void 0
                  : options.objectURL
              ) {
                return URL.createObjectURL(blob)
              }
            }
          }
          return blob
        }
      })
    )
  }
  /**
   * Get a text of the response
   */
  function useFetcherText(init, options) {
    return useFetcher(
      init,
      Object.assign(Object.assign({}, options), {
        async resolver(res) {
          const text = await res.text()
          return text
        }
      })
    )
  }
  function gql(...args) {
    let query = args[0][0]
    const returnObj = {
      query: query,
      vars: {}
    }
    return returnObj
  }
  /**
   * Make a graphQL request
   */
  function useGql(arg1, cfg = {}) {
    const isUsingExternalQuery = typeof arg1.query === 'string'
    let query
    if (isUsingExternalQuery) {
      query = arg1.query
    } else {
      query = arg1[0][0]
    }
    const { variables = {}, graphqlPath = '/graphql' } = cfg,
      otherArgs = __rest(cfg, ['variables', 'graphqlPath'])
    const { config = {} } = otherArgs
    const JSONBody = JSON.stringify({
      query,
      variables
    })
    return useFetcher(
      Object.assign(Object.assign({ url: graphqlPath, id: arg1 }, otherArgs), {
        config: Object.assign(Object.assign({}, config), {
          formatBody: () => JSONBody,
          body: JSONBody,
          method: 'POST'
        })
      })
    )
  }

  const createImperativeFetcher = ctx => {
    const keys = [
      'GET',
      'DELETE',
      'HEAD',
      'OPTIONS',
      'POST',
      'PUT',
      'PATCH',
      'PURGE',
      'LINK',
      'UNLINK'
    ]
    const { baseUrl } = ctx
    return Object.fromEntries(
      new Map(
        keys.map(k => [
          k.toLowerCase(),
          (url, _a = {}) => {
            var { config = {} } = _a,
              other = __rest(_a, ['config'])
            return fetcher[k.toLowerCase()](
              hasBaseUrl(url) ? url : baseUrl + url,
              Object.assign(
                {
                  config: {
                    headers: Object.assign(
                      Object.assign({}, ctx.headers),
                      config.headers
                    ),
                    body: config.body,
                    query: Object.assign(
                      Object.assign({}, ctx.query),
                      config.query
                    ),
                    params: Object.assign(
                      Object.assign({}, ctx.params),
                      config.params
                    ),
                    formatBody: config.formatBody
                  }
                },
                other
              )
            )
          }
        ])
      )
    )
  }
  /**
   * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
   */
  function useImperative() {
    const ctx = useFetcherConfig()
    const imperativeFetcher = React.useMemo(
      () => createImperativeFetcher(ctx),
      [JSON.stringify(ctx)]
    )
    return imperativeFetcher
  }
  function isDefined(target) {
    return typeof target !== 'undefined'
  }
  function isFunction(target) {
    return typeof target === 'function'
  }
  function hasBaseUrl(target) {
    return target.startsWith('http://') || target.startsWith('https://')
  }
  function useHRFContext() {
    return useContext(FetcherContext)
  }
  const windowExists = typeof window !== 'undefined'
  /**
   * Fetcher hook
   */
  const useFetcher = (init, options) => {
    const ctx = useHRFContext()
    const { cache = defaultCache } = ctx
    const optionsConfig =
      typeof init === 'string'
        ? Object.assign(
            {
              // Pass init as the url if init is a string
              url: init
            },
            options
          )
        : init
    const {
      onOnline = ctx.onOnline,
      onOffline = ctx.onOffline,
      onMutate,
      onPropsChange,
      url = '',
      id,
      config = {
        query: {},
        params: {},
        baseUrl: undefined,
        method: 'GET',
        headers: {},
        body: undefined,
        formatBody: false
      },
      resolver = isFunction(ctx.resolver) ? ctx.resolver : d => d.json(),
      onError,
      auto = isDefined(ctx.auto) ? ctx.auto : true,
      memory = isDefined(ctx.memory) ? ctx.memory : true,
      onResolve,
      onAbort,
      refresh = isDefined(ctx.refresh) ? ctx.refresh : 0,
      cancelOnChange = false,
      attempts = ctx.attempts,
      attemptInterval = ctx.attemptInterval,
      revalidateOnFocus = ctx.revalidateOnFocus
    } = optionsConfig
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
    const idString = JSON.stringify(id)
    const [reqQuery, setReqQuery] = useState(
      Object.assign(Object.assign({}, ctx.query), config.query)
    )
    const [configUrl, setConfigUrl] = useState({
      realUrl: '',
      rawUrl: ''
    })
    const [reqParams, setReqParams] = useState(
      Object.assign(Object.assign({}, ctx.params), config.params)
    )
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
      [JSON.stringify(reqParams), config.baseUrl, ctx.baseUrl, url]
    )
    const resolvedKey = JSON.stringify(
      isDefined(id)
        ? {
            idString
          }
        : {
            uri: rawUrl,
            config: {
              method:
                config === null || config === void 0 ? void 0 : config.method
            }
          }
    )
    const realUrl = urlWithParams + (urlWithParams.includes('?') ? `` : '?')
    if (!isDefined(previousProps[resolvedKey])) {
      if (url !== '') {
        previousProps[resolvedKey] = optionsConfig
      }
    }
    useEffect(() => {
      if (url !== '') {
        setReqParams(() => {
          const newParams = Object.assign(
            Object.assign({}, ctx.params),
            config.params
          )
          return newParams
        })
      }
    }, [
      JSON.stringify(
        Object.assign(Object.assign({}, ctx.params), config.params)
      ),
      resolvedKey
    ])
    const stringDeps = JSON.stringify(
      // We ignore children and resolver
      Object.assign(
        ctx,
        { children: undefined },
        config === null || config === void 0 ? void 0 : config.headers,
        config === null || config === void 0 ? void 0 : config.method,
        config === null || config === void 0 ? void 0 : config.body,
        config === null || config === void 0 ? void 0 : config.query,
        config === null || config === void 0 ? void 0 : config.params,
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
      let queryParamsFromString = {}
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
            const newQuery = Object.assign(
              Object.assign(
                Object.assign({}, ctx.query),
                queryParamsFromString
              ),
              config.query
            )
            return newQuery
          })
        }
      }
    }, [
      resolvedKey,
      requestCallId,
      JSON.stringify(
        Object.assign(Object.assign({ qp }, ctx.query), config.query)
      )
    ])
    const requestCache = cache.get(resolvedKey)
    const initialDataValue = isDefined(valuesMemory[resolvedKey])
      ? valuesMemory[resolvedKey]
      : isDefined(cache.get(resolvedKey))
      ? cache.get(resolvedKey)
      : def
    const [data, setData] = useState(memory ? initialDataValue : def)
    // Used JSON as deppendency instead of directly using a reference to data
    const rawJSON = JSON.stringify(data)
    const [online, setOnline] = useState(true)
    const [requestHeaders, setRequestHeades] = useState(
      Object.assign(Object.assign({}, ctx.headers), config.headers)
    )
    const [response, setResponse] = useState()
    const [statusCode, setStatusCode] = useState()
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [completedAttempts, setCompletedAttempts] = useState(0)
    const [requestAbortController, setRequestAbortController] = useState(
      new AbortController()
    )
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
        if (error) {
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            error: error
          })
        }
      }
    }, [url, error, resolvedKey, requestCallId])
    const fetchData = React.useCallback(
      async function fetchData(c = {}) {
        var _a
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
          (urlWithParams.includes('?')
            ? (c === null || c === void 0 ? void 0 : c.query) !== ''
              ? `&`
              : ''
            : '?')
        const [resKey] = realUrl.split('?')
        if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
          queue(() => {
            setReqMethod(config.method)
            if (url !== '') {
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
            runningRequests[resolvedKey] = true
            setLoading(true)
            previousConfig[resolvedKey] = JSON.stringify(optionsConfig)
            let newAbortController = new AbortController()
            setRequestAbortController(newAbortController)
            setError(null)
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
                headers: Object.assign(
                  Object.assign(
                    Object.assign(
                      {
                        'Content-Type':
                          // If body is form-data, set Content-Type header to 'multipart/form-data'
                          isFormData(config.body)
                            ? 'multipart/form-data'
                            : 'application/json'
                      },
                      ctx.headers
                    ),
                    config.headers
                  ),
                  c.headers
                ),
                body: (
                  (_a = config.method) === null || _a === void 0
                    ? void 0
                    : _a.match(/(POST|PUT|DELETE|PATCH)/)
                )
                  ? isFunction(config.formatBody)
                    ? config.formatBody(
                        isFormData(config.body)
                          ? config.body
                          : Object.assign(
                              Object.assign({}, config.body),
                              c.body
                            )
                      )
                    : config.formatBody === false || isFormData(config.body)
                    ? config.body
                    : JSON.stringify(
                        Object.assign(Object.assign({}, config.body), c.body)
                      )
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
              const _data = await resolver(json)
              if (code >= 200 && code < 400) {
                if (memory) {
                  cache.set(resolvedKey, _data)
                  valuesMemory[resolvedKey] = _data
                }
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: _data,
                  isResolved: true,
                  loading: false,
                  error: null,
                  completedAttempts: 0
                })
                setData(_data)
                cacheForMutation[idString] = _data
                setError(null)
                setLoading(false)
                if (willResolve) {
                  onResolve(_data, json)
                }
                runningRequests[resolvedKey] = false
                // If a request completes succesfuly, we reset the error attempts to 0
                setCompletedAttempts(0)
                queue(() => {
                  cacheForMutation[resolvedKey] = _data
                })
              } else {
                if (def) {
                  setData(def)
                  cacheForMutation[idString] = def
                  requestEmitter.emit(resolvedKey, {
                    requestCallId,
                    data: def
                  })
                }
                setError(true)
                if (handleError) {
                  onError(_data, json)
                }
                runningRequests[resolvedKey] = false
              }
            } catch (err) {
              const errorString =
                err === null || err === void 0 ? void 0 : err.toString()
              // Only set error if no abort
              if (!`${errorString}`.match(/abort/i)) {
                let _error = new Error(err)
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
                if (handleError) {
                  onError(err)
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
        JSON.stringify(optionsConfig),
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
              onAbort()
            }
          }
        }
      }
      signal === null || signal === void 0
        ? void 0
        : signal.addEventListener('abort', abortCallback)
      return () => {
        signal === null || signal === void 0
          ? void 0
          : signal.removeEventListener('abort', abortCallback)
      }
    }, [requestAbortController, resolvedKey, onAbort, loading])
    const imperativeFetcher = React.useMemo(() => {
      const __headers = Object.assign(
        Object.assign({}, ctx.headers),
        config.headers
      )
      const __params = Object.assign(
        Object.assign({}, ctx.params),
        config.params
      )
      const __baseUrl = isDefined(config.baseUrl) ? config.baseUrl : ctx.baseUrl
      return createImperativeFetcher(
        Object.assign(Object.assign({}, ctx), {
          headers: __headers,
          baseUrl: __baseUrl,
          params: __params
        })
      )
    }, [JSON.stringify(ctx)])
    if (willResolve) {
      if (resolvedHookCalls[resolvedKey]) {
        if (isDefined(cache.get(resolvedKey))) {
          onResolve(cache.get(resolvedKey), response)
          queue(() => {
            delete resolvedHookCalls[resolvedKey]
          })
        }
      }
    }
    useEffect(() => {
      async function waitFormUpdates(v) {
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
          if (
            isDefined(
              config === null || config === void 0 ? void 0 : config.query
            )
          ) {
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
          if (
            isDefined(
              config === null || config === void 0 ? void 0 : config.params
            )
          ) {
            queue(() => {
              setReqParams(
                config === null || config === void 0 ? void 0 : config.params
              )
            })
          }
          if (
            isDefined(
              config === null || config === void 0 ? void 0 : config.headers
            )
          ) {
            queue(() => {
              setRequestHeades(
                config === null || config === void 0 ? void 0 : config.headers
              )
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
              if (
                JSON.stringify(data) !== JSON.stringify(cache.get(resolvedKey))
              ) {
                setData($data)
              }
              if (
                JSON.stringify($data) !==
                JSON.stringify(cacheForMutation[resolvedKey])
              ) {
                cacheForMutation[idString] = data
                if (isMutating) {
                  if (handleMutate) {
                    onMutate($data, imperativeFetcher)
                  }
                }
              }
            })
          }
          if (isDefined($error)) {
            queue(() => {
              setError($error)
              if ($error !== null) {
                if (handleError) {
                  onError($error)
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
        // Only revalidate if request was already completed
        if (!loading) {
          if (!runningRequests[resolvedKey]) {
            previousConfig[resolvedKey] = undefined
            setLoading(true)
            const reqQ = Object.assign(
              Object.assign({}, ctx.query),
              config.query
            )
            const reqP = Object.assign(
              Object.assign({}, ctx.params),
              config.params
            )
            if (url !== '') {
              fetchData({
                query: Object.keys(reqQ)
                  .map(q => [q, reqQ[q]].join('='))
                  .join('&'),
                params: reqP
              })
            }
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              loading: true
            })
          }
        }
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
      async function forceRefresh(v) {
        if (isDefined(v === null || v === void 0 ? void 0 : v.data)) {
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
          if (!runningRequests[resolvedKey]) {
            // We are preventing revalidation where we only need updates about
            // 'loading', 'error' and 'data' because the url can be ommited.
            if (url !== '') {
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                loading: true,
                error: null
              })
              const reqQ = Object.assign(
                Object.assign({}, ctx.query),
                config.query
              )
              const reqP = Object.assign(
                Object.assign({}, ctx.params),
                config.params
              )
              fetchData({
                query: Object.keys(reqQ)
                  .map(q => [q, reqQ[q]].join('='))
                  .join('&'),
                params: reqP
              })
            }
          }
        }
      }
      let idString = JSON.stringify(id)
      requestEmitter.addListener(idString, forceRefresh)
      return () => {
        requestEmitter.removeListener(idString, forceRefresh)
      }
    }, [resolvedKey, requestCallId, stringDeps, auto, ctx.auto, idString, id])
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
          onOnline({ cancel: cancelReconectionAttempt })
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
          onOffline()
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
      const newHeaders = Object.assign(
        Object.assign({}, ctx.headers),
        config.headers
      )
      setRequestHeades(newHeaders)
    }, [
      JSON.stringify(
        Object.assign(Object.assign({}, ctx.headers), config.headers)
      ),
      resolvedKey
    ])
    useEffect(() => {
      previousConfig[resolvedKey] = undefined
    }, [requestCallId, resolvedKey])
    useEffect(() => {
      // Attempts will be made after a request fails
      const tm = queue(() => {
        if (error) {
          if (completedAttempts < attempts) {
            reValidate()
            setCompletedAttempts(previousAttempts => {
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
      }, attemptInterval * 1000)
      return () => {
        clearTimeout(tm)
      }
    }, [error, attempts, rawJSON, attemptInterval, completedAttempts])
    useEffect(() => {
      if (completedAttempts === 0) {
        if (refresh > 0 && auto) {
          const tm = queue(reValidate, refresh * 1000)
          return () => {
            clearTimeout(tm)
          }
        }
      }
      return () => {}
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, rawJSON, completedAttempts, config])
    const initMemo = React.useMemo(() => JSON.stringify(optionsConfig), [])
    useEffect(() => {
      if (auto) {
        if (url !== '') {
          if (runningRequests[resolvedKey]) {
            setLoading(true)
          }
          const reqQ = Object.assign(Object.assign({}, ctx.query), config.query)
          const reqP = Object.assign(
            Object.assign({}, ctx.params),
            config.params
          )
          fetchData({
            query: Object.keys(reqQ)
              .map(q => [q, reqQ[q]].join('='))
              .join('&'),
            params: reqP
          })
        }
        // It means a url is not passed
        else {
          setError(null)
          setLoading(false)
        }
      } else {
        if (!isDefined(data)) {
          setData(def)
          cacheForMutation[idString] = def
        }
        setError(null)
        setLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      requestCallId,
      initMemo,
      url,
      stringDeps,
      refresh,
      JSON.stringify(config),
      auto,
      ctx.auto
    ])
    useEffect(() => {
      function addFocusListener() {
        if (revalidateOnFocus && windowExists) {
          if ('addEventListener' in window) {
            window.addEventListener('focus', reValidate)
          }
        }
      }
      addFocusListener()
      return () => {
        if (windowExists) {
          if ('addEventListener' in window) {
            window.removeEventListener('focus', reValidate)
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
      JSON.stringify(config)
    ])
    const __config = Object.assign(Object.assign({}, config), {
      method: reqMethod,
      params: reqParams,
      headers: requestHeaders,
      body: config.body,
      baseUrl: ctx.baseUrl || config.baseUrl,
      url:
        configUrl === null || configUrl === void 0 ? void 0 : configUrl.realUrl,
      rawUrl:
        configUrl === null || configUrl === void 0 ? void 0 : configUrl.rawUrl,
      query: reqQuery
    })
    function forceMutate(newValue, callback = () => {}) {
      if (!isFunction(newValue)) {
        if (
          JSON.stringify(cache.get(resolvedKey)) !== JSON.stringify(newValue)
        ) {
          if (handleMutate) {
            onMutate(newValue, imperativeFetcher)
          }
          callback(newValue, imperativeFetcher)
          cache.set(resolvedKey, newValue)
          valuesMemory[resolvedKey] = newValue
          cacheForMutation[idString] = newValue
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            isMutating: true,
            data: newValue
          })
          setData(newValue)
        }
      } else {
        let newVal = newValue(data)
        if (JSON.stringify(cache.get(resolvedKey)) !== JSON.stringify(newVal)) {
          if (handleMutate) {
            onMutate(newVal, imperativeFetcher)
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
              if (
                previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)
              ) {
                requestAbortController === null ||
                requestAbortController === void 0
                  ? void 0
                  : requestAbortController.abort()
              }
            }
          } catch (err) {}
        },
        fetcher: imperativeFetcher,
        props: optionsConfig,
        previousProps: previousProps[resolvedKey]
      }
      if (
        JSON.stringify(previousProps[resolvedKey]) !==
        JSON.stringify(optionsConfig)
      ) {
        if (handlePropsChange) {
          onPropsChange(rev)
        }
        if (url !== '') {
          previousProps[resolvedKey] = optionsConfig
        }
        if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
          if (cancelOnChange) {
            requestAbortController === null || requestAbortController === void 0
              ? void 0
              : requestAbortController.abort()
          }
        }
      }
    }, [
      url,
      cancelOnChange,
      JSON.stringify(id),
      JSON.stringify(optionsConfig),
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
        var _a
        ;(_a = abortControllers[resolvedKey]) === null || _a === void 0
          ? void 0
          : _a.abort()
        if (loading) {
          setError(false)
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
    }
  }
  // Create a method for each request
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
  {
    useFetcher
  }
  /**
   * @deprecated Everything with `extend` can be achieved with `useFetch` alone
   *
   *
   * Extend the useFetcher hook
   */
  useFetcher.extend = function extendFetcher(props = {}) {
    const {
      baseUrl = undefined,
      headers = {},
      query = {},
      // json by default
      resolver
    } = props
    function useCustomFetcher(init, options) {
      const ctx = useHRFContext()
      const _a =
          typeof init === 'string'
            ? Object.assign(
                {
                  // set url if init is a stringss
                  url: init
                },
                options
              ) // `url` will be required in init if it is an object
            : init,
        { url = '', config = {} } = _a,
        otherProps = __rest(_a, ['url', 'config'])
      return useFetcher(
        Object.assign(Object.assign({}, otherProps), {
          url: `${url}`,
          // If resolver is present is hook call, use that instead
          resolver:
            resolver || otherProps.resolver || ctx.resolver || (d => d.json()),
          config: {
            baseUrl: !isDefined(config.baseUrl)
              ? !isDefined(ctx.baseUrl)
                ? baseUrl
                : ctx.baseUrl
              : config.baseUrl,
            method: config.method,
            headers: Object.assign(
              Object.assign(Object.assign({}, headers), ctx.headers),
              config.headers
            ),
            body: config.body
          }
        })
      )
    }
    useCustomFetcher.config = {
      baseUrl,
      headers,
      query
    }
    // Creating methods for fetcher.extend
    useCustomFetcher.get = createRequestFn('GET', baseUrl, headers, query)
    useCustomFetcher.delete = createRequestFn('DELETE', baseUrl, headers, query)
    useCustomFetcher.head = createRequestFn('HEAD', baseUrl, headers, query)
    useCustomFetcher.options = createRequestFn(
      'OPTIONS',
      baseUrl,
      headers,
      query
    )
    useCustomFetcher.post = createRequestFn('POST', baseUrl, headers, query)
    useCustomFetcher.put = createRequestFn('PUT', baseUrl, headers, query)
    useCustomFetcher.patch = createRequestFn('PATCH', baseUrl, headers, query)
    useCustomFetcher.purge = createRequestFn('PURGE', baseUrl, headers, query)
    useCustomFetcher.link = createRequestFn('LINK', baseUrl, headers, query)
    useCustomFetcher.unlink = createRequestFn('UNLINK', baseUrl, headers, query)
    useCustomFetcher.Config = FetcherConfig
    return useCustomFetcher
  }
  const fetcher = useFetcher
  const isFormData = target => {
    if (typeof FormData !== 'undefined') {
      return target instanceof FormData
    } else return false
  }
  const defaultConfig = { headers: {}, body: undefined }
  /**
   * Basic HttpClient
   */
  class HttpClient {
    async get(path, { headers, body } = defaultConfig, method = 'GET') {
      const requestUrl = `${this.baseUrl}${path}`
      const responseBody = await fetch(
        requestUrl,
        Object.assign(
          {
            method,
            headers: Object.assign(
              {
                'Content-Type': 'application/json',
                Accept: 'application/json'
              },
              headers
            )
          },
          body ? { body: JSON.stringify(body) } : {}
        )
      )
      const responseData = await responseBody.json()
      return responseData
    }
    async post(path, props = defaultConfig) {
      return await this.get(path, props, 'POST')
    }
    async put(path, props = defaultConfig) {
      return await this.get(path, props, 'PUT')
    }
    async delete(path, props = defaultConfig) {
      return await this.get(path, props, 'DELETE')
    }
    constructor(url) {
      this.baseUrl = ''
      this.baseUrl = url
    }
  }
  /**
   * @deprecated - Use the fetcher {instead}
   *
   * Basic HttpClient
   */
  function createHttpClient(url) {
    return new HttpClient(url)
  }

  window.useGql = useGql
  window.gql = gql
  window.FetcherConfig = FetcherConfig
  window.fetcher = fetcher
  window.isFormData = isFormData
  window.mutateData = mutateData
  window.revalidate = revalidate
  window.setURLParams = setURLParams
  window.useBlob = useFetcherBlob
  window.useCode = useFetcherCode
  window.useConfig = useFetcherConfig
  window.useDELETE = useDELETE
  window.useData = useFetcherData
  window.useError = useFetcherError
  window.useFetch = useFetcher
  window.useFetchId = useFetcherId
  window.useFetcher = useFetcher
  window.useFetcherBlob = useFetcherBlob
  window.useFetcherCode = useFetcherCode
  window.useFetcherConfig = useFetcherConfig
  window.useFetcherData = useFetcherData
  window.useFetcherError = useFetcherError
  window.useFetcherId = useFetcherId
  window.useFetcherLoading = useFetcherLoading
  window.useFetcherMutate = useFetcherMutate
  window.useFetcherText = useFetcherText
  window.useGET = useGET
  window.useHEAD = useHEAD
  window.useImperative = useImperative
  window.useLINK = useLINK
  window.useLoading = useFetcherLoading
  window.useMutate = useFetcherMutate
  window.useOPTIONS = useOPTIONS
  window.usePATCH = usePATCH
  window.usePOST = usePOST
  window.usePURGE = usePURGE
  window.usePUT = usePUT
  window.useResolve = useResolve
  window.useText = useFetcherText
  window.useUNLINK = useUNLINK
  window.createHttpClien = createHttpClient
})()
