/**
 * @license http-react
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type { CacheStoreType, FetchInit } from './types'

export { useFetch as default } from './hooks'

export {
  useFetch,
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
  useResponseTime
} from './hooks'

export { FetchConfig, SSRSuspense } from './components'

export {
  gql,
  setURLParams,
  queryProvider,
  mutateData,
  revalidate,
  hasBaseUrl
} from './utils'
