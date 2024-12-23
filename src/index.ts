/**
 * @license http-react
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type { CacheStoreType, FetchInit } from './types'

import { useFetch } from './hooks'

export default useFetch

export {
  useData,
  useBlob,
  useCode,
  useConfig,
  useDELETE,
  useError,
  useFetchId,
  useGET,
  useHEAD,
  useLINK,
  useLoading,
  useMutate,
  useManualFetch,
  useOPTIONS,
  usePATCH,
  usePOST,
  usePURGE,
  usePUT,
  useText,
  useUNLINK,
  useGql,
  useImperative,
  useResolve,
  useResponseTime,
  useRequestEnd,
  useRequestStart,
  useFetchSuspense,
  useExpiration,
  useHasData,
  useLoadingFirst,
  useOnline,
  useReFetch,
  useRevalidating,
  useSuccess,
  useDebounceFetch,
  useIsomorphicLayoutEffect,
  useMutation,
  useServerAction,
  useServerMutation,
  useAction
} from './hooks'

export { FetchConfig, SSRSuspense } from './components/server'
export { SSRSuspense as Suspense } from './components/server'

export {
  queryProvider,
  mutateData,
  revalidate,
  cancelRequest,
  getMiliseconds
} from './utils'

export { defaultCache } from './internal'

export {
  Client,
  setURLParams,
  hasBaseUrl,
  isDefined,
  isFormData,
  isFunction,
  serialize,
  notNull,
  setQueryParams,
  setParamsAndQuery,
  actionResult,
  actionData,
  $form,
  $formData,
  $searchParams,
  jsonCompare,
  windowExists,
  queue,
  gql,
  getRequestHeaders as $headers
} from './utils/shared'
