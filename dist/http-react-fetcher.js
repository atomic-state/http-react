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

  /**
   * Creates a new request function. This is for usage with fetcher and fetcher.extend
   */
  function createRequestFn(method, baseUrl, $headers) {
    return async function (url, init = {}) {
      const {
        default: def,
        resolver = (e) => e.json(),
        config: c = {},
        onResolve = () => {},
        onError = () => {},
      } = init;
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
        const req = await fetch(`${baseUrl || ""}${url}`, reqConfig);
        r = req;
        const data = await resolver(req);
        if ((req === null || req === void 0 ? void 0 : req.status) >= 400) {
          onError(true);
          return {
            res: req,
            data: def,
            error: true,
            code: req === null || req === void 0 ? void 0 : req.status,
            config: Object.assign({ url: `${baseUrl || ""}${url}` }, reqConfig),
          };
        } else {
          onResolve(data, req);
          return {
            res: req,
            data: data,
            error: false,
            code: req === null || req === void 0 ? void 0 : req.status,
            config: Object.assign({ url: `${baseUrl || ""}${url}` }, reqConfig),
          };
        }
      } catch (err) {
        onError(err);
        return {
          res: r,
          data: def,
          error: true,
          code: r === null || r === void 0 ? void 0 : r.status,
          config: Object.assign({ url: `${baseUrl || ""}${url}` }, reqConfig),
        };
      }
    };
  }
  const FetcherContext = React.createContext({
    defaults: {},
    attempts: 0,
    // By default its 5 seconds
    attemptInterval: 5,
    revalidateOnFocus: false,
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
    const [data, setData] = React.useState(def);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
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
    React.useEffect(() => {
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
    React.useEffect(() => {
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
    const previousConfig = React.useContext(FetcherContext);
    let base =
      typeof baseUrl === "undefined"
        ? typeof previousConfig.baseUrl === "undefined"
          ? ""
          : previousConfig.baseUrl
        : baseUrl;
    for (let defaultKey in defaults) {
      resolvedRequests[`${base}${defaultKey}`] = defaults[defaultKey];
    }
    let mergedConfig = Object.assign(Object.assign({}, previousConfig), props);
    for (let e in props) {
      if (e === "headers") {
        mergedConfig.headers = Object.assign(
          Object.assign({}, previousConfig.headers),
          props.headers
        );
      }
    }
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
    const ctx = React.useContext(FetcherContext);
    const {
      url = "/",
      default: def,
      config = {
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
    const realUrl =
      (typeof config.baseUrl === "undefined"
        ? typeof ctx.baseUrl === "undefined"
          ? ""
          : ctx.baseUrl
        : config.baseUrl) + url;
    const resolvedKey = realUrl.split("?")[0];
    const [data, setData] = React.useState(
      // Saved to base url of request without query params
      memory ? resolvedRequests[resolvedKey] || def : def
    );
    const [requestBody, setRequestBody] = React.useState(
      typeof FormData !== "undefined"
        ? config.body instanceof FormData
          ? config.body
          : typeof ctx.body !== "undefined" ||
            typeof config.body !== "undefined"
          ? Object.assign(Object.assign({}, ctx.body), config.body)
          : undefined
        : config.body
    );
    const [requestHeaders, setRequestHeades] = React.useState(
      Object.assign(Object.assign({}, ctx.headers), config.headers)
    );
    const [response, setResponse] = React.useState();
    const [statusCode, setStatusCode] = React.useState();
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [completedAttemps, setCompletedAttempts] = React.useState(0);
    const [requestAbortController, setRequestAbortController] = React.useState(
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
              {
                "Content-Type":
                  // If body is form-data, set Content-Type header to 'multipart/form-data'
                  typeof FormData !== "undefined" &&
                  config.body instanceof FormData
                    ? "multipart/form-data"
                    : "application/json",
              },
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
          setData(undefined);
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
    React.useEffect(() => {
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
    async function reValidate(c = {}) {
      // Only revalidate if request was already completed
      if (c.body) {
        setRequestBody((p) => Object.assign(Object.assign({}, p), c.body));
      }
      if (c.headers) {
        setRequestHeades((p) => Object.assign(Object.assign({}, p), c.headers));
      }
      if (!loading) {
        setLoading(true);
        fetchData(c);
      }
    }

    React.useEffect(() => {
      setRequestHeades((r) => ({
        ...r,
        ...ctx.headers,
      }));
    }, [ctx.headers]);

    React.useEffect(() => {
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
    React.useEffect(() => {
      if (refresh > 0 && auto) {
        const interval = setTimeout(reValidate, refresh * 1000);
        return () => clearTimeout(interval);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, data, config]);

    const stringDeps = JSON.stringify(
      // We ignore children and resolver
      Object.assign(ctx, { children: undefined }, { resolver: undefined })
    );

    React.useEffect(() => {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, stringDeps, ctx.children, refresh, JSON.stringify(config)]);

    React.useEffect(() => {
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
      config: Object.assign(Object.assign({}, config), {
        headers: requestHeaders,
        body: requestBody,
        url: realUrl,
      }),
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
      // json by default
      resolver,
    } = props;
    function useCustomFetcher(init, options) {
      const ctx = React.useContext(FetcherContext);
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
    };
    // Creating methods for fetcher.extend
    useCustomFetcher.get = createRequestFn("GET", baseUrl, headers);
    useCustomFetcher.delete = createRequestFn("DELETE", baseUrl, headers);
    useCustomFetcher.head = createRequestFn("HEAD", baseUrl, headers);
    useCustomFetcher.options = createRequestFn("OPTIONS", baseUrl, headers);
    useCustomFetcher.post = createRequestFn("POST", baseUrl, headers);
    useCustomFetcher.put = createRequestFn("PUT", baseUrl, headers);
    useCustomFetcher.patch = createRequestFn("PATCH", baseUrl, headers);
    useCustomFetcher.purge = createRequestFn("PURGE", baseUrl, headers);
    useCustomFetcher.link = createRequestFn("LINK", baseUrl, headers);
    useCustomFetcher.unlink = createRequestFn("UNLINK", baseUrl, headers);
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

  window.Fetcher = Fetcher;
  window.useFetcher = useFetcher;
  window.createHttpClient = createHttpClient;
  window.FetcherConfig = FetcherConfig;
  window.fetcher = fetcher;
})();
