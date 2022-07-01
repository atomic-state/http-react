export type CustomResponse<T> = Omit<Response, "json"> & {
  json(): Promise<T>;
};

export type RequestWithBody = <R = any, BodyType = any>(
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
export function createRequestFn(
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

    // console.log(reqQueryString)

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

export type FetcherExtendConfig = {
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
  /**
   * Request query params
   */
  query?: any;
};
