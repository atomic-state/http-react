"use strict";
/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(() => {
  /**
   * @license http-react-fetcher
   * Copyright (c) Dany Beltran
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
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
  const FetcherContext = createContext({
    defaults: {},
    attempts: 0,
    // By default its 5 seconds
    attemptInterval: 5,
    revalidateOnFocus: false,
    query: {},
    params: {},
    onOffline() {},
    onOnline() {},
    online: true,
    retryOnReconnect: true,
  });
  /**
   * @deprecated Use the `useFetcher` hook instead
   */
  const Fetcher = ({
    url = "/",
    default: def,
    config = { method: "GET", headers: {}, body: {} },
    children: Children,
    onError = () => {},
    onResolve = () => {},
    refresh = 0,
  }) => {
    const [data, setData] = useState(def);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    async function fetchData() {
      var _a;
      try {
        const json = await fetch(url, {
          method: config.method,
          headers: Object.assign(
            { "Content-Type": "application/json" },
            config.headers
          ),
          body: (
            (_a = config.method) === null || _a === void 0
              ? void 0
              : _a.match(/(POST|PUT|DELETE|PATCH)/)
          )
            ? JSON.stringify(config.body)
            : undefined,
        });
        const _data = await json.json();
        const code = json.status;
        if (code >= 200 && code < 300) {
          setData(_data);
          setError(null);
          onResolve(_data, json);
        } else {
          if (def) {
            setData(def);
          }
          setError(true);
          onError(_data);
        }
      } catch (err) {
        setData(undefined);
        setError(new Error(err));
        onError(err);
      } finally {
        setLoading(false);
      }
    }
    useEffect(() => {
      async function reValidate() {
        if ((data || error) && !loading) {
          setLoading(true);
          fetchData();
        }
      }
      if (refresh > 0) {
        const interval = setTimeout(reValidate, refresh * 1000);
        return () => clearTimeout(interval);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, data, config]);
    useEffect(() => {
      setLoading(true);
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, refresh, config]);
    if (typeof Children !== "undefined") {
      return React.createElement(Children, {
        data: data,
        error: error,
        loading: loading,
      });
    } else {
      return null;
    }
  };
  const resolvedRequests = {};
  function FetcherConfig(props) {
    const { children, defaults = {}, baseUrl } = props;
    const previousConfig = useContext(FetcherContext);
    let base =
      typeof baseUrl === "undefined"
        ? typeof previousConfig.baseUrl === "undefined"
          ? ""
          : previousConfig.baseUrl
        : baseUrl;
    for (let defaultKey in defaults) {
      resolvedRequests[`${base}${defaultKey}`] = defaults[defaultKey];
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
   * Fetcher available as a hook
   */
  const useFetcher = (init, options) => {
    const ctx = useContext(FetcherContext);
    const {
      onOnline = ctx.onOnline,
      onOffline = ctx.onOffline,
      retryOnReconnect = ctx.retryOnReconnect,
      url = "/",
      default: def,
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
      auto = typeof ctx.auto === "undefined" ? true : ctx.memory,
      memory = typeof ctx.memory === "undefined" ? true : ctx.memory,
      onResolve = () => {},
      onAbort = () => {},
      refresh = typeof ctx.refresh === "undefined" ? 0 : ctx.refresh,
      cancelOnChange = typeof ctx.refresh === "undefined" ? false : ctx.refresh,
      attempts = ctx.attempts,
      attemptInterval = ctx.attemptInterval,
      revalidateOnFocus = ctx.revalidateOnFocus,
    } = typeof init === "string"
      ? Object.assign(
          {
            // Pass init as the url if init is a string
            url: init,
          },
          options
        ) // `url` will be required in init if it is an object
      : init;
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
      (typeof config.baseUrl === "undefined"
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
    const reqQueryString = Object.keys(reqQuery)
      .map((q) => [q, reqQuery[q]].join("="))
      .join("&");
    const realUrl =
      urlWithParams +
      (urlWithParams.includes("?")
        ? `&${reqQueryString}`
        : "?" + reqQueryString);
    const [resolvedKey, qp] = realUrl.split("?");
    const [queryReady, setQueryReady] = useState(false);
    useEffect(() => {
      setQueryReady(false);
      let queryParamsFromString = {};
      // getting query params from passed url
      const queryParts = qp.split("&");
      queryParts.forEach((q, i) => {
        const [key, value] = q.split("=");
        if (queryParamsFromString[key] !== value) {
          queryParamsFromString[key] = value;
        }
      });
      const tm1 = setTimeout(() => {
        setReqQuery((previousQuery) =>
          Object.assign(Object.assign({}, previousQuery), queryParamsFromString)
        );
        clearTimeout(tm1);
      }, 0);
      const tm = setTimeout(() => {
        setQueryReady(true);
        clearTimeout(tm);
      }, 0);
    }, [JSON.stringify(reqQuery)]);
    const [data, setData] = useState(
      // Saved to base url of request without query params
      memory ? resolvedRequests[resolvedKey] || def : def
    );
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
    const [completedAttemps, setCompletedAttempts] = useState(0);
    const [requestAbortController, setRequestAbortController] = useState(
      new AbortController()
    );
    async function fetchData(c = {}) {
      var _a;
      if (cancelOnChange) {
        requestAbortController === null || requestAbortController === void 0
          ? void 0
          : requestAbortController.abort();
      }
      let newAbortController = new AbortController();
      setRequestAbortController(newAbortController);
      setError(null);
      try {
        const json = await fetch(realUrl, {
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
        setResponse(json);
        const code = json.status;
        setStatusCode(code);
        const _data = await resolver(json);
        if (code >= 200 && code < 400) {
          if (memory) {
            resolvedRequests[resolvedKey] = _data;
          }
          setData(_data);
          setError(null);
          onResolve(_data, json);
          // If a request completes succesfuly, we reset the error attempts to 0
          setCompletedAttempts(0);
        } else {
          if (def) {
            setData(def);
          }
          setError(true);
          onError(_data, json);
        }
      } catch (err) {
        const errorString =
          err === null || err === void 0 ? void 0 : err.toString();
        // Only set error if no abort
        if (!errorString.match(/abort/i)) {
          if (!resolvedRequests[resolvedKey]) {
            setData(def);
          } else {
            setData(resolvedRequests[resolvedKey]);
          }
          setError(new Error(err));
          onError(err);
        } else {
          if (!resolvedRequests[resolvedKey]) {
            setData(def);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    useEffect(() => {
      const { signal } = requestAbortController || {};
      // Run onAbort callback
      const abortCallback = () => {
        const timeout = setTimeout(() => {
          onAbort();
          clearTimeout(timeout);
        });
      };
      signal === null || signal === void 0
        ? void 0
        : signal.addEventListener("abort", abortCallback);
      return () => {
        signal === null || signal === void 0
          ? void 0
          : signal.removeEventListener("abort", abortCallback);
      };
    }, [requestAbortController, onAbort]);
    const stringDeps = JSON.stringify(
      // We ignore children and resolver
      Object.assign(
        ctx,
        { children: undefined },
        { resolver: undefined },
        { reqQuery },
        { reqParams }
      )
    );
    const reValidate = React.useCallback(
      async function reValidate(c = {}) {
        // Only revalidate if request was already completed
        if (c.body) {
          setRequestBody(c.body);
        } else {
          if (config === null || config === void 0 ? void 0 : config.body) {
            setRequestBody(config.body);
          }
        }
        if (c.headers) {
          setRequestHeades((p) =>
            Object.assign(Object.assign({}, p), c.headers)
          );
        } else {
          setRequestHeades((previousHeaders) =>
            Object.assign(Object.assign({}, previousHeaders), config.headers)
          );
        }
        if (!loading) {
          setLoading(true);
          fetchData(c);
        }
      },
      [stringDeps, loading]
    );
    useEffect(() => {
      function backOnline() {
        let willCancel = false;
        function cancelReconectionAttempt() {
          willCancel = true;
        }
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
    }, [onOnline, retryOnReconnect]);
    useEffect(() => {
      function wentOffline() {
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
    }, [onOnline]);
    useEffect(() => {
      setRequestHeades((r) => Object.assign(Object.assign({}, r), ctx.headers));
    }, [ctx.headers]);
    useEffect(() => {
      // Attempts will be made after a request fails
      if (error) {
        if (completedAttemps < attempts) {
          const tm = setTimeout(() => {
            reValidate();
            setCompletedAttempts((previousAttempts) => previousAttempts + 1);
            clearTimeout(tm);
          }, attemptInterval * 1000);
        }
      }
    }, [error, attempts, attemptInterval, completedAttemps]);
    useEffect(() => {
      if (refresh > 0 && auto) {
        const interval = setTimeout(reValidate, refresh * 1000);
        return () => clearTimeout(interval);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, data, config]);
    useEffect(() => {
      const tm = setTimeout(() => {
        if (queryReady) {
          if (auto) {
            setLoading(true);
            fetchData();
          } else {
            if (typeof data === "undefined") {
              setData(def);
            }
            setError(null);
            setLoading(false);
          }
        }
      }, 0);
      return () => {
        clearTimeout(tm);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      url,
      stringDeps,
      ctx.children,
      refresh,
      JSON.stringify(config),
      queryReady,
    ]);
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
      ctx.children,
      refresh,
      JSON.stringify(config),
    ]);
    const __config = Object.assign(Object.assign({}, config), {
      params: reqParams,
      headers: requestHeaders,
      body: requestBody,
      url: resolvedKey,
      query: reqQuery,
    });
    return {
      data,
      loading,
      error,
      code: statusCode,
      reFetch: reValidate,
      mutate: setData,
      abort: () => {
        requestAbortController.abort();
        if (loading) {
          setError(false);
          setLoading(false);
          setData(resolvedRequests[resolvedKey]);
        }
      },
      config: __config,
      response,
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
    constructor(url) {
      this.baseUrl = "";
      this.baseUrl = url;
    }
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
  }
  /**
   * @deprecated - Use the fetcher instead
   *
   * Basic HttpClient
   */
  function createHttpClient(url) {
    return new HttpClient(url);
  }

  window.createHttpClient = createHttpClient;
  window.fetcher = useFetcher;
  window.FetcherConfig = FetcherConfig;
  window.useFetcher = useFetcher;
})();
