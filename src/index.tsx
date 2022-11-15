/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { EventEmitter } from "events";

type CustomResponse<T> = Omit<Response, "json"> & {
  json(): Promise<T>;
};

type RequestWithBody = <R = any, BodyType = any>(
  url: string,
  reqConfig?: {
    default?: R;
    config?: {
      query?: any;
      formatBody?(b: BodyType): any;
      headers?: any;
      body?: BodyType;
    };
    resolver?: (r: CustomResponse<R>) => any;
    onError?(error: Error): void;
    onResolve?(data: R, res: CustomResponse<R>): void;
  }
) => Promise<{
  error: any;
  data: R;
  config: any;
  code: number;
  res: CustomResponse<R>;
}>;

/**
 * Creates a new request function. This is for usage with fetcher and fetcher.extend
 */
function createRequestFn(
  method: string,
  baseUrl: string,
  $headers: any,
  q?: any
): RequestWithBody {
  return async function (url, init = {}) {
    const {
      default: def,
      resolver = (e) => e.json(),
      config: c = {},
      onResolve = () => {},
      onError = () => {},
    } = init;

    let query = {
      ...q,
      ...c.query,
    };

    const [, qp = ""] = url.split("?");

    qp.split("&").forEach((q) => {
      const [key, value] = q.split("=");
      if (query[key] !== value) {
        query = {
          ...query,
          [key]: value,
        };
      }
    });

    const reqQueryString = Object.keys(query)
      .map((q) => [q, query[q]].join("="))
      .join("&");

    const { headers = {}, body, formatBody } = c;

    const reqConfig = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...$headers,
        ...headers,
      },
      body: method?.match(/(POST|PUT|DELETE|PATCH)/)
        ? typeof formatBody === "function"
          ? formatBody(
              (typeof FormData !== "undefined" && body instanceof FormData
                ? body
                : body) as any
            )
          : formatBody === false ||
            (typeof FormData !== "undefined" && body instanceof FormData)
          ? body
          : JSON.stringify(body)
        : undefined,
    };

    let r = undefined as any;
    try {
      const req = await fetch(
        `${baseUrl || ""}${url}${
          url.includes("?") ? `&${reqQueryString}` : `?${reqQueryString}`
        }`,
        reqConfig
      );
      r = req;
      const data = await resolver(req);
      if (req?.status >= 400) {
        onError(true as any);
        return {
          res: req,
          data: def,
          error: true,
          code: req?.status,
          config: { url: `${baseUrl || ""}${url}`, ...reqConfig, query },
        };
      } else {
        onResolve(data, req);
        return {
          res: req,
          data: data,
          error: false,
          code: req?.status,
          config: { url: `${baseUrl || ""}${url}`, ...reqConfig, query },
        };
      }
    } catch (err) {
      onError(err);
      return {
        res: r,
        data: def,
        error: true,
        code: r?.status,
        config: { url: `${baseUrl || ""}${url}`, ...reqConfig, query },
      };
    }
  } as RequestWithBody;
}

const runningRequests: any = {};

const createRequestEmitter = () => {
  const emitter = new EventEmitter();

  emitter.setMaxListeners(10e10);

  return emitter;
};

const requestEmitter = createRequestEmitter();

export type CacheStoreType = {
  get(k?: any): any;
  set(k?: any, v?: any): any;
  delete(k?: any): any;
};

type FetcherContextType = {
  headers?: any;
  baseUrl?: string;
  body?: object | FormData;
  defaults?: any;
  resolver?: (r: Response) => any;
  children?: any;
  auto?: boolean;
  memory?: boolean;
  refresh?: number;
  attempts?: number;
  attemptInterval?: number;
  revalidateOnFocus?: boolean;
  query?: any;
  params?: any;
  onOnline?: (e: { cancel: () => void }) => void;
  onOffline?: () => void;
  online?: boolean;
  retryOnReconnect?: boolean;
  cache?: CacheStoreType;
};

const FetcherContext = createContext<FetcherContextType>({
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

type FetcherType<FetchDataType, BodyType> = {
  /**
   * Any serializable id. This is optional.
   */
  id?: any;
  /**
   * url of the resource to fetch
   */
  url: string;
  /**
   * Default data value
   */
  default?: FetchDataType;
  /**
   * Refresh interval (in seconds) to re-fetch the resource
   */
  refresh?: number;
  /**
   * This will prevent automatic requests.
   * By setting this to `false`, requests will
   * only be made by calling `reFetch()`
   */
  auto?: boolean;
  /**
   * Default is true. Responses are saved in memory and used as default data.
   * If `false`, the `default` prop will be used instead.
   */
  memory?: boolean;
  /**
   * Function to run when request is resolved succesfuly
   */
  onResolve?: (data: FetchDataType, req?: Response) => void;
  /**
   * Function to run when the request fails
   */
  onError?: (error: Error, req?: Response) => void;
  /**
   * Function to run when a request is aborted
   */
  onAbort?: () => void;
  /**
   * Whether a change in deps will cancel a queued request and make a new one
   */
  cancelOnChange?: boolean;
  /**
   * Parse as json by default
   */
  resolver?: (d: CustomResponse<FetchDataType>) => any;
  /**
   * The ammount of attempts if request fails
   */
  attempts?: number;
  /**
   * The interval at which to run attempts on request fail
   */
  attemptInterval?: number;
  /**
   * If a request should be made when the tab is focused. This currently works on browsers
   */
  revalidateOnFocus?: boolean;
  /**
   * This will run when connection is interrupted
   */
  onOffline?: () => void;
  /**
   * This will run when connection is restored
   */
  onOnline?: (e: { cancel: () => void }) => void;
  /**
   * If the request should retry when connection is restored
   */
  retryOnReconnect?: boolean;
  /**
   * Request configuration
   */
  config?: {
    /**
     * Override base url
     */
    baseUrl?: string;
    /**
     * Request method
     */
    method?:
      | "GET"
      | "DELETE"
      | "HEAD"
      | "OPTIONS"
      | "POST"
      | "PUT"
      | "PATCH"
      | "PURGE"
      | "LINK"
      | "UNLINK";
    headers?: Headers | object;
    query?: any;
    /**
     * URL params
     */
    params?: any;
    body?: BodyType;
    /**
     * Customize how body is formated for the request. By default it will be sent in JSON format
     * but you can set it to false if for example, you are sending a `FormData`
     * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
     * (the last one is the default behaviour so in that case you can ignore it)
     */
    formatBody?: boolean | ((b: BodyType) => any);
  };
  children?: React.FC<{
    data: FetchDataType | undefined;
    error: Error | null;
    loading: boolean;
  }>;
};

// If first argument is a string
type FetcherConfigOptions<FetchDataType, BodyType = any> = {
  /**
   * Any serializable id. This is optional.
   */
  id?: any;
  /**
   * Default data value
   */
  default?: FetchDataType;
  /**
   * Refresh interval (in seconds) to re-fetch the resource
   */
  refresh?: number;
  /**
   * This will prevent automatic requests.
   * By setting this to `false`, requests will
   * only be made by calling `reFetch()`
   */
  auto?: boolean;
  /**
   * Default is true. Responses are saved in memory and used as default data.
   * If `false`, the `default` prop will be used instead.
   */
  memory?: boolean;
  /**
   * Function to run when request is resolved succesfuly
   */
  onResolve?: (data: FetchDataType) => void;
  /**
   * Function to run when the request fails
   */
  onError?: (error: Error) => void;
  /**
   * Function to run when a request is aborted
   */
  onAbort?: () => void;
  /**
   * Whether a change in deps will cancel a queued request and make a new one
   */
  cancelOnChange?: boolean;
  /**
   * Parse as json by default
   */
  resolver?: (d: CustomResponse<FetchDataType>) => any;
  /**
   * The ammount of attempts if request fails
   */
  attempts?: number;
  /**
   * The interval at which to run attempts on request fail
   */
  attemptInterval?: number;
  /**
   * If a request should be made when the tab is focused. This currently works on browsers
   */
  revalidateOnFocus?: boolean;
  /**
   * This will run when connection is interrupted
   */
  onOffline?: () => void;
  /**
   * This will run when connection is restored
   */
  onOnline?: (e: { cancel: () => void }) => void;
  /**
   * If the request should retry when connection is restored
   */
  retryOnReconnect?: boolean;
  /**
   * Request configuration
   */
  config?: {
    /**
     * Override base url
     */
    baseUrl?: string;

    /**
     * Request method
     */
    method?:
      | "GET"
      | "DELETE"
      | "HEAD"
      | "OPTIONS"
      | "POST"
      | "PUT"
      | "PATCH"
      | "PURGE"
      | "LINK"
      | "UNLINK";
    headers?: Headers | object;
    /**
     * Request query params
     */
    query?: any;
    /**
     * URL params
     */
    params?: any;
    body?: BodyType;
    /**
     * Customize how body is formated for the request. By default it will be sent in JSON format
     * but you can set it to false if for example, you are sending a `FormData`
     * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
     * (the last one is the default behaviour so in that case you can ignore it)
     */
    formatBody?: (b: BodyType) => any;
  };
  children?: React.FC<{
    data: FetchDataType | undefined;
    error: Error | null;
    loading: boolean;
  }>;
};

const resolvedRequests: any = {};

/**
 * Default store cache
 */
const defaultCache: CacheStoreType = {
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

export function FetcherConfig(props: FetcherContextType) {
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
    cache.set(`${base}${defaultKey}`, defaults[defaultKey]);
  }

  let mergedConfig = {
    ...previousConfig,
    ...props,
    headers: {
      ...previousConfig.headers,
      ...props.headers,
    },
  };

  return (
    <FetcherContext.Provider value={mergedConfig}>
      {children}
    </FetcherContext.Provider>
  );
}

/**
 * Revalidate requests that match an id or ids
 */
export function revalidate(id: any | any[]) {
  if (Array.isArray(id)) {
    id.map((reqId) => {
      if (typeof reqId !== "undefined") {
        const key = JSON.stringify(reqId);
        requestEmitter.emit(key);
      }
    });
  } else {
    if (typeof id !== "undefined") {
      const key = JSON.stringify(id);
      requestEmitter.emit(key);
    }
  }
}

/**
 * Fetcher available as a hook
 */

const useFetcher = <FetchDataType extends unknown, BodyType = any>(
  init: FetcherType<FetchDataType, BodyType> | string,
  options?: FetcherConfigOptions<FetchDataType, BodyType>
) => {
  const ctx = useContext(FetcherContext);

  const { cache = defaultCache } = ctx;

  const {
    onOnline = ctx.onOnline,
    onOffline = ctx.onOffline,
    retryOnReconnect = ctx.retryOnReconnect,
    url = "/",
    id = "",
    default: def,
    config = {
      query: {},
      params: {},
      baseUrl: undefined,
      method: "GET",
      headers: {} as Headers,
      body: undefined as unknown as Body,
      formatBody: false,
    },
    resolver = typeof ctx.resolver === "function"
      ? ctx.resolver
      : (d: any) => d.json(),
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
    ? {
        // Pass init as the url if init is a string
        url: init,
        ...options,
      }
    : // `url` will be required in init if it is an object
      init;

  const [reqQuery, setReqQuery] = useState({
    ...ctx.query,
    ...config.query,
  });

  const [reqParams, setReqParams] = useState({
    ...ctx.params,
    ...config.params,
  });

  useEffect(() => {
    setReqParams({
      ...ctx.params,
      ...config.params,
    });
  }, [JSON.stringify({ ...ctx.params, ...config.params })]);

  useEffect(() => {
    setReqQuery({
      ...ctx.query,
      ...config.query,
    });
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

  const reqQueryString = Object.keys(reqQuery)
    .map((q) => [q, reqQuery[q]].join("="))
    .join("&");

  const realUrl =
    urlWithParams +
    (urlWithParams.includes("?") ? `&${reqQueryString}` : "?" + reqQueryString);

  const [resKey, qp] = realUrl.split("?");
  const resolvedKey = JSON.stringify({
    key: rawUrl,
    config: {
      headers: config?.headers,
      query: reqQuery,
      method: config?.method,
      body: config?.method,
      formatBody: undefined,
    },
  });

  const [queryReady, setQueryReady] = useState(false);

  useEffect(() => {
    setQueryReady(false);
    let queryParamsFromString: any = {};
    // getting query params from passed url
    const queryParts = qp.split("&");
    queryParts.forEach((q, i) => {
      const [key, value] = q.split("=");
      if (queryParamsFromString[key] !== value) {
        queryParamsFromString[key] = value;
      }
    });

    const tm1 = setTimeout(() => {
      setReqQuery((previousQuery: any) => ({
        ...previousQuery,
        ...queryParamsFromString,
      }));
      clearTimeout(tm1);
    }, 0);

    const tm = setTimeout(() => {
      setQueryReady(true);
      clearTimeout(tm);
    }, 0);
  }, [JSON.stringify(reqQuery)]);

  const requestCache = cache.get(resolvedKey);

  const [data, setData] = useState<FetchDataType | undefined>(
    // Saved to base url of request without query params
    memory ? requestCache || def : def
  );
  const [requestBody, setRequestBody] = useState<BodyType>(
    (typeof FormData !== "undefined"
      ? config.body instanceof FormData
        ? config.body
        : typeof ctx.body !== "undefined" || typeof config.body !== "undefined"
        ? {
            ...ctx.body,
            ...config.body,
          }
        : undefined
      : config.body) as BodyType
  );

  const [requestHeaders, setRequestHeades] = useState<
    object | Headers | undefined
  >({ ...ctx.headers, ...config.headers });

  const [response, setResponse] = useState<CustomResponse<FetchDataType>>();

  const [statusCode, setStatusCode] = useState<number>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedAttempts, setCompletedAttempts] = useState(0);
  const [requestAbortController, setRequestAbortController] =
    useState<AbortController>(new AbortController());

  const requestCallId = React.useMemo(
    () => `${Math.random()}`.split(".")[1],
    []
  );

  useEffect(() => {
    async function waitFormUpdates(v: any) {
      if (v.requestCallId !== requestCallId) {
        const {
          isMutating,
          data,
          error,
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
      }
    }

    requestEmitter.addListener(resolvedKey, waitFormUpdates);

    return () => {
      requestEmitter.removeListener(resolvedKey, waitFormUpdates);
    };
  }, [resolvedKey]);

  async function fetchData(c: { headers?: any; body?: BodyType } = {}) {
    runningRequests[resolvedKey] = true;
    if (cancelOnChange) {
      requestAbortController?.abort();
    }
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
      const json = await fetch(realUrl, {
        signal: newAbortController.signal,
        method: config.method,
        headers: {
          "Content-Type":
            // If body is form-data, set Content-Type header to 'multipart/form-data'
            typeof FormData !== "undefined" && config.body instanceof FormData
              ? "multipart/form-data"
              : "application/json",
          ...ctx.headers,
          ...config.headers,
          ...c.headers,
        } as Headers,
        body: config.method?.match(/(POST|PUT|DELETE|PATCH)/)
          ? typeof config.formatBody === "function"
            ? config.formatBody(
                (typeof FormData !== "undefined" &&
                config.body instanceof FormData
                  ? (config.body as BodyType)
                  : { ...config.body, ...c.body }) as BodyType
              )
            : config.formatBody === false ||
              (typeof FormData !== "undefined" &&
                config.body instanceof FormData)
            ? config.body
            : JSON.stringify({ ...config.body, ...c.body })
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
        }
        setData(_data);
        setError(null);
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          data: _data,
          error: null,
        });
        onResolve(_data, json);
        runningRequests[resolvedKey] = undefined;

        // If a request completes succesfuly, we reset the error attempts to 0
        setCompletedAttempts(0);
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          completedAttempts: 0,
        });
      } else {
        if (def) {
          setData(def);
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
        runningRequests[resolvedKey] = undefined;
      }
    } catch (err) {
      const errorString = err?.toString();
      // Only set error if no abort
      if (!errorString.match(/abort/i)) {
        if (typeof requestCache === "undefined") {
          setData(def);
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            data: def,
          });
        } else {
          setData(requestCache);
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
          }
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            data: def,
          });
        }
      }
    } finally {
      setLoading(false);
      requestEmitter.emit(resolvedKey, {
        requestCallId,
        loading: false,
      });
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
    signal?.addEventListener("abort", abortCallback);
    return () => {
      signal?.removeEventListener("abort", abortCallback);
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
    async function reValidate(c: { headers?: any; body?: BodyType } = {}) {
      // Only revalidate if request was already completed
      if (c.body) {
        setRequestBody(c.body);
      } else {
        if (config?.body) {
          setRequestBody(config.body as any);
        }
      }
      if (c.headers) {
        setRequestHeades((p) => ({ ...p, ...c.headers }));
      } else {
        setRequestHeades((previousHeaders) => ({
          ...previousHeaders,
          ...config.headers,
        }));
      }

      if (!loading) {
        if (!runningRequests[resolvedKey]) {
          setLoading(true);
          fetchData(c);
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            loading: true,
          });
        }
      }
    },
    [stringDeps, loading]
  );

  useEffect(() => {
    async function forceRefresh() {
      setLoading(true);
      setError(null);
      if (!runningRequests[resolvedKey]) {
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          loading: true,
          error: null,
        });
        fetchData();
      }
    }
    let idString = JSON.stringify(id);
    requestEmitter.addListener(idString, forceRefresh);
    return () => {
      requestEmitter.removeListener(idString, forceRefresh);
    };
  }, [resolvedKey, stringDeps, id]);

  useEffect(() => {
    function backOnline() {
      let willCancel = false;
      function cancelReconectionAttempt() {
        willCancel = true;
      }
      (onOnline as any)({ cancel: cancelReconectionAttempt });
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
      (onOffline as any)();
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
    setRequestHeades((r) => ({
      ...r,
      ...ctx.headers,
    }));
  }, [ctx.headers]);

  useEffect(() => {
    // Attempts will be made after a request fails
    const tm = setTimeout(() => {
      if (error) {
        if (completedAttempts < (attempts as number)) {
          reValidate();
          setCompletedAttempts((previousAttempts) => {
            let newAttemptsValue = previousAttempts + 1;

            requestEmitter.emit(resolvedKey, {
              requestCallId,
              completedAttempts: newAttemptsValue,
            });

            return newAttemptsValue;
          });
        }
        clearTimeout(tm);
      }
    }, (attemptInterval as number) * 1000);

    return () => {
      clearInterval(tm);
    };
  }, [error, attempts, data, attemptInterval, completedAttempts]);

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
  }, [refresh, loading, error, data, completedAttempts, config]);

  useEffect(() => {
    const tm = setTimeout(() => {
      if (queryReady) {
        if (auto) {
          setLoading(true);
          if (!runningRequests[resolvedKey]) {
            fetchData();
          }
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
          window.addEventListener("focus", reValidate as any);

          return () => {
            window.removeEventListener("focus", reValidate as any);
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

  const __config = {
    ...config,
    params: reqParams,
    headers: requestHeaders,
    body: requestBody,
    url: resolvedKey,
    query: reqQuery,
  };

  function forceMutate(
    newValue: FetchDataType | ((prev: FetchDataType) => FetchDataType)
  ) {
    if (typeof newValue !== "function") {
      cache.set(resolvedKey, newValue);
      requestEmitter.emit(resolvedKey, {
        requestCallId,
        isMutating: true,
        data: newValue,
      });
      setData(() => {
        return newValue;
      });
    } else {
      setData((prev) => {
        let newVal = (newValue as any)(prev);
        cache.set(resolvedKey, newVal);
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          data: newVal,
        });
        return newVal;
      });
    }
  }

  return {
    data,
    loading,
    error,
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
  } as unknown as {
    data: FetchDataType;
    loading: boolean;
    error: Error | null;
    code: number;
    reFetch: (c?: { headers?: any; body?: BodyType } | object) => Promise<void>;
    mutate: React.Dispatch<React.SetStateAction<FetchDataType>>;
    abort: () => void;
    config: FetcherType<FetchDataType, BodyType>["config"] & { url: string };
    response: CustomResponse<FetchDataType>;
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

export { useFetcher };
/**
 * Extend the useFetcher hook
 */
useFetcher.extend = function extendFetcher(props: FetcherContextType = {}) {
  const {
    baseUrl = undefined as any,
    headers = {} as Headers,
    body = {},
    query = {},
    // json by default
    resolver,
  } = props;

  function useCustomFetcher<T, BodyType = any>(
    init: FetcherType<T, BodyType> | string,
    options?: FetcherConfigOptions<T, BodyType>
  ) {
    const ctx = useContext(FetcherContext);

    const {
      url = "",
      config = {},
      ...otherProps
    } = typeof init === "string"
      ? {
          // set url if init is a stringss
          url: init,
          ...options,
        }
      : // `url` will be required in init if it is an object
        init;

    return useFetcher<T, BodyType>({
      ...otherProps,
      url: `${url}`,
      // If resolver is present is hook call, use that instead
      resolver:
        resolver || otherProps.resolver || ctx.resolver || ((d) => d.json()),
      config: {
        baseUrl:
          typeof config.baseUrl === "undefined"
            ? typeof ctx.baseUrl === "undefined"
              ? baseUrl
              : ctx.baseUrl
            : config.baseUrl,
        method: config.method,
        headers: {
          ...headers,
          ...ctx.headers,
          ...config.headers,
        },
        body: {
          ...body,
          ...ctx.body,
          ...config.body,
        } as any,
      },
    });
  }
  useCustomFetcher.config = {
    baseUrl,
    headers,
    body,
    query,
  };

  // Creating methods for fetcher.extend
  useCustomFetcher.get = createRequestFn("GET", baseUrl, headers, query);
  useCustomFetcher.delete = createRequestFn("DELETE", baseUrl, headers, query);
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
  useCustomFetcher.unlink = createRequestFn("UNLINK", baseUrl, headers, query);

  useCustomFetcher.Config = FetcherConfig;

  return useCustomFetcher;
};

export const fetcher = useFetcher;

// Http client

interface IRequestParam {
  headers?: any;
  body?: any;
  /**
   * Customize how body is formated for the request. By default it will be sent in JSON format
   * but you can set it to false if for example, you are sending a `FormData`
   * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
   * (the last one is the default behaviour so in that case you can ignore it)
   */
  formatBody?: boolean | ((b: any) => any);
}

type requestType = <T>(path: string, data: IRequestParam) => Promise<T>;

interface IHttpClient {
  baseUrl: string;
  get: requestType;
  post: requestType;
  put: requestType;
  delete: requestType;
}

const defaultConfig = { headers: {}, body: undefined };

/**
 * Basic HttpClient
 */
class HttpClient implements IHttpClient {
  baseUrl = "";
  async get<T>(
    path: string,
    { headers, body }: IRequestParam = defaultConfig,
    method: string = "GET"
  ): Promise<T> {
    const requestUrl = `${this.baseUrl}${path}`;
    const responseBody = await fetch(requestUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const responseData: T = await responseBody.json();
    return responseData;
  }
  async post<T>(
    path: string,
    props: IRequestParam = defaultConfig
  ): Promise<T> {
    return await this.get(path, props, "POST");
  }
  async put<T>(path: string, props: IRequestParam = defaultConfig): Promise<T> {
    return await this.get(path, props, "PUT");
  }

  async delete<T>(
    path: string,
    props: IRequestParam = defaultConfig
  ): Promise<T> {
    return await this.get(path, props, "DELETE");
  }

  constructor(url: string) {
    this.baseUrl = url;
  }
}

/**
 * @deprecated - Use the fetcher instead
 *
 * Basic HttpClient
 */
export function createHttpClient(url: string) {
  return new HttpClient(url);
}
