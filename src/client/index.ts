/**
 * These export should work in any app as they don't rely on React.
 */

export {
  Client,
  isDefined,
  hasBaseUrl,
  setURLParams,
  setParamsAndQuery,
  setQueryParams,
  isFunction,
  serialize,
  queue,
  getRequestHeaders,
  isFormData,
  jsonCompare,
  windowExists
} from '../utils/shared'
