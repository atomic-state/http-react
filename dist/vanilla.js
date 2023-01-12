/**
 * @license http-react
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Creates a new request function. This is for usage with fetcher and fetcher.extend
 */

;(() => {
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
          ? typeof formatBody === 'function'
            ? formatBody(
                typeof FormData !== 'undefined' && body instanceof FormData
                  ? body
                  : body
              )
            : formatBody === false ||
              (typeof FormData !== 'undefined' && body instanceof FormData)
            ? body
            : JSON.stringify(body)
          : undefined
      }
      let r = undefined

      const base =
        `${url}`.startsWith('https://') || `${url}`.startsWith('http://')
          ? ''
          : baseUrl
      try {
        const req = await fetch(
          `${base}${rawUrl}${
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
              Object.assign({ url: `${base}${rawUrl}` }, reqConfig),
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
              Object.assign({ url: `${base}${rawUrl}` }, reqConfig),
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
            Object.assign({ url: `${base}${rawUrl}` }, reqConfig),
            { query }
          )
        }
      }
    }
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
    headers = {},
    body = {},
    query = {},
    // json by default
    resolver = d => d.json()
  } = {}) {
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

  window.fetcher = fetcher
})()
