/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type CustomResponse<T> = Omit<Response, 'json'> & {
  json(): Promise<T>
}

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
    default?: R
    /**
     * Other configuration
     */
    config?: {
      /**
       * Request query
       */
      query?: any
      /**
       * The function that formats the body
       */
      formatBody?(b: BodyType): any
      /**
       * Request headers
       */
      headers?: any
      /**
       * Request params (like Express)
       */
      params?: any
      /**
       * The request body
       */
      body?: BodyType
    }
    /**
     * The function that returns the resolved data
     */
    resolver?: (r: CustomResponse<R>) => any
    /**
     * A function that will run when the request fails
     */
    onError?(error: Error): void
    /**
     * A function that will run when the request completes succesfuly
     */
    onResolve?(data: R, res: CustomResponse<R>): void
  }
) => Promise<{
  error: any
  data: R
  config: any
  code: number
  res: CustomResponse<R>
}>

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
      onError = () => {}
    } = init

    const { params = {} } = c || {}

    let query = {
      ...q,
      ...c.query
    }

    const rawUrl = url
      .split('/')
      .map((segment) => {
        if (segment.startsWith('[') && segment.endsWith(']')) {
          const paramName = segment.replace(/\[|\]/g, '')
          if (!(paramName in params)) {
            console.warn(
              `Param '${paramName}' does not exist in request configuration for '${url}'`
            )
            return paramName
          }
          return params[segment.replace(/\[|\]/g, '')]
        } else if (segment.startsWith(':')) {
          const paramName = segment.split('').slice(1).join('')
          if (!(paramName in params)) {
            console.warn(
              `Param '${paramName}' does not exist in request configuration for '${url}'`
            )
            return paramName
          }
          return params[paramName]
        } else {
          return segment
        }
      })
      .join('/')

    const [, qp = ''] = rawUrl.split('?')

    qp.split('&').forEach((q) => {
      const [key, value] = q.split('=')
      if (query[key] !== value) {
        query = {
          ...query,
          [key]: value
        }
      }
    })

    const reqQueryString = Object.keys(query)
      .map((q) => [q, query[q]].join('='))
      .join('&')

    const { headers = {}, body, formatBody } = c

    const reqConfig = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...$headers,
        ...headers
      },
      body: method?.match(/(POST|PUT|DELETE|PATCH)/)
        ? typeof formatBody === 'function'
          ? formatBody(
              (typeof FormData !== 'undefined' && body instanceof FormData
                ? body
                : body) as any
            )
          : formatBody === false ||
            (typeof FormData !== 'undefined' && body instanceof FormData)
          ? body
          : JSON.stringify(body)
        : undefined
    }

    let r = undefined as any
    try {
      const req = await fetch(
        `${baseUrl || ''}${rawUrl}${
          url.includes('?') ? `&${reqQueryString}` : `?${reqQueryString}`
        }`,
        reqConfig
      )
      r = req
      const data = await resolver(req)
      if (req?.status >= 400) {
        onError(true as any)
        return {
          res: req,
          data: def,
          error: true,
          code: req?.status,
          config: { url: `${baseUrl || ''}${rawUrl}`, ...reqConfig, query }
        }
      } else {
        onResolve(data, req)
        return {
          res: req,
          data: data,
          error: false,
          code: req?.status,
          config: { url: `${baseUrl || ''}${rawUrl}`, ...reqConfig, query }
        }
      }
    } catch (err) {
      onError(err as any)
      return {
        res: r,
        data: def,
        error: true,
        code: r?.status,
        config: { url: `${baseUrl || ''}${rawUrl}`, ...reqConfig, query }
      }
    }
  } as RequestWithBody
}

export type FetcherExtendConfig = {
  /**
   * Request base url
   */
  baseUrl?: string
  /**
   * Headers to include in each request
   */
  headers?: Headers | object
  /**
   * Body to include in each request (if aplicable)
   */
  body?: any
  /**
   * Customize how body is formated for the next requests. By default it will be sent in JSON format but you can set it to false if for example, you are sending a `FormData`
   * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
   * (the last one is the default behaviour so in that case you can ignore it)
   */
  formatBody?: (b: any) => any
  /**
   * Custom resolver
   */
  resolver?: (d: Response) => any
  /**
   * Request query params
   */
  query?: any
}

/**
 * Fetcher object
 */

const fetcher = () => {}

// Create a method for each request
fetcher.get = createRequestFn('GET', '', {})
fetcher.delete = createRequestFn('DELETE', '', {})
fetcher.head = createRequestFn('HEAD', '', {})
fetcher.options = createRequestFn('OPTIONS', '', {})
fetcher.post = createRequestFn('POST', '', {})
fetcher.put = createRequestFn('PUT', '', {})
fetcher.patch = createRequestFn('PATCH', '', {})
fetcher.purge = createRequestFn('PURGE', '', {})
fetcher.link = createRequestFn('LINK', '', {})
fetcher.unlink = createRequestFn('UNLINK', '', {})

/**
 * Extend the fetcher object
 */
fetcher.extend = function extendFetcher({
  baseUrl = '',
  headers = {} as Headers,
  body = {},
  query = {},
  // json by default
  resolver = (d) => d.json()
}: FetcherExtendConfig = {}) {
  function customFetcher() {}
  customFetcher.config = {
    baseUrl,
    headers,
    body,
    query
  }

  // Creating methods for fetcher.extend
  customFetcher.get = createRequestFn('GET', baseUrl, headers, query)
  customFetcher.delete = createRequestFn('DELETE', baseUrl, headers, query)
  customFetcher.head = createRequestFn('HEAD', baseUrl, headers, query)
  customFetcher.options = createRequestFn('OPTIONS', baseUrl, headers, query)
  customFetcher.post = createRequestFn('POST', baseUrl, headers, query)
  customFetcher.put = createRequestFn('PUT', baseUrl, headers, query)
  customFetcher.patch = createRequestFn('PATCH', baseUrl, headers, query)
  customFetcher.purge = createRequestFn('PURGE', baseUrl, headers, query)
  customFetcher.link = createRequestFn('LINK', baseUrl, headers, query)
  customFetcher.unlink = createRequestFn('UNLINK', baseUrl, headers, query)

  return customFetcher
}

export { fetcher }
