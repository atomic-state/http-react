import { isDefined } from '../client'
import { $context } from '../internal/shared'
import { FetchContextType } from '../types'
import { FetchConfigSync } from './server'

export async function FetchConfigAsync(props: FetchContextType) {
  const { children, defaults = {}, value = {} } = props

  let $values = new Map()

  const previousConfig = $context.value as any

  for (let valueKey in value) {
    const $value = await value[valueKey]

    const $data = $value.data ?? $value

    $values.set(valueKey, $data)

    // fetcherDefaults.set(resolvedKey, $data)

    // cacheProvider.set(resolvedKey, $data)
  }

  for (let defaultKey in defaults) {
    const { id = defaultKey } = defaults[defaultKey]

    if (isDefined(id)) {
      $values.set(defaultKey, await defaults[defaultKey]?.value)
      // fetcherDefaults.set(resolvedKey, await defaults[defaultKey]?.value)
      // cacheProvider.set(resolvedKey, await defaults[defaultKey]?.value)
    }
  }

  let mergedConfig = {
    ...previousConfig,
    ...props,
    headers: {
      ...previousConfig.headers,
      ...props.headers
    },
    value: Object.fromEntries($values.entries()),
    children: undefined
  }

  return <FetchConfigSync value={mergedConfig}>{children}</FetchConfigSync>
}
