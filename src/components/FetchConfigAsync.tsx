import { isDefined, serialize } from '../client'
import {
  defaultCache,
  fetcherDefaults,
  valuesMemory,
  willSuspend
} from '../internal'
import { $context } from '../internal/shared'
import { FetchContextType } from '../types'

export async function FetchConfigAsync(props: FetchContextType) {
  const { children, defaults = {}, value = {}, suspense = [] } = props

  const previousConfig = $context.value as any
  const { cacheProvider = defaultCache } = previousConfig

  for (let valueKey in value) {
    const resolvedKey = serialize({
      idString: serialize(valueKey)
    })

    if (!isDefined(valuesMemory.get(resolvedKey))) {
      valuesMemory.set(
        resolvedKey,
        (await value[valueKey])?.data ?? (await value[valueKey])
      )
    }
    if (!isDefined(fetcherDefaults.get(resolvedKey))) {
      fetcherDefaults.set(
        resolvedKey,
        (await value[valueKey])?.data ?? (await value[valueKey])
      )
    }

    if (!isDefined(cacheProvider.get(resolvedKey))) {
      cacheProvider.set(
        resolvedKey,
        (await value[valueKey])?.data ?? (await value[valueKey])
      )
    }
  }

  for (let defaultKey in defaults) {
    const { id = defaultKey } = defaults[defaultKey]
    const resolvedKey = serialize({
      idString: serialize(id)
    })

    if (isDefined(id)) {
      if (!isDefined(valuesMemory.get(resolvedKey))) {
        valuesMemory.set(resolvedKey, await defaults[defaultKey]?.value)
      }
      if (!isDefined(fetcherDefaults.get(resolvedKey))) {
        fetcherDefaults.set(resolvedKey, await defaults[defaultKey]?.value)
      }
    }

    if (!isDefined(cacheProvider.get(resolvedKey))) {
      cacheProvider.set(resolvedKey, await defaults[defaultKey]?.value)
    }
  }

  for (let suspenseKey of suspense) {
    const key = serialize({
      idString: serialize(suspenseKey)
    })
    willSuspend.set(key, true)
  }

  let mergedConfig = {
    ...previousConfig,
    ...props,
    headers: {
      ...previousConfig.headers,
      ...props.headers
    },
    children: undefined
  }

  $context.value = mergedConfig

  return children
}
