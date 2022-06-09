/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
 * Fetcher object
 */

export const fetcher = () => {};

// Create a method for each request
fetcher.get = createRequestFn("GET", "", {});
fetcher.delete = createRequestFn("DELETE", "", {});
fetcher.head = createRequestFn("HEAD", "", {});
fetcher.options = createRequestFn("OPTIONS", "", {});
fetcher.post = createRequestFn("POST", "", {});
fetcher.put = createRequestFn("PUT", "", {});
fetcher.patch = createRequestFn("PATCH", "", {});
fetcher.purge = createRequestFn("PURGE", "", {});
fetcher.link = createRequestFn("LINK", "", {});
fetcher.unlink = createRequestFn("UNLINK", "", {});

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
fetcher.extend = function extendFetcher({
  baseUrl = "",
  headers = {} as Headers,
  body = {},
  // json by default
  resolver = (d) => d.json(),
}: FetcherExtendConfig = {}) {
  function customFetcher() {}
  customFetcher.config = {
    baseUrl,
    headers,
    body,
  };

  // Creating methods for fetcher.extend
  customFetcher.get = createRequestFn("GET", baseUrl, headers);
  customFetcher.delete = createRequestFn("DELETE", baseUrl, headers);
  customFetcher.head = createRequestFn("HEAD", baseUrl, headers);
  customFetcher.options = createRequestFn("OPTIONS", baseUrl, headers);
  customFetcher.post = createRequestFn("POST", baseUrl, headers);
  customFetcher.put = createRequestFn("PUT", baseUrl, headers);
  customFetcher.patch = createRequestFn("PATCH", baseUrl, headers);
  customFetcher.purge = createRequestFn("PURGE", baseUrl, headers);
  customFetcher.link = createRequestFn("LINK", baseUrl, headers);
  customFetcher.unlink = createRequestFn("UNLINK", baseUrl, headers);

  return customFetcher;
};

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
 * Basic HttpClient
 */
export function createHttpClient(url: string) {
  return new HttpClient(url);
}
