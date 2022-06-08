/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import { useState, useEffect } from "react";

type FetcherType<FetchDataType, BodyType> = {
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
  resolver?: (d: Response) => any;
  /**
   * Request configuration
   */
  config?: {
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
  resolver?: (d: Response) => any;
  /**
   * Request configuration
   */
  config?: {
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

/**
 * @deprecated Use the `useFetcher` hook instead
 */
const Fetcher = <FetchDataType extends unknown>({
  url = "/",
  default: def,
  config = { method: "GET", headers: {} as Headers, body: {} as Body },
  children: Children,
  onError = () => {},
  onResolve = () => {},
  refresh = 0,
}: FetcherType<FetchDataType, any>) => {
  const [data, setData] = useState<FetchDataType | undefined>(def);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const json = await fetch(url, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        } as Headers,
        body: config.method?.match(/(POST|PUT|DELETE|PATCH)/)
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
    return <Children data={data} error={error} loading={loading} />;
  } else {
    return null;
  }
};

export default Fetcher;

const resolvedRequests: any = {};

type fetcherConfigComponentType = {
  children: any;
  defaults: any;
};

export function FetcherConfig({
  children,
  defaults = {},
}: fetcherConfigComponentType) {
  if (defaults) {
    for (let defaultKey in defaults) {
      resolvedRequests[defaultKey] = defaults[defaultKey];
    }
  }
  return children;
}

type RequestWithBody = <R = any, BodyType = any>(
  url: string,
  reqConfig?: {
    default?: R;
    config?: {
      formatBody?(b: BodyType): any;
      headers?: any;
      body?: BodyType;
    };
    resolver?: (r: Response) => any;
    onError?(error: Error): void;
    onResolve?(data: R, res: Response): void;
  }
) => Promise<{
  error: any;
  data: R;
  config: any;
  code: number;
  res: Response;
}>;

/**
 * Creates a new request function. This is for usage with fetcher and fetcher.extend
 */
function createRequestFn(
  method: string,
  baseUrl: string,
  $headers: any
): RequestWithBody {
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

    let r: Response = undefined as unknown as Response;
    try {
      const req = await fetch(`${baseUrl || ""}${url}`, reqConfig);
      r = req;
      const data = await resolver(req);
      if (req?.status >= 400) {
        onError(true as any);
        return {
          res: req,
          data: def,
          error: true,
          code: req?.status,
          config: { url: `${baseUrl || ""}${url}`, ...reqConfig },
        };
      } else {
        onResolve(data, req);
        return {
          res: req,
          data: data,
          error: false,
          code: req?.status,
          config: { url: `${baseUrl || ""}${url}`, ...reqConfig },
        };
      }
    } catch (err) {
      onError(err);
      return {
        res: r,
        data: def,
        error: true,
        code: r?.status,
        config: { url: `${baseUrl || ""}${url}`, ...reqConfig },
      };
    }
  } as RequestWithBody;
}

/**
 * Fetcher available as a hook
 */

export const useFetcher = <FetchDataType extends unknown, BodyType = any>(
  init: FetcherType<FetchDataType, BodyType> | string,
  options?: FetcherConfigOptions<FetchDataType, BodyType>
) => {
  const {
    url = "/",
    default: def,
    config = {
      method: "GET",
      headers: {} as Headers,
      body: {} as Body,
      formatBody: false,
    },
    resolver = (d: any) => d.json(),
    onError = () => {},
    auto = true,
    memory = true,
    onResolve = () => {},
    onAbort = () => {},
    refresh = 0,
    cancelOnChange = false,
  } = typeof init === "string"
    ? {
        // Pass init as the url if init is a string
        url: init,
        ...options,
      }
    : // `url` will be required in init if it is an object
      init;

  const resolvedKey = url.split("?")[0];

  const [data, setData] = useState<FetchDataType | undefined>(
    // Saved to base url of request without query params
    memory ? resolvedRequests[resolvedKey] || def : def
  );

  const [requestBody, setRequestBody] = useState<BodyType>(
    config.body as BodyType
  );
  const [requestHeaders, setRequestHeades] = useState<
    object | Headers | undefined
  >(config.headers);

  const [response, setResponse] = useState<Response>();

  const [statusCode, setStatusCode] = useState<number>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestAbortController, setRequestAbortController] =
    useState<AbortController>(new AbortController());

  async function fetchData(c: { headers?: any; body?: BodyType } = {}) {
    if (cancelOnChange) {
      requestAbortController?.abort();
    }
    let newAbortController = new AbortController();
    setRequestAbortController(newAbortController);
    setError(null);
    try {
      const json = await fetch(url, {
        signal: newAbortController.signal,
        method: config.method,
        headers: {
          "Content-Type":
            // If body is form-data, set Content-Type header to 'multipart/form-data'
            typeof FormData !== "undefined" && config.body instanceof FormData
              ? "multipart/form-data"
              : "application/json",
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
      } else {
        if (def) {
          setData(def);
        }
        setError(true);
        onError(_data, json);
      }
    } catch (err) {
      const errorString = err?.toString();
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

  // const cancelCurrentRequest = React.useMemo(
  //   () =>
  //     function cancelCurrentRequest() {
  //       if (loading) {
  //         requestAbortController.abort();
  //         setError(false);
  //         setLoading(false);
  //         setData(resolvedRequests[resolvedKey]);
  //       }
  //     },
  //   [requestAbortController, loading, resolvedKey]
  // );

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

  async function reValidate(c: { headers?: any; body?: BodyType } = {}) {
    // Only revalidate if request was already completed
    if (c.body) {
      setRequestBody((p) => ({ ...p, ...c.body }));
    }
    if (c.headers) {
      setRequestHeades((p) => ({ ...p, ...c.headers }));
    }

    if (!loading) {
      setLoading(true);
      fetchData(c);
    }
  }
  useEffect(() => {
    if (refresh > 0 && auto) {
      const interval = setTimeout(reValidate, refresh * 1000);
      return () => clearTimeout(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, loading, error, data, config]);

  useEffect(() => {
    if (auto) {
      setLoading(true);
      fetchData();
    } else {
      setData(def);
      setError(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refresh, JSON.stringify(config)]);

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
    config: {
      ...config,
      headers: requestHeaders,
      body: requestBody,
      url,
    },
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
    response: Response;
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

type FetcherExtendConfig = {
  /**
   * Request base url
   */
  baseUrl?: string;
  /**
   * Headers to include in each request
   */
  headers?: Headers | object;
  /**
   * Body to include in each request (if aplicable)
   */
  body?: any;
  /**
   * Customize how body is formated for the next requests. By default it will be sent in JSON format but you can set it to false if for example, you are sending a `FormData`
   * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
   * (the last one is the default behaviour so in that case you can ignore it)
   */
  formatBody?: (b: any) => any;
  /**
   * Custom resolver
   */
  resolver?: (d: Response) => any;
};

/**
 * Extend the useFetcher hook
 */
useFetcher.extend = function extendFetcher({
  baseUrl = "",
  headers = {} as Headers,
  body = {},
  // json by default
  resolver = (d) => d.json(),
}: FetcherExtendConfig = {}) {
  function useCustomFetcher<T, BodyType = any>(
    init: FetcherType<T, BodyType> | string,
    options?: FetcherConfigOptions<T, BodyType>
  ) {
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
      url: `${baseUrl}${url}`,
      // If resolver is present is hook call, use that instead
      resolver: otherProps.resolver || resolver,
      config: {
        method: config.method,
        headers: {
          ...headers,
          ...config.headers,
        },
        body: {
          ...body,
          ...config.body,
        },
      },
    });
  }
  useCustomFetcher.config = {
    baseUrl,
    headers,
    body,
  };

  // Creating methods for fetcher.extend
  useCustomFetcher.get = createRequestFn("GET", baseUrl, {});
  useCustomFetcher.delete = createRequestFn("DELETE", baseUrl, {});
  useCustomFetcher.head = createRequestFn("HEAD", baseUrl, {});
  useCustomFetcher.options = createRequestFn("OPTIONS", baseUrl, {});
  useCustomFetcher.post = createRequestFn("POST", baseUrl, {});
  useCustomFetcher.put = createRequestFn("PUT", baseUrl, {});
  useCustomFetcher.patch = createRequestFn("PATCH", baseUrl, {});
  useCustomFetcher.purge = createRequestFn("PURGE", baseUrl, {});
  useCustomFetcher.link = createRequestFn("LINK", baseUrl, {});
  useCustomFetcher.unlink = createRequestFn("UNLINK", baseUrl, {});

  useCustomFetcher.Config = function FetcherConfig({
    children,
    defaults = {},
  }: fetcherConfigComponentType) {
    if (defaults) {
      for (let defaultKey in defaults) {
        const url = `${baseUrl}${defaultKey}`;
        resolvedRequests[url] = defaults[defaultKey];
      }
    }
    return children;
  };

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
 * Creates a new HTTP client
 */
export function createHttpClient(url: string) {
  return new HttpClient(url);
}
