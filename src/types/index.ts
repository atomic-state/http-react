export type HTTP_METHODS =
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'PURGE'
  | 'LINK'
  | 'UNLINK'

export type FetcherContextType = {
  headers?: any
  baseUrl?: string
  /**
   * Keys in `defaults` are just friendly names. Defaults are based on the `id` and `value` passed
   */
  defaults?: {
    [key: string]: {
      /**
       * The `id` passed to the request
       */
      id?: any
      /**
       * Default value for this request
       */
      value?: any
      config?: any
    }
  }
  suspense?: any[]
  resolver?: (r: Response) => any
  children?: any
  auto?: boolean
  memory?: boolean
  refresh?: number
  attempts?: number
  attemptInterval?: number
  revalidateOnFocus?: boolean
  query?: any
  params?: any
  onOnline?: (e: { cancel: () => void }) => void
  onOffline?: () => void
  online?: boolean
  retryOnReconnect?: boolean
  cache?: CacheStoreType
  revalidateOnMount?: boolean
}

export type CacheStoreType = {
  get(k?: any): any
  set(k?: any, v?: any): any
  delete?(k?: any): any
}

export type CustomResponse<T> = Omit<Response, 'json'> & {
  json(): Promise<T>
}

export type RequestWithBody = <R = any, BodyType = any>(
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
 * An imperative version of the `useFetcher`
 */
export type ImperativeFetcher = {
  get: RequestWithBody
  delete: RequestWithBody
  head: RequestWithBody
  options: RequestWithBody
  post: RequestWithBody
  put: RequestWithBody
  patch: RequestWithBody
  purge: RequestWithBody
  link: RequestWithBody
  unlink: RequestWithBody
}

export type FetcherConfigType<FetchDataType = any, BodyType = any> = {
  /**
   * Any serializable id. This is optional.
   */
  id?: any
  /**
   * url of the resource to fetch
   */
  url?: string
  /**
   * Default data value
   */
  default?: FetchDataType
  /**
   * Refresh interval (in seconds) to re-fetch the resource
   * @default 0
   */
  refresh?: number
  /**
   * This will prevent automatic requests.
   * By setting this to `false`, requests will
   * only be made by calling `reFetch()`
   * @default true
   */
  auto?: boolean
  /**
   * Responses are saved in memory and used as default data.
   * If `false`, the `default` prop will be used instead.
   * @default true
   */
  memory?: boolean
  /**
   * Function to run when request is resolved succesfuly
   */
  onResolve?: (data: FetchDataType, req?: Response) => void
  /**
   * Override the cache for this specific request
   */
  cache?: CacheStoreType
  /**
   * Function to run when data is mutated
   */
  onMutate?: (
    data: FetchDataType,
    /**
     * An imperative version of `useFetcher`
     */
    fetcher: ImperativeFetcher
  ) => void
  /**
   * Function to run when props change
   */
  onPropsChange?: (rev: {
    revalidate: () => void
    cancel: {
      (reason?: any): void
      (): void
    }
    fetcher: ImperativeFetcher
    props: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
    previousProps: FetcherConfigTypeNoUrl<FetchDataType, BodyType>
  }) => void
  /**
   * Function to run when the request fails
   */
  onError?: (error: Error, req?: Response) => void
  /**
   * Function to run when a request is aborted
   */
  onAbort?: () => void
  /**
   * Whether a change in deps will cancel a queued request and make a new one
   */
  cancelOnChange?: boolean
  /**
   * Parse as json by default
   */
  resolver?: (d: CustomResponse<FetchDataType>) => any
  /**
   * The ammount of attempts if request fails
   * @default 1
   */
  attempts?: number
  /**
   * The interval at which to run attempts on request fail
   * @default 0
   */
  attemptInterval?: number
  /**
   * If a request should be made when the tab is focused. This currently works on browsers
   * @default false
   */
  revalidateOnFocus?: boolean
  /**
   * If `false`, revalidation will only happen when props passed to the `useFetch` change.
   * For example, you may want to have a component that should
   * fetch with `useFetch` only once during the application lifetime
   * or when its props change but not when, for example, navigating
   * between pages (web) or screens (React Native). This is very useful
   * when you have components that should persist their state, like layouts.
   * This is also a way of revalidating when props change.
   *
   * Note that the behaviour when props change is the same.
   * @default true
   */
  revalidateOnMount?: boolean
  /**
   * This will run when connection is interrupted
   */
  onOffline?: () => void
  /**
   * This will run when connection is restored
   */
  onOnline?: (e: { cancel: () => void }) => void
  /**
   * If the request should retry when connection is restored
   * @default true
   */
  retryOnReconnect?: boolean
  /**
   * If using inside a `<Suspense>`
   */
  suspense?: boolean

  /**
   * Override base url
   */
  baseUrl?: string
  /**
   * Request method
   */
  method?: HTTP_METHODS
  headers?: Headers | object
  query?: any
  /**
   * URL params
   */
  params?: any
  body?: BodyType
  /**
   * Customize how body is formated for the request. By default it will be sent in JSON format
   * but you can set it to false if for example, you are sending a `FormData`
   * body, or to `b => serialize(b)` for example, if you want to send JSON data
   * (the last one is the default behaviour so in that case you can ignore it)
   */
  formatBody?: boolean | ((b: BodyType) => any)
}

// If first argument is a string
export type FetcherConfigTypeNoUrl<FetchDataType = any, BodyType = any> = Omit<
  FetcherConfigType<FetchDataType, BodyType>,
  'url'
>

/**
 * Create a configuration object to use in a 'useFetcher' call
 */
export type FetcherInit<FDT = any, BT = any> = FetcherConfigTypeNoUrl<
  FDT,
  BT
> & {
  url?: string
}
