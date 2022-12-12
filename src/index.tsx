/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { EventEmitter } from "events";

type CustomResponse<T> = Omit<Response, "json"> & {
  json(): Promise<T>;
};

type RequestWithBody = <R = any, BodyType = any>(
  /**
   * The request url
   */
  url: string,
  /**
   * The request configuration
   */
  reqConfig?: {
    /**
     * Default value
     */
    default?: R;
    /**
     * Other configuration
     */
    config?: {
      /**
       * Request query
       */
      query?: any;
      /**
       * The function that formats the body
       */
      formatBody?(b: BodyType): any;
      /**
       * Request headers
       */
      headers?: any;
      /**
       * Request params (like Express)
       */
      params?: any;
      /**
       * The request body
       */
      body?: BodyType;
    };
    /**
     * The function that returns the resolved data
     */
    resolver?: (r: CustomResponse<R>) => any;
    /**
     * A function that will run when the request fails
     */
    onError?(error: Error): void;
    /**
     * A function that will run when the request completes succesfuly
     */
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

    const { params = {} } = c || {};

    let query = {
      ...q,
      ...c.query,
    };

    const rawUrl = url
      .split("/")
      .map((segment) => {
        if (segment.startsWith("[") && segment.endsWith("]")) {
          const paramName = segment.replace(/\[|\]/g, "");
          if (!(paramName in params)) {
            console.warn(
              `Param '${paramName}' does not exist in request configuration for '${url}'`
            );
            return paramName;
          }
          return params[segment.replace(/\[|\]/g, "")];
        } else if (segment.startsWith(":")) {
          const paramName = segment.split("").slice(1).join("");
          if (!(paramName in params)) {
            console.warn(
              `Param '${paramName}' does not exist in request configuration for '${url}'`
            );
            return paramName;
          }
          return params[paramName];
        } else {
          return segment;
        }
      })
      .join("/");

    const [, qp = ""] = rawUrl.split("?");

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
        `${baseUrl || ""}${rawUrl}${
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
          config: { url: `${baseUrl || ""}${rawUrl}`, ...reqConfig, query },
        };
      } else {
        onResolve(data, req);
        return {
          res: req,
          data: data,
          error: false,
          code: req?.status,
          config: { url: `${baseUrl || ""}${rawUrl}`, ...reqConfig, query },
        };
      }
    } catch (err) {
      onError(err as any);
      return {
        res: r,
        data: def,
        error: true,
        code: r?.status,
        config: { url: `${baseUrl || ""}${rawUrl}`, ...reqConfig, query },
      };
    }
  } as RequestWithBody;
}

const runningRequests: any = {};

const previousConfig: any = {};

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
  /**
   * Keys in `defaults` are just friendly names. Defaults are based on the `id` and `value` passed
   */
  defaults?: {
    [key: string]: {
      /**
       * The `id` passed to the request
       */
      id?: any;
      /**
       * Default value for this request
       */
      value?: any;
      config?: any;
    };
  };
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
  attemptInterval: 2,
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
  url?: string;
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
   * @deprecated - Use the `abort` function to cancel a request instead
   *
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
   * @deprecated Use the `abort` function to cancel a request instead
   *
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

const valuesMemory: any = {};

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
    const { id } = defaults[defaultKey];
    const resolvedKey = JSON.stringify({
      uri: typeof id === "undefined" ? `${base}${defaultKey}` : undefined,
      idString: typeof id === "undefined" ? undefined : JSON.stringify(id),
      config:
        typeof id === "undefined"
          ? {
              method: defaults[defaultKey]?.config?.method,
            }
          : undefined,
    });

    if (typeof id !== "undefined") {
      valuesMemory[JSON.stringify(id)] = defaults[defaultKey]?.value;

      fetcherDefaults[JSON.stringify(id)] = defaults[defaultKey]?.value;
    }

    cache.set(resolvedKey, defaults[defaultKey]?.value);
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
const fetcherDefaults: any = {};
const cacheForMutation: any = {};
/**
 * Force mutation in requests from anywhere. This doesn't revalidate requests
 */
export function mutateData(
  ...pairs: [any, any | ((cache: any) => any), boolean?][]
) {
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
export function useFetcherConfig(id?: string) {
  const ftxcf = useContext(FetcherContext);

  const defaultsKey = JSON.stringify({
    idString: JSON.stringify(id),
  });

  const { config } = useFetcher({ id });

  let allowedKeys = [
    "headers",
    "baseUrl",
    "body",
    "defaults",
    "resolver",
    "auto",
    "memory",
    "refresh",
    "attempts",
    "attemptInterval",
    "revalidateOnFocus",
    "query",
    "params",
    "onOnline",
    "onOffline",
    "online",
    "retryOnReconnect",
    "cache",
  ];

  // Remove the 'method' strings
  for (let k in ftxcf) {
    if (allowedKeys.indexOf(k) === -1) {
      delete (ftxcf as any)[k];
    }
  }
  return typeof id !== "undefined" ? config : ftxcf;
}

/**
 * Get the data state of a request using its id
 */
export function useFetcherData<T = any>(id: any) {
  const defaultsKey = JSON.stringify({
    idString: JSON.stringify(id),
  });
  const def = resolvedRequests[defaultsKey];

  const { data } = useFetcher<T>({
    default: def,
    id: id,
  });

  return data;
}

/**
 * Get the loading state of a request using its id
 */
export function useFetcherLoading(id: any): boolean {
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
export function useFetcherError(id: any) {
  const { error } = useFetcher({
    id: id,
  });

  return error;
}

/**
 * Get everything from a `useFetcher` call using its id
 */
export function useFetcherId<ResponseType = any, BodyType = any>(id: any) {
  const defaultsKey = JSON.stringify({
    idString: JSON.stringify(id),
  });
  const def = fetcherDefaults[defaultsKey];

  return useFetcher<ResponseType, BodyType>({
    id,
    default: def,
  });
}

export {
  useFetcher as useFetch,
  useFetcherLoading as useLoading,
  useFetcherConfig as useConfig,
  useFetcherData as useData,
  useFetcherError as useError,
  useFetcherId as useFetchId,
};

/**
 * Create a configuration object to use in a 'useFetcher' call
 */
export type FetcherInit<FDT = any, BT = any> = FetcherConfigOptions<FDT, BT> & {
  url?: string;
};

/**
 * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
 */
export function useImperative() {
  const ctx = useFetcherConfig();

  const { baseUrl } = ctx;

  const keys = [
    "GET",
    "DELETE",
    "HEAD",
    "OPTIONS",
    "POST",
    "PUT",
    "PATCH",
    "PURGE",
    "LINK",
    "UNLINK",
  ];

  return Object.fromEntries(
    new Map(
      keys.map((k) => [
        k.toLowerCase(),
        (url, { config = {}, ...other } = {}) =>
          (fetcher as any)[k.toLowerCase()](
            url.startsWith("https://") || url.startsWith("http://")
              ? url
              : baseUrl + url,
            {
              config: {
                headers: {
                  ...ctx.headers,
                  ...config.headers,
                },
                body: config.body,
                query: config.query,
                params: config.params,
                formatBody: config.formatBody,
              },
              ...other,
            }
          ),
      ])
    )
  ) as {
    get: RequestWithBody;
    delete: RequestWithBody;
    head: RequestWithBody;
    options: RequestWithBody;
    post: RequestWithBody;
    put: RequestWithBody;
    patch: RequestWithBody;
    purge: RequestWithBody;
    link: RequestWithBody;
    unlink: RequestWithBody;
  };
}

/**
 * Fetcher hook
 */
const useFetcher = <FetchDataType = any, BodyType = any>(
  init: FetcherType<FetchDataType, BodyType> | string,
  options?: FetcherConfigOptions<FetchDataType, BodyType>
) => {
  const ctx = useContext(FetcherContext);

  const { cache = defaultCache } = {};

  const optionsConfig =
    typeof init === "string"
      ? {
          // Pass init as the url if init is a string
          url: init,
          ...options,
        }
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
      headers: {} as Headers,
      body: undefined as unknown as Body,
      formatBody: false,
    },
    resolver = typeof ctx.resolver === "function"
      ? ctx.resolver
      : (d: any) => d.json(),
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

  const [reqQuery, setReqQuery] = useState({
    ...ctx.query,
    ...config.query,
  });

  const [configUrl, setConfigUrl] = useState({
    realUrl: "",
    rawUrl: "",
  });

  const [reqParams, setReqParams] = useState({
    ...ctx.params,
    ...config.params,
  });

  useEffect(() => {
    if (url !== "") {
      setReqParams(() => {
        const newParams = {
          ...ctx.params,
          ...config.params,
        };
        requestEmitter.emit(resolvedKey, {
          requestCallId,
          config: {
            params: newParams,
          },
        });
        return newParams;
      });
    }
  }, [JSON.stringify({ ...ctx.params, ...config.params })]);

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

  const resolvedKey = JSON.stringify({
    uri: typeof id === "undefined" ? rawUrl : undefined,
    idString: typeof id === "undefined" ? undefined : idString,
    config:
      typeof id === "undefined"
        ? {
            method: config?.method,
          }
        : undefined,
  });

  const stringDeps = JSON.stringify(
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
  );

  const [resKey, qp] = realUrl.split("?");

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
    let queryParamsFromString: any = {};
    try {
      // getting query params from passed url
      const queryParts = qp.split("&");
      queryParts.forEach((q, i) => {
        const [key, value] = q.split("=");
        if (queryParamsFromString[key] !== value) {
          queryParamsFromString[key] = `${value}`;
        }
      });
    } finally {
      if (url !== "") {
        setReqQuery(() => {
          const newQuery = {
            ...ctx.query,
            ...queryParamsFromString,
            ...config.query,
          };
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            config: {
              query: newQuery || {},
            },
          });
          return newQuery;
        });
      }
    }
  }, [
    JSON.stringify({
      qp,
      ...ctx.query,
      ...config.query,
    }),
  ]);

  const requestCache = cache.get(resolvedKey);

  const [data, setData] = useState<FetchDataType | undefined>(
    // Saved to base url of request without query params
    memory ? requestCache || valuesMemory[rawUrl] || def : def
  );

  // Used JSON as deppendency instead of directly using a reference to data
  const rawJSON = JSON.stringify(data);

  const [online, setOnline] = useState(true);

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

  const [reqMethod, setReqMethod] = useState(config.method);

  useEffect(() => {
    if (url !== "") {
      setReqMethod(config.method);
      requestEmitter.emit(resolvedKey, {
        requestCallId,
        method: config.method,
      });
    }
  }, [stringDeps, response, requestAbortController, requestCallId]);

  async function fetchData(
    c: { headers?: any; body?: BodyType; query?: any } = {}
  ) {
    if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
      const tm = setTimeout(() => {
        setReqMethod(config.method);
        if (url !== "") {
          setConfigUrl({
            rawUrl,
            realUrl,
          });
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            realUrl: resKey,
            rawUrl,
          });
        }
        clearTimeout(tm);
      }, 0);
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
            headers: {
              "Content-Type":
                // If body is form-data, set Content-Type header to 'multipart/form-data'
                typeof FormData !== "undefined" &&
                config.body instanceof FormData
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
          const errorString = err?.toString();
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
            let _error = new Error(err as any);
            setError(_error);
            requestEmitter.emit(resolvedKey, {
              requestCallId,
              error: _error,
            });
            onError(err as any);
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
    signal?.addEventListener("abort", abortCallback);
    return () => {
      signal?.removeEventListener("abort", abortCallback);
    };
  }, [requestAbortController, resolvedKey, onAbort, loading]);

  useEffect(() => {
    function waitFormUpdates(v: any) {
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
          config,
          rawUrl,
          realUrl,
          method,
          completedAttempts,
        } = v;
        const tm = setTimeout(() => {
          if (typeof method !== "undefined") {
            setReqMethod(method);
          }
          if (typeof config?.query !== "undefined") {
            setReqQuery(config.query);
          }
          if (typeof rawUrl !== "undefined" && typeof realUrl !== "undefined") {
            setConfigUrl({
              rawUrl,
              realUrl,
            });
          }
          if (typeof config?.params !== "undefined") {
            setReqParams(config?.params);
          }
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
          clearTimeout(tm);
        }, 0);
      }
    }

    requestEmitter.addListener(resolvedKey, waitFormUpdates);

    return () => {
      requestEmitter.removeListener(resolvedKey, waitFormUpdates);
    };
  }, [
    resolvedKey,
    reqMethod,
    id,
    requestCallId,
    requestAbortController,
    stringDeps,
  ]);

  const reValidate = React.useCallback(
    async function reValidate() {
      // Only revalidate if request was already completed
      if (!loading) {
        if (!runningRequests[resolvedKey]) {
          previousConfig[resolvedKey] = undefined;
          setLoading(true);
          const reqQ = {
            ...ctx.query,
            ...config.query,
          };
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
    async function forceRefresh(v: any) {
      if (typeof v?.data !== "undefined") {
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
            const reqQ = {
              ...ctx.query,
              ...config.query,
            };
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
  }, [onOnline, reValidate, resolvedKey, retryOnReconnect]);

  useEffect(() => {
    function wentOffline() {
      runningRequests[resolvedKey] = false;
      setOnline(false);
      requestEmitter.emit(resolvedKey, {
        requestCallId,
        online: false,
      });
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
  }, [onOffline, reValidate, resolvedKey, retryOnReconnect]);

  useEffect(() => {
    setRequestHeades((r) => ({
      ...r,
      ...ctx.headers,
    }));
  }, [ctx.headers]);

  useEffect(() => {
    previousConfig[resolvedKey] = undefined;
  }, [requestCallId]);

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
        } else if (completedAttempts === attempts) {
          requestEmitter.emit(resolvedKey, {
            requestCallId,
            online: false,
          });
          setOnline(false);
        }
        clearTimeout(tm);
      }
    }, (attemptInterval as number) * 1000);

    return () => {
      clearTimeout(tm);
    };
  }, [error, attempts, rawJSON, attemptInterval, completedAttempts]);

  useEffect(() => {
    if (completedAttempts === 0) {
      if (refresh > 0 && auto) {
        const interval = setTimeout(reValidate, refresh * 1000);
        return () => clearTimeout(interval);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, loading, error, rawJSON, completedAttempts, config]);

  const initMemo = React.useMemo(() => JSON.stringify(optionsConfig), []);

  useEffect(() => {
    if (auto) {
      if (url !== "") {
        if (runningRequests[resolvedKey]) {
          setLoading(true);
        }
        const reqQ = {
          ...ctx.query,
          ...config.query,
        };
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
    reValidate,
    // ctx.children,
    refresh,
    JSON.stringify(config),
  ]);

  const __config = {
    ...config,
    method: reqMethod,
    params: reqParams,
    headers: requestHeaders,
    body: config.body,
    baseUrl: ctx.baseUrl || config.baseUrl,
    url: configUrl?.realUrl,
    rawUrl: configUrl?.rawUrl,
    query: reqQuery,
  };

  function forceMutate(
    newValue: FetchDataType | ((prev: FetchDataType) => FetchDataType)
  ) {
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
        let newVal = (newValue as any)(prev);
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
  } as unknown as {
    data: FetchDataType;
    loading: boolean;
    error: Error | null;
    online: boolean;
    code: number;
    reFetch: () => Promise<void>;
    mutate: React.Dispatch<React.SetStateAction<FetchDataType>>;
    abort: () => void;
    config: FetcherType<FetchDataType, BodyType>["config"] & {
      baseUrl: string;
      url: string;
      rawUrl: string;
    };
    response: CustomResponse<FetchDataType>;
    id: any;
    key: string;
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
