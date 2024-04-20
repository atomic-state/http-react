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
const DEFAULT_MIDDLEWARE = (incoming: any, previous: any) => incoming

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

const UNITS_MILISECONDS_EQUIVALENTS = {
  ms: 1,
  sec: 1000,
  min: 60000,
  h: 3600000,
  d: 86400000,
  we: 604800000,
  mo: 2629800000,
  y: 31536000000
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
  METHODS,
  UNITS_MILISECONDS_EQUIVALENTS,
  DEFAULT_MIDDLEWARE
}
