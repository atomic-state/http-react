/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(() => {
  var __rest =
    (this && this.__rest) ||
    function (s, e) {
      var t = {};
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (
          var i = 0, p = Object.getOwnPropertySymbols(s);
          i < p.length;
          i++
        ) {
          if (
            e.indexOf(p[i]) < 0 &&
            Object.prototype.propertyIsEnumerable.call(s, p[i])
          )
            t[p[i]] = s[p[i]];
        }
      return t;
    };

  const { useState, useEffect, createContext, useContext } = React;

  class EventEmitter {
    listeners = [];
    emit(eventName, data) {
      this.listeners
        .filter(({ name }) => name === eventName)
        .forEach(({ callback }) => callback(data));
    }
    addListener(name, callback) {
      if (typeof callback === "function" && typeof name === "string") {
        this.listeners.push({ name, callback });
      }
    }
    removeListener(eventName, callback) {
      this.listeners = this.listeners.filter(
        (listener) =>
          !(listener.name === eventName && listener.callback === callback)
      );
    }
    destroy() {
      this.listener.length = 0;
    }
  }

  /**
   * Creates a new request function. This is for usage with fetcher and fetcher.extend
   */
  function createRequestFn(method, baseUrl, $headers, q) {
    return async function (url, init = {}) {
      const {
        default: def,
        resolver = (e) => e.json(),
        config: c = {},
        onResolve = () => {},
        onError = () => {},
      } = init;
      let query = Object.assign(Object.assign({}, q), c.query);
      const [, qp = ""] = url.split("?");
      qp.split("&").forEach((q) => {
        const [key, value] = q.split("=");
        if (query[key] !== value) {
          query = Object.assign(Object.assign({}, query), { [key]: value });
        }
      });
      const reqQueryString = Object.keys(query)
        .map((q) => [q, query[q]].join("="))
        .join("&");
      const { headers = {}, body, formatBody } = c;
      const reqConfig = {
        method,
        headers: Object.assign(
          Object.assign({ "Content-Type": "application/json" }, $headers),
          headers
        ),
        body: (
          method === null || method === void 0
            ? void 0
            : method.match(/(POST|PUT|DELETE|PATCH)/)
        )
          ? typeof formatBody === "function"
            ? formatBody(
                typeof FormData !== "undefined" && body instanceof FormData
                  ? body
                  : body
              )
            : formatBody === false ||
              (typeof FormData !== "undefined" && body instanceof FormData)
            ? body
            : JSON.stringify(body)
          : undefined,
      };
      let r = undefined;
      try {
        const req = await fetch(
          `${baseUrl || ""}${url}${
            url.includes("?") ? `&${reqQueryString}` : `?${reqQueryString}`
          }`,
          reqConfig
        );
        r = req;
        const data = await resolver(req);
        if ((req === null || req === void 0 ? void 0 : req.status) >= 400) {
          onError(true);
          return {
            res: req,
            data: def,
            error: true,
            code: req === null || req === void 0 ? void 0 : req.status,
            config: Object.assign(
              Object.assign({ url: `${baseUrl || ""}${url}` }, reqConfig),
              { query }
            ),
          };
        } else {
          onResolve(data, req);
          return {
            res: req,
            data: data,
            error: false,
            code: req === null || req === void 0 ? void 0 : req.status,
            config: Object.assign(
              Object.assign({ url: `${baseUrl || ""}${url}` }, reqConfig),
              { query }
            ),
          };
        }
      } catch (err) {
        onError(err);
        return {
          res: r,
          data: def,
          error: true,
          code: r === null || r === void 0 ? void 0 : r.status,
          config: Object.assign(
            Object.assign({ url: `${baseUrl || ""}${url}` }, reqConfig),
            { query }
          ),
        };
      }
    };
  }
  const runningRequests = {};
  const previousConfig = {};
  const createRequestEmitter = () => {
    const emitter = new EventEmitter();
    return emitter;
  };
  const requestEmitter = createRequestEmitter();
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
    retryOnReconnect: true,
  });
  const resolvedRequests = {};
  /**
   * Default store cache
   */
  const defaultCache = {
    get(k) {
      return resolvedRequests[k];
    },
    set(k, v) {
      resolvedRequests[k] = v;
    },
    delete(k) {
      delete resolvedRequests[k];
    },
  };
  const valuesMemory = {};
  function FetcherConfig(props) {
    var _a, _b, _c, _d, _e;
    const { children, defaults = {}, baseUrl } = props;
    const previousConfig = useContext(FetcherContext);
    const { cache = defaultCache } = previousConfig;
    let base =
      typeof baseUrl === "undefined"
        ? typeof previousConfig.baseUrl === "undefined"
          ? ""
          : previousConfig.baseUrl
        : baseUrl;
    for (let defaultKey in defaults) {
      const { id } = defaults[defaultKey];
      const resolvedKey = JSON.stringify({
        uri: typeof id === "undefined" ? `${base}${defaultKey}` : undefined,
        idString: typeof id === "undefined" ? undefined : JSON.stringify(id),
        config:
          typeof id === "undefined"
            ? {
                method:
                  (_b =
                    (_a = defaults[defaultKey]) === null || _a === void 0
                      ? void 0
                      : _a.config) === null || _b === void 0
                    ? void 0
                    : _b.method,
              }
            : undefined,
      });
      if (typeof id !== "undefined") {
        valuesMemory[JSON.stringify(id)] =
          (_c = defaults[defaultKey]) === null || _c === void 0
            ? void 0
            : _c.value;
        fetcherDefaults[JSON.stringify(id)] =
          (_d = defaults[defaultKey]) === null || _d === void 0
            ? void 0
            : _d.value;
      }
      cache.set(
        resolvedKey,
        (_e = defaults[defaultKey]) === null || _e === void 0
          ? void 0
          : _e.value
      );
    }
    let mergedConfig = Object.assign(
      Object.assign(Object.assign({}, previousConfig), props),
      {
        headers: Object.assign(
          Object.assign({}, previousConfig.headers),
          props.headers
        ),
      }
    );
    return React.createElement(
      FetcherContext.Provider,
      { value: mergedConfig },
      children
    );
  }
  /**
   * Revalidate requests that match an id or ids
   */
  function revalidate(id) {
    if (Array.isArray(id)) {
      id.map((reqId) => {
        if (typeof reqId !== "undefined") {
          const key = JSON.stringify(reqId);
          const resolveKey = JSON.stringify({ idString: key });
          previousConfig[resolveKey] = undefined;
          requestEmitter.emit(key);
        }
      });
    } else {
      if (typeof id !== "undefined") {
        const key = JSON.stringify(id);
        const resolveKey = JSON.stringify({ idString: key });
        previousConfig[resolveKey] = undefined;
        requestEmitter.emit(key);
      }
    }
  }
  const fetcherDefaults = {};
  const cacheForMutation = {};
  /**
   * Force mutation in requests from anywhere. This doesn't revalidate requests
   */
  function mutateData(...pairs) {
    for (let pair of pairs) {
      try {
        const [k, v, _revalidate] = pair;
        const key = JSON.stringify({ idString: JSON.stringify(k) });
        const requestCallId = "";
        if (typeof v === "function") {
          let newVal = v(cacheForMutation[key]);
          requestEmitter.emit(key, {
            data: newVal,
            requestCallId,
          });
          if (_revalidate) {
            previousConfig[key] = undefined;
            requestEmitter.emit(JSON.stringify(k));
          }
        } else {
          requestEmitter.emit(key, {
            requestCallId,
            data: v,
          });
          if (_revalidate) {
            previousConfig[key] = undefined;
            requestEmitter.emit(JSON.stringify(k));
          }
        }
      } catch (err) {}
    }
  }
  /**
   * Get the current fetcher config
   */
  function useFetcherConfig() {
    const ftxcf = useContext(FetcherContext);
    // Remove the 'method' strings
    for (let k in ftxcf) {
      if (k.match(/[0-9]/)) {
        delete ftxcf[k];
      }
    }
    return ftxcf;
  }
  /**
   * Get the data state of a request using its id
   */
  function useFetcherData(id) {
    const { data } = useFetcher({
      id: id,
    });
    return data;
  }
  /**
   * Get the loading state of a request using its id
   */
  function useFetcherLoading(id) {
    const idString = JSON.stringify({ idString: JSON.stringify(id) });
    const { data } = useFetcher({
      id: id,
    });
    return typeof runningRequests[idString] === "undefined"
      ? true
      : runningRequests[idString];
  }
  /**
   * Get the error state of a request using its id
   */
  function useFetcherError(id) {
    const { error } = useFetcher({
      id: id,
    });
    return error;
  }
  /**
   * Get everything from a `useFetcher` call using its id
   */
  function useFetcherId(id) {
    const defaultsKey = JSON.stringify({
      idString: JSON.stringify(id),
    });
    const def = fetcherDefaults[defaultsKey];
    return useFetcher({
      id,
      default: def,
    });
  }
  /**
   * Fetcher hook
   */
  const useFetcher = (init, options) => {
    const ctx = useContext(FetcherContext);
    const { cache = defaultCache } = {};
    const optionsConfig =
      typeof init === "string"
        ? Object.assign(
            {
              // Pass init as the url if init is a string
              url: init,
            },
            options
          )
        : init;
    const {
      onOnline = ctx.onOnline,
      onOffline = ctx.onOffline,
      url = "",
      id,
      config = {
        query: {},
        params: {},
        baseUrl: undefined,
        method: "GET",
        headers: {},
        body: undefined,
        formatBody: false,
      },
      resolver = typeof ctx.resolver === "function"
        ? ctx.resolver
        : (d) => d.json(),
      onError = () => {},
      auto = typeof ctx.auto === "undefined" ? true : ctx.auto,
      memory = typeof ctx.memory === "undefined" ? true : ctx.memory,
      onResolve = () => {},
      onAbort = () => {},
      refresh = typeof ctx.refresh === "undefined" ? 0 : ctx.refresh,
      cancelOnChange = false, //typeof ctx.refresh === "undefined" ? false : ctx.refresh,
      attempts = ctx.attempts,
      attemptInterval = ctx.attemptInterval,
      revalidateOnFocus = ctx.revalidateOnFocus,
    } = optionsConfig;
    const requestCallId = React.useMemo(
      () => `${Math.random()}`.split(".")[1],
      []
    );
    const retryOnReconnect =
      optionsConfig.auto === false
        ? false
        : typeof optionsConfig.retryOnReconnect !== "undefined"
        ? optionsConfig.retryOnReconnect
        : ctx.retryOnReconnect;
    const idString = JSON.stringify(id);
    const [reqQuery, setReqQuery] = useState(
      Object.assign(Object.assign({}, ctx.query), config.query)
    );
    const [reqParams, setReqParams] = useState(
      Object.assign(Object.assign({}, ctx.params), config.params)
    );
    useEffect(() => {
      setReqParams(Object.assign(Object.assign({}, ctx.params), config.params));
    }, [
      JSON.stringify(
        Object.assign(Object.assign({}, ctx.params), config.params)
      ),
    ]);
    useEffect(() => {
      setReqQuery(Object.assign(Object.assign({}, ctx.query), config.query));
    }, [JSON.stringify(ctx.query), JSON.stringify(config.query), url]);
    const rawUrl =
      (url.startsWith("http://") || url.startsWith("https://")
        ? ""
        : typeof config.baseUrl === "undefined"
        ? typeof ctx.baseUrl === "undefined"
          ? ""
          : ctx.baseUrl
        : config.baseUrl) + url;
    const urlWithParams = React.useMemo(
      () =>
        rawUrl
          .split("/")
          .map((segment) => {
            if (segment.startsWith("[") && segment.endsWith("]")) {
              const paramName = segment.replace(/\[|\]/g, "");
              if (!(paramName in reqParams)) {
                console.warn(
                  `Param '${paramName}' does not exist in request configuration for '${url}'`
                );
                return paramName;
              }
              return reqParams[segment.replace(/\[|\]/g, "")];
            } else if (segment.startsWith(":")) {
              const paramName = segment.split("").slice(1).join("");
              if (!(paramName in reqParams)) {
                console.warn(
                  `Param '${paramName}' does not exist in request configuration for '${url}'`
                );
                return paramName;
              }
              return reqParams[paramName];
            } else {
              return segment;
            }
          })
          .join("/"),
      [JSON.stringify(reqParams), config.baseUrl, ctx.baseUrl, url]
    );
    const realUrl = urlWithParams + (urlWithParams.includes("?") ? `&` : "?");
    const [resKey, qp] = realUrl.split("?");
    const resolvedKey = JSON.stringify({
      uri: typeof id === "undefined" ? rawUrl : undefined,
      idString: typeof id === "undefined" ? undefined : idString,
      config:
        typeof id === "undefined"
          ? {
              method:
                config === null || config === void 0 ? void 0 : config.method,
            }
          : undefined,
    });
    // This helps pass default values to other useFetcher calls using the same id
    useEffect(() => {
      if (typeof optionsConfig.default !== "undefined") {
        if (typeof fetcherDefaults[idString] === "undefined") {
          if (url !== "") {
            fetcherDefaults[idString] = optionsConfig.default;
          } else {
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              data: optionsConfig.default,
            });
          }
        }
      } else {
        if (typeof fetcherDefaults[idString] !== "undefined") {
          setData(fetcherDefaults[idString]);
        }
      }
    }, [idString]);
    const def =
      idString in fetcherDefaults
        ? fetcherDefaults[idString]
        : optionsConfig.default;
    useEffect(() => {
      if (!auto) {
        runningRequests[resolvedKey] = false;
      }
    }, []);
    useEffect(() => {
      let queryParamsFromString = {};
      // getting query params from passed url
      const queryParts = qp.split("&");
      queryParts.forEach((q, i) => {
        const [key, value] = q.split("=");
        if (queryParamsFromString[key] !== value) {
          queryParamsFromString[key] = `${value}`;
        }
      });
      const tm1 = setTimeout(() => {
        setReqQuery((previousQuery) =>
          Object.assign(Object.assign({}, previousQuery), queryParamsFromString)
        );
        clearTimeout(tm1);
      }, 0);
      const tm = setTimeout(() => {
        clearTimeout(tm);
      }, 0);
    }, [JSON.stringify(reqQuery)]);
    const requestCache = cache.get(resolvedKey);
    const [data, setData] = useState(
      // Saved to base url of request without query params
      memory ? requestCache || valuesMemory[rawUrl] || def : def
    );
    // Used JSON as deppendency instead of directly using a reference to data
    const rawJSON = JSON.stringify(data);
    const [online, setOnline] = useState(true);
    const [requestBody, setRequestBody] = useState(
      typeof FormData !== "undefined"
        ? config.body instanceof FormData
          ? config.body
          : typeof ctx.body !== "undefined" ||
            typeof config.body !== "undefined"
          ? Object.assign(Object.assign({}, ctx.body), config.body)
          : undefined
        : config.body
    );
    const [requestHeaders, setRequestHeades] = useState(
      Object.assign(Object.assign({}, ctx.headers), config.headers)
    );
    const [response, setResponse] = useState();
    const [statusCode, setStatusCode] = useState();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completedAttempts, setCompletedAttempts] = useState(0);
    const [requestAbortController, setRequestAbortController] = useState(
      new AbortController()
    );
    async function fetchData(c = {}) {
      var _a;
      if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
        if (cancelOnChange) {
          requestAbortController === null || requestAbortController === void 0
            ? void 0
            : requestAbortController.abort();
        }
        if (!runningRequests[resolvedKey]) {
          setLoading(true);
          previousConfig[resolvedKey] = JSON.stringify(optionsConfig);
          runningRequests[resolvedKey] = true;
          let newAbortController = new AbortController();
          setRequestAbortController(newAbortController);
          setError(null);
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            loading,
            requestAbortController: newAbortController,
            error: null,
          });
          try {
            const json = await fetch(realUrl + c.query, {
              signal: newAbortController.signal,
              method: config.method,
              headers: Object.assign(
                Object.assign(
                  Object.assign(
                    {
                      "Content-Type":
                        // If body is form-data, set Content-Type header to 'multipart/form-data'
                        typeof FormData !== "undefined" &&
                        config.body instanceof FormData
                          ? "multipart/form-data"
                          : "application/json",
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
                ? typeof config.formatBody === "function"
                  ? config.formatBody(
                      typeof FormData !== "undefined" &&
                        config.body instanceof FormData
                        ? config.body
                        : Object.assign(Object.assign({}, config.body), c.body)
                    )
                  : config.formatBody === false ||
                    (typeof FormData !== "undefined" &&
                      config.body instanceof FormData)
                  ? config.body
                  : JSON.stringify(
                      Object.assign(Object.assign({}, config.body), c.body)
                    )
                : undefined,
            });
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              response: json,
            });
            const code = json.status;
            setStatusCode(code);
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              code,
            });
            const _data = await resolver(json);
            if (code >= 200 && code < 400) {
              if (memory) {
                cache.set(resolvedKey, _data);
                valuesMemory[idString] = _data;
              }
              setData(_data);
              cacheForMutation[idString] = _data;
              setError(null);
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                data: _data,
                error: null,
              });
              onResolve(_data, json);
              requestEmitter.emit(idString + "value", {
                data: _data,
              });
              runningRequests[resolvedKey] = false;
              // If a request completes succesfuly, we reset the error attempts to 0
              setCompletedAttempts(0);
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                completedAttempts: 0,
              });
            } else {
              if (def) {
                setData(def);
                cacheForMutation[idString] = def;
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: def,
                });
              }
              setError(true);
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                error: true,
              });
              onError(_data, json);
              runningRequests[resolvedKey] = false;
            }
          } catch (err) {
            const errorString =
              err === null || err === void 0 ? void 0 : err.toString();
            // Only set error if no abort
            if (!`${errorString}`.match(/abort/i)) {
              if (typeof requestCache === "undefined") {
                setData(def);
                cacheForMutation[idString] = def;
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: def,
                });
              } else {
                setData(requestCache);
                cacheForMutation[idString] = requestCache;
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: requestCache,
                });
              }
              let _error = new Error(err);
              setError(_error);
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                error: _error,
              });
              onError(err);
            } else {
              if (typeof requestCache === "undefined") {
                if (typeof def !== "undefined") {
                  setData(def);
                  cacheForMutation[idString] = def;
                }
                requestEmitter.emit(resolvedKey, {
                  requestCallId,
                  data: def,
                });
              }
            }
          } finally {
            setLoading(false);
            runningRequests[resolvedKey] = false;
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              loading: false,
            });
          }
        }
      }
    }
    useEffect(() => {
      const { signal } = requestAbortController || {};
      // Run onAbort callback
      const abortCallback = () => {
        if (loading) {
          if (runningRequests[resolvedKey]) {
            onAbort();
          }
        }
      };
      signal === null || signal === void 0
        ? void 0
        : signal.addEventListener("abort", abortCallback);
      return () => {
        signal === null || signal === void 0
          ? void 0
          : signal.removeEventListener("abort", abortCallback);
      };
    }, [requestAbortController, resolvedKey, onAbort, loading]);
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
    );
    useEffect(() => {
      async function waitFormUpdates(v) {
        if (v.requestCallId !== requestCallId) {
          const {
            isMutating,
            data,
            error,
            online,
            loading,
            response,
            requestAbortController,
            code,
            completedAttempts,
          } = v;
          if (typeof completedAttempts !== "undefined") {
            setCompletedAttempts(completedAttempts);
          }
          if (typeof code !== "undefined") {
            setStatusCode(code);
          }
          if (typeof requestAbortController !== "undefined") {
            setRequestAbortController(requestAbortController);
          }
          if (typeof response !== "undefined") {
            setResponse(response);
          }
          if (typeof loading !== "undefined") {
            setLoading(loading);
          }
          if (typeof data !== "undefined") {
            setData(data);
            cacheForMutation[idString] = data;
            if (!isMutating) {
              onResolve(data);
            }
            setError(null);
          }
          if (typeof error !== "undefined") {
            setError(error);
            if (error !== null && error !== false) {
              onError(error);
            }
          }
          if (typeof online !== "undefined") {
            setOnline(online);
          }
        }
      }
      requestEmitter.addListener(resolvedKey, waitFormUpdates);
      return () => {
        requestEmitter.removeListener(resolvedKey, waitFormUpdates);
      };
    }, [resolvedKey, id, requestAbortController, stringDeps]);
    const reValidate = React.useCallback(
      async function reValidate() {
        // Only revalidate if request was already completed
        if (!loading) {
          if (!runningRequests[resolvedKey]) {
            previousConfig[resolvedKey] = undefined;
            setLoading(true);
            const reqQ = Object.assign(
              Object.assign({}, ctx.query),
              config.query
            );
            if (url !== "") {
              fetchData({
                query: Object.keys(reqQ)
                  .map((q) => [q, reqQ[q]].join("="))
                  .join("&"),
              });
            }
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              loading: true,
            });
          }
        }
      },
      [stringDeps, cancelOnChange, url, requestAbortController, loading]
    );
    useEffect(() => {
      async function forceRefresh(v) {
        if (
          typeof (v === null || v === void 0 ? void 0 : v.data) !== "undefined"
        ) {
          try {
            const { data: d } = v;
            if (typeof data !== "undefined") {
              setData(d);
              cacheForMutation[idString] = d;
              cache.set(resolvedKey, d);
              valuesMemory[idString] = d;
            }
          } catch (err) {}
        } else {
          setLoading(true);
          setError(null);
          if (!runningRequests[resolvedKey]) {
            // We are preventing revalidation where we only need updates about
            // 'loading', 'error' and 'data' because the url can be ommited.
            if (url !== "") {
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                loading: true,
                error: null,
              });
              const reqQ = Object.assign(
                Object.assign({}, ctx.query),
                config.query
              );
              fetchData({
                query: Object.keys(reqQ)
                  .map((q) => [q, reqQ[q]].join("="))
                  .join("&"),
              });
            }
          }
        }
      }
      let idString = JSON.stringify(id);
      requestEmitter.addListener(idString, forceRefresh);
      return () => {
        requestEmitter.removeListener(idString, forceRefresh);
      };
    }, [resolvedKey, stringDeps, idString, id]);
    useEffect(() => {
      function backOnline() {
        let willCancel = false;
        function cancelReconectionAttempt() {
          willCancel = true;
        }
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          online: true,
        });
        setOnline(true);
        onOnline({ cancel: cancelReconectionAttempt });
        if (!willCancel) {
          reValidate();
        }
      }
      if (typeof window !== "undefined") {
        if ("addEventListener" in window) {
          if (retryOnReconnect) {
            window.addEventListener("online", backOnline);
            return () => {
              window.removeEventListener("online", backOnline);
            };
          }
        }
      }
    }, [onOnline, reValidate, resolvedKey, retryOnReconnect]);
    useEffect(() => {
      function wentOffline() {
        runningRequests[resolvedKey] = false;
        setOnline(false);
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          online: false,
        });
        onOffline();
      }
      if (typeof window !== "undefined") {
        if ("addEventListener" in window) {
          window.addEventListener("offline", wentOffline);
          return () => {
            window.removeEventListener("offline", wentOffline);
          };
        }
      }
    }, [onOffline, reValidate, resolvedKey, retryOnReconnect]);
    useEffect(() => {
      setRequestHeades((r) => Object.assign(Object.assign({}, r), ctx.headers));
    }, [ctx.headers]);
    useEffect(() => {
      previousConfig[resolvedKey] = undefined;
    }, [requestCallId]);
    useEffect(() => {
      // Attempts will be made after a request fails
      const tm = setTimeout(() => {
        if (error) {
          if (completedAttempts < attempts) {
            reValidate();
            setCompletedAttempts((previousAttempts) => {
              let newAttemptsValue = previousAttempts + 1;
              requestEmitter.emit(resolvedKey, {
                requestCallId,
                completedAttempts: newAttemptsValue,
              });
              return newAttemptsValue;
            });
          } else if (completedAttempts === attempts) {
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              online: false,
            });
            setOnline(false);
          }
          clearTimeout(tm);
        }
      }, attemptInterval * 1000);
      return () => {
        clearInterval(tm);
      };
    }, [error, attempts, rawJSON, attemptInterval, completedAttempts]);
    useEffect(() => {
      // if (error === false) {
      if (completedAttempts === 0) {
        if (refresh > 0 && auto) {
          const interval = setTimeout(reValidate, refresh * 1000);
          return () => clearTimeout(interval);
        }
      }
      // }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, rawJSON, completedAttempts, config]);
    const initMemo = React.useMemo(() => JSON.stringify(optionsConfig), []);
    useEffect(() => {
      if (auto) {
        if (url !== "") {
          if (runningRequests[resolvedKey]) {
            setLoading(true);
          }
          const reqQ = Object.assign(
            Object.assign({}, ctx.query),
            config.query
          );
          fetchData({
            query: Object.keys(reqQ)
              .map((q) => [q, reqQ[q]].join("="))
              .join("&"),
          });
        }
        // It means a url is not passed
        else {
          setError(null);
          setLoading(false);
        }
      } else {
        if (typeof data === "undefined") {
          setData(def);
          cacheForMutation[idString] = def;
        }
        setError(null);
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initMemo, url, stringDeps, refresh, JSON.stringify(config), auto]);
    useEffect(() => {
      if (revalidateOnFocus) {
        if (typeof window !== "undefined") {
          if ("addEventListener" in window) {
            window.addEventListener("focus", reValidate);
            return () => {
              window.removeEventListener("focus", reValidate);
            };
          }
        }
      }
    }, [
      url,
      revalidateOnFocus,
      stringDeps,
      loading,
      reValidate,
      // ctx.children,
      refresh,
      JSON.stringify(config),
    ]);
    const __config = Object.assign(Object.assign({}, config), {
      params: reqParams,
      headers: requestHeaders,
      body: config.body,
      url: resKey,
      rawUrl: realUrl,
      query: reqQuery,
    });
    function forceMutate(newValue) {
      if (typeof newValue !== "function") {
        cache.set(resolvedKey, newValue);
        valuesMemory[idString] = newValue;
        cacheForMutation[idString] = newValue;
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          isMutating: true,
          data: newValue,
        });
        setData(newValue);
      } else {
        setData((prev) => {
          let newVal = newValue(prev);
          cache.set(resolvedKey, newVal);
          valuesMemory[idString] = newVal;
          cacheForMutation[idString] = newVal;
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            data: newVal,
          });
          return newVal;
        });
      }
    }
    const resolvedData = React.useMemo(() => data, [rawJSON]);
    return {
      data: resolvedData,
      loading,
      error,
      online,
      code: statusCode,
      reFetch: reValidate,
      mutate: forceMutate,
      abort: () => {
        requestAbortController.abort();
        if (loading) {
          setError(false);
          setLoading(false);
          setData(requestCache);
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            error: false,
            loading: false,
            data: requestCache,
          });
        }
      },
      config: __config,
      response,
      id,
      /**
       * The request key
       */
      key: resolvedKey,
    };
  };
  // Create a method for each request
  useFetcher.get = createRequestFn("GET", "", {});
  useFetcher.delete = createRequestFn("DELETE", "", {});
  useFetcher.head = createRequestFn("HEAD", "", {});
  useFetcher.options = createRequestFn("OPTIONS", "", {});
  useFetcher.post = createRequestFn("POST", "", {});
  useFetcher.put = createRequestFn("PUT", "", {});
  useFetcher.patch = createRequestFn("PATCH", "", {});
  useFetcher.purge = createRequestFn("PURGE", "", {});
  useFetcher.link = createRequestFn("LINK", "", {});
  useFetcher.unlink = createRequestFn("UNLINK", "", {});
  /**
   * Extend the useFetcher hook
   */
  useFetcher.extend = function extendFetcher(props = {}) {
    const {
      baseUrl = undefined,
      headers = {},
      body = {},
      query = {},
      // json by default
      resolver,
    } = props;
    function useCustomFetcher(init, options) {
      const ctx = useContext(FetcherContext);
      const _a =
          typeof init === "string"
            ? Object.assign(
                {
                  // set url if init is a stringss
                  url: init,
                },
                options
              ) // `url` will be required in init if it is an object
            : init,
        { url = "", config = {} } = _a,
        otherProps = __rest(_a, ["url", "config"]);
      return useFetcher(
        Object.assign(Object.assign({}, otherProps), {
          url: `${url}`,
          // If resolver is present is hook call, use that instead
          resolver:
            resolver ||
            otherProps.resolver ||
            ctx.resolver ||
            ((d) => d.json()),
          config: {
            baseUrl:
              typeof config.baseUrl === "undefined"
                ? typeof ctx.baseUrl === "undefined"
                  ? baseUrl
                  : ctx.baseUrl
                : config.baseUrl,
            method: config.method,
            headers: Object.assign(
              Object.assign(Object.assign({}, headers), ctx.headers),
              config.headers
            ),
            body: Object.assign(
              Object.assign(Object.assign({}, body), ctx.body),
              config.body
            ),
          },
        })
      );
    }
    useCustomFetcher.config = {
      baseUrl,
      headers,
      body,
      query,
    };
    // Creating methods for fetcher.extend
    useCustomFetcher.get = createRequestFn("GET", baseUrl, headers, query);
    useCustomFetcher.delete = createRequestFn(
      "DELETE",
      baseUrl,
      headers,
      query
    );
    useCustomFetcher.head = createRequestFn("HEAD", baseUrl, headers, query);
    useCustomFetcher.options = createRequestFn(
      "OPTIONS",
      baseUrl,
      headers,
      query
    );
    useCustomFetcher.post = createRequestFn("POST", baseUrl, headers, query);
    useCustomFetcher.put = createRequestFn("PUT", baseUrl, headers, query);
    useCustomFetcher.patch = createRequestFn("PATCH", baseUrl, headers, query);
    useCustomFetcher.purge = createRequestFn("PURGE", baseUrl, headers, query);
    useCustomFetcher.link = createRequestFn("LINK", baseUrl, headers, query);
    useCustomFetcher.unlink = createRequestFn(
      "UNLINK",
      baseUrl,
      headers,
      query
    );
    useCustomFetcher.Config = FetcherConfig;
    return useCustomFetcher;
  };
  const fetcher = useFetcher;
  const defaultConfig = { headers: {}, body: undefined };
  /**
   * Basic HttpClient
   */
  class HttpClient {
    async get(path, { headers, body } = defaultConfig, method = "GET") {
      const requestUrl = `${this.baseUrl}${path}`;
      const responseBody = await fetch(
        requestUrl,
        Object.assign(
          {
            method,
            headers: Object.assign(
              {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              headers
            ),
          },
          body ? { body: JSON.stringify(body) } : {}
        )
      );
      const responseData = await responseBody.json();
      return responseData;
    }
    async post(path, props = defaultConfig) {
      return await this.get(path, props, "POST");
    }
    async put(path, props = defaultConfig) {
      return await this.get(path, props, "PUT");
    }
    async delete(path, props = defaultConfig) {
      return await this.get(path, props, "DELETE");
    }
    constructor(url) {
      this.baseUrl = "";
      this.baseUrl = url;
    }
  }
  /**
   * @deprecated - Use the fetcher instead
   *
   * Basic HttpClient
   */
  function createHttpClient(url) {
    return new HttpClient(url);
  }

  window.FetcherConfig = FetcherConfig;
  window.fetcher = fetcher;
  window.mutateData = mutateData;
  window.revalidate = revalidate;
  window.useFetcherConfig = useFetcherConfig;
  window.useFetcher = useFetcher;
  window.useFetcherData = useFetcherData;
  window.useFetcherError = useFetcherError;
  window.useFetcherId = useFetcherId;
  window.useFetcherLoading = useFetcherLoading;
  window.createHttpClient = createHttpClient;
})();
