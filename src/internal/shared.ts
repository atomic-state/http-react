/**
 * This default context is changed by the FetchConfigAsync
 * in the server (when window does not exist) and used by the client
 * version of FetchConfig.
 */
export let $context = {
  value: {} as any
}
