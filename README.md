### HTTP React

<p align="center">
<a href="https://www.npmjs.com/package/http-react" target="_blank"><img src="https://badge.fury.io/js/http-react.svg"></a>
<img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
<img src="https://github.com/atomic-state/http-react/actions/workflows/test.yml/badge.svg?event=push" />
</p>



Http React is a React hooks library for data fetching. It's built on top of the native `Fetch` API.


### Overview

With one hook call, you get all the information about a request, and you can start building UIs that are more consistent and performant:

```jsx
import useFetch from 'http-react'

export default function App() {
  const { data, loading, error, responseTime } = useFetch('/api/user-info', { refresh: 2 })

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

It supports many features that are needed in data fetching in modern applications, while giving developers full control over the request configuration:

- Server-Side Rendering
- React Native
- Request deduplication
- Suspense
- Refresh
- Retry on error
- Pagination
- Local mutation
- qraphql

and [more](https://http-react.netlify.app/docs/tutorial-basics/request-config)!

#### Installation:

```bash
npm install --save http-react
```

Or

```bash
yarn add http-react
```

[Getting started](https://http-react.netlify.app/docs/intro)

