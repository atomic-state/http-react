### HTTP React

<p align="center">
<a href="https://www.npmjs.com/package/http-react" target="_blank"><img src="https://badge.fury.io/js/http-react.svg"></a>
<img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
<img src="https://github.com/atomic-state/http-react/actions/workflows/test.yml/badge.svg?event=push" />
</p>

Http React is a React hooks library for data fetching. It's built on top of the native `Fetch` API.

### Overview

With one hook call, you get all the information about a request that you can use to build UIs that are consistent and performant:

```jsx
import useFetch from 'http-react'

// This is the default fetcher.
const fetcher = (url, config) => fetch(url, config)

export default function App() {
  const { data, loading, error, responseTime } = useFetch('/api/user-info', {
    refresh: '30 sec',
    fetcher
  })

  if (loading) return <p>Loading</p>

  if (error) return <p>An error ocurred</p>

  return (
    <div>
      <h2>Welcome, {data.name}</h2>
      <small>Profile loaded in {responseTime} miliseconds</small>
    </div>
  )
}
```

It also works with Next.js' server functions:

```tsx
// actions.ts
'use server'
import { actionData } from 'http-react'

export async function getData({ id }: { id: number }) {
  return actionData(
    { foo: 'bar' },
    // The second argument is only necessary if you
    // want to send something different from 200.
    {
      status: 200
    }
  )
}
```

```tsx
// page.tsx
'use client'
import { useServerAction } from 'http-react'

import { getData } from '@/actions'

export default function Page() {
  // data has static typing inferred from the action result
  const { data, isPending, error } = useServerAction(getData, {
    params: {
      id: 1 // This will show an error if id is not a number
    }
  })

  return isPending ? (
    <p>Loading...</p>
  ) : error ? (
    <p>Something went wrong</p>
  ) : (
    <div>
      <h2>Welcome</h2>
      <p>{data.foo}</p>
    </div>
  )
}
```

It supports many features that are necessary in modern applications, while giving developers full control over the request configuration:

- Server-Side Rendering
- Server actions
- React Native
- Request deduplication
- Suspense
- Refresh
- Retry on error
- Pagination
- Local mutation (Optimistic UI)
- qraphql

and [more](https://http-react.netlify.app/docs/api)!

#### Installation:

```bash
npm install --save http-react
```

Or

```bash
yarn add http-react
```

[Getting started](https://http-react.netlify.app/docs)
