/** Generic graphql response type */
type OnGQLResolve<T> = { (x: any): T }
/** Generic graphql Fetch options */
type FetchGQLOpts<T> = {
  url: string
  query: string
  onResolve: OnGQLResolve<T>
  controller: AbortController
}

/** Props for making a cancellable http request */
type CancelableProps<T> = {
  request: Promise<any> | (() => Promise<any>)
  fallbackResponse?: T | null
  timeout?: number
  controller: AbortController
}

/** Abstraction for making server graphql queries */
export async function fetchGQL<T>(opts: FetchGQLOpts<T>) {
  const { url, query, onResolve, controller } = opts
  const req = () =>
    fetch(url, {
      method: 'post',
      body: JSON.stringify({ query }),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((res) => onResolve(res.data))
      .catch(() => onResolve({} as T))

  return withTimeout({
    request: req,
    fallbackResponse: {} as T,
    controller,
  })
}

export default fetchGQL

/** Halt a request if it takes longer than `timeout` to resolve */
export async function withTimeout<T>(
  opts: CancelableProps<T>,
): Promise<T | null> {
  const { request, fallbackResponse = null, controller, timeout = 3500 } = opts
  return new Promise((resolve) => {
    const call = typeof request === 'function'
    const cancel = () => {
      controller.abort()
      resolve(fallbackResponse)
    }
    setTimeout(cancel, timeout)
    return call ? request().then(resolve) : request
  })
}
