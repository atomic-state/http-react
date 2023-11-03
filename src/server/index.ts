export function createActionHandler<ActionTypes>(actions: {
  [e in keyof ActionTypes]: (
    req: Request,
    args: ActionTypes[e],
    searchParams: URLSearchParams
  ) => any
}) {
  return async (
    req: Request,
    params: {
      params: {
        action: keyof ActionTypes
      }
    }
  ) =>
    actions[params.params.action](
      req,
      await req.json(),
      new URL(req.url).searchParams
    )
}
