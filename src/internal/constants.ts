const DEFAULTS = {}
const QUERY = {}
const PARAMS = {}
const ON_OFFLINE = () => {}
const ON_ONLINE = () => {}
const ONLINE = true
const ATTEMPTS = 0
const ATTEMPT_INTERVAL = 2
const REVALIDATE_ON_FOCUS = false
const RETRY_ON_RECONNECT = true
const REVALIDATE_ON_MOUNT = true
const DEFAULT_GRAPHQL_PATH = '/graphql'
const DEFAULT_RESOLVER = (e: any) => e.json()

const ALLOWED_CONTEXT_KEYS = [
  'headers',
  'baseUrl',
  'body',
  'defaults',
  'resolver',
  'auto',
  'memory',
  'refresh',
  'attempts',
  'attemptInterval',
  'revalidateOnFocus',
  'query',
  'params',
  'onOnline',
  'onOffline',
  'online',
  'retryOnReconnect',
  'cache'
]

const METHODS = {
  GET: 'GET',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  PURGE: 'PURGE',
  LINK: 'LINK',
  UNLINK: 'UNLINK'
}

export {
  DEFAULTS,
  QUERY,
  PARAMS,
  ON_OFFLINE,
  ON_ONLINE,
  ONLINE,
  ATTEMPTS,
  ATTEMPT_INTERVAL,
  REVALIDATE_ON_FOCUS,
  RETRY_ON_RECONNECT,
  REVALIDATE_ON_MOUNT,
  DEFAULT_GRAPHQL_PATH,
  DEFAULT_RESOLVER,
  ALLOWED_CONTEXT_KEYS,
  METHODS
}
