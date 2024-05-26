'use client'

import { FetchConfigAsync } from '../FetchConfigAsync'

import { FetchConfig as FConfig, SSRSuspense } from '../index'

const FetchConfig = typeof window === 'undefined' ? FetchConfigAsync : FConfig

export { FetchConfig, SSRSuspense }
