### HTTP React Fetcher

Hook for data fetching in React

<p align="center">
<a href="https://www.npmjs.com/package/http-react-fetcher" target="_blank"><img src="https://badge.fury.io/js/http-react-fetcher.svg"></a>
<img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
<img src="https://github.com//atomic-state/http-react-fetcher/actions/workflows/test.yml/badge.svg?event=push" />
</p>

Installation:

```bash
npm install --save http-react-fetcher
```

Or

```bash
yarn add http-react-fetcher
```

### Browser

With React

```html
<script src="https://unpkg.com/http-react-fetcher@1.6.0/dist/http-react-fetcher.min.js"></script>
```
Without React

```html
<script src="https://unpkg.com/http-react-fetcher@1.6.0/dist/vanilla.min.js"></script>
```

#### Basic usage

```tsx
import { useFetcher } from "http-react-fetcher";

function App() {
  const { data, loading, error } = useFetcher({
    url: "api-url",
  });

  return (
    <div>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error=(</p>
      ) : (
        JSON.stringify(data)
      )}
    </div>
  );
}
```

**(New):** You can pass a string to `useFetcher` or a configuration object. If you pass a string as the first argument, that will be used as the url to fetch and the config will be taken from the second argument (optional)

```tsx
import { useFetcher } from "http-react-fetcher";

function App() {
  const { data, loading, error } = useFetcher("api-url", { /* optional config */ });

  return (
    <div>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error=(</p>
      ) : (
        JSON.stringify(data)
      )}
    </div>
  );
}
```



#### Default data value

You can set a default value to return as data while the request is completing. If the request fails, however, the `data` prop will be `undefined`

```jsx
  ...

  const { data, loading, error } = useFetcher({
    url: "api-url/posts",
    default: []
  })

  ...
```

#### Automatically re-fetch

A new request will always be made if any of the props passed to `useFetcher` changes.

If props won't change but you need refreshing, you can pass a `refresh` prop in the `useFetcher` hook. This is the ammount of seconds to wait until making a new request.

```jsx
  ...

  const { data, loading, error } = useFetcher({
    url: "api-url",
    refresh: 10 // 10 seconds
  })

  ...
```

When `refresh` is present, `useFetcher` will do the following:

Example with a refresh of 5 seconds:

- Make an initial request
- After that request is complete, count 5 seconds
- Make another request
- Repeat

#### Manually re-fetching

`useFetcher` also exposes another property, that is `reFetch`, which will make a request when called.

> Note: this will not work if a previous request hasn't been completed yet.

```tsx
import { useFetcher } from "http-react-fetcher";

function App() {
  const { data, loading, error, reFetch } = useFetcher({
    url: "api-url",
  });

  return (
    <div>
      <button onClick={reFetch}>Refresh</button>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error=(</p>
      ) : (
        JSON.stringify(data)
      )}
    </div>
  );
}
```

You can also prevent automatic refresh by setting `auto` to `false` when you call the `useFetcher` hook.
This means a request will only be made when you call `reFetch()`.
There will not be an initial request, but the `default` prop will still be assigned to the data if there is no error and `loading` is `false`.

```tsx
import { useFetcher } from "http-react-fetcher";

function App() {
  const { data, loading, error, reFetch } = useFetcher({
    url: "api-url",
    default: {},
    auto: false,
  });

  return (
    <div>
      <button onClick={reFetch}>Click to load information</button>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error=(</p>
      ) : (
        JSON.stringify(data)
      )}
    </div>
  );
}
```

You can pass extra configuration when calling `reFetch`, this includes `headers` and `body`.

```tsx
import { useFetcher } from "http-react-fetcher";

function App() {
  const { data, loading, error, reFetch } = useFetcher({
    url: "api-url",
    default: {},
    config: {
      method: "POST",
      body: {
        title: "Some title"
      }
    }
    auto: false,
  });

  return (
    <div>
      <button onClick={() =>
        reFetch({
          body: {
            // You will get an editor warning, since the type of body is inferred
            title: 10
          }
        })
      }>
        Click to load information
      </button>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error=(</p>
      ) : (
        JSON.stringify(data)
      )}
    </div>
  );
}
```


#### Body type

You can define the type that your body will have

```tsx
import { useFetcher } from "http-react-fetcher";

function App() {
  const { data, loading, error, reFetch } = useFetcher<any, { title: string }>({
    url: "api-url",
    default: {},
    config: {
      method: "POST",
      body: {
        title: "Some title"
      }
    }
    auto: false,
  });

  return (
    <div>
      <button onClick={() =>
        reFetch({
          body: {
            // You will get an editor warning
            title: 10
          }
        })
      }>
        Click to load information
      </button>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error=(</p>
      ) : (
        JSON.stringify(data)
      )}
    </div>
  );
}
```

#### Loading from memory

By default, responses are saved in memory using the `url` as key.

The initial data value will be loaded from memory. This means that a full page reload will delete all saved requests. In browsers, this only works if navigating between pages doesn't trigger a full page refresh.

You can remove this feature by passing `memory: false` in `useFetcher`

```tsx
function App() {
  const { data, loading, error } = useFetcher({
    url: "api-url",
    /* `data` initial value will not be taken from memory but `default` */
    memory: false,
    default: {},
  });

  return (
    <div>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error=(</p>
      ) : (
        JSON.stringify(data)
      )}
    </div>
  );
}
```

#### Request configuration

You can pass a `config` prop that has the following type

```ts
type config = {
  method?: "GET" | "POST" | "PUT" ...etc
  headers?: {
    // Request headers
  }
  body?: {
    // A serializable object
  }
}

```


Example

```tsx
...

const { data, loading, error } = useFetcher({
  url: "api-url/posts/search",
  config: {
    method: "POST",
    headers: {
      Authorization: "Token " + user_token
    },
: {
      title: '%how to%'
    }
  }
})

...

```

You can also access some useful properties like the config used in the request and the request status code

```tsx
const { config, code, data, loading, error } = useFetcher({
  ...
```

#### Formatting request body

You can format your body by passing `formatBody` in the config property. By default it is formated into JSON format. If you pass a `FormData` instance, the request `Content-Type` header will be set to `multipart/form-data` (if you specify the `Content-Type` header it will be overwritten). When you pass a `FormData` instance as the body, it will not be formated as JSON.

**Using `formatBody`**

```tsx

const { data } = useFetcher("/my-url", {
  config: {
    body: {
      title: "new title"
    },
    formatBody(myBody){
      // Send an uppercased version of the body JSON
      return JSON.stringify(newBody).toUpperCase()
    }
  }
})

```

**Sending `FormData`**

```tsx
const [myForm, setMyForm] = useState(new FormData())

const { data } = useFetcher("/my-url", {
  config: {
    body: myForm
  }
})

```

#### Handling error / success

You can pass other props:

`onResolve(data) { }`: Will run when a request completes succesfuly

`onError(error) { }`: Will run when a request fails

Example:

```tsx
...

const { data, loading, error } = useFetcher({
  url: "api-url/posts/search",
  config: {
    method: "POST",
    headers: {
      Authorization: "Token " + user_token
    },
    body: {
      title: '%how to%'
    }
  },
  onError(err){
    alert("No matches")
    console.error(err.toString())
  },
  onResolve(posts){
    // Do something with the data
  }
})

...

```

#### TypeScript support

It has full TypeScript support. You can pass a type indicating the data type of the response:

Full example:

```tsx
// TypeScript file
...


interface PostsResponse {
  posts?: {
    title?: string
    content?: string
  } []
}

const { data, loading, error } = useFetcher<PostsResponse>({
  url: "api-url/posts/search",
  // If `default` doesn't match type, this will
  // show an error.
  // But if the type argument is not present, the
  // response type will be inferred from `default`
  default: {
    posts: []
  },
  refresh: 10,
  config: {
    method: "POST",
    headers: {
      Authorization: "Token " + user_token
    },
    body: {
      title: '%how to%'
    }
  },
  onError(err){

  },
  // Type of `data` will be `PostsResponse`
  // If a type is not present, its type will
  // be inferred from the `default` prop
  onResolve(data){
    // Do something with the data
  }
})

...

```

#### Non-json data

By default, the response body is parsed as JSON, but it's also possible to customize how that data is parsed.

You can pass a `resolver` prop to the hook call.

In this example, an image is fetch and converted to a blob url:

```tsx
import { useFetcher } from "http-react-fetcher";

export default function ImageExample() {
  const { data } = useFetcher<string>({
    url: "/cat.png",
    // 'd' type is 'Response'
    resolver: async (d) => {
      // Converting to a blob
      const data = await d.blob();

      // Return the needed format
      return URL.createObjectURL(data);
    },
  });
  return (
    <main>
      <img src={data} alt="" />
    </main>
  );
}
```

If you don't pass a resolver, the `useFetcher` hook will try to read the response data as JSON.

#### Extending `useFetcher`

It may be tedious to write, for example, the same authorization header in each `useFetcher` call.

You can extend the base hook and configure the following props: `baseUrl`, `headers`, `body`,`resolver`, which will get applied to each hook call of the returned hook.

Example with jsonplaceholder:

```tsx
import { useFetcher } from "http-react-fetcher";

const useTodoFetcher = useFetcher.extend({
  baseUrl: "https://jsonplaceholder.typicode.com",
  headers: {},
  // If `resolver` is not present, data will be parsed as JSON
});

type TodoType = {
  userId: number;
};

export default function ImageExample() {
  // Typing works the same
  const { data } = useTodoFetcher<TodoType[]>({
    url: "/todos",
  });

  return (
    <main>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
```

#### Aborting requests

You can prevent requests from completing. `useFetcher` exposes an `abort` function which will cancel the current request. You can have a callback for when a request is cancelled.

You can also pass a `cancelOnChange` prop which will cancel a pending request to make a new one with the last props.

The last one is useful if for example, props change (which will always make a new request even if a request has not completed yet) and you don't want a previous request to finish, but only do it with the last props passed


```js
import { useFetcher } from "http-react-fetcher"
import { useState } from "react"

export default function App() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data, loading, error, abort } = useFetcher({
    url: "http://my-api/?search=" + searchQuery,
    onAbort() {
      console.log("Request aborted")
    },
    // Whenever props change, cancel pending request to make a new one
    cancelOnChange: true,
  })

  return (
    <div>
      <button onClick={abort}>Cancel search</button>
      <br />
      <input
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
        }}
      />
      {loading && <p>Loading results...</p>}
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  )
}


```

### SSR

A SSR API is supported. This is an example using Next.js:

```tsx
import { useFetcher, FetcherConfig } from "http-react-fetcher";

function SomeDataFetch() {
  const { data } = useFetcher({
    url: "/api/test",
  });
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default function Home({ user }) {
  return (
    <FetcherConfig
      // You can pass many other configurations to all requests under this tree
      // like the baseUrl, headers, a resolver, etc
      defaults={{
        "/api/test": {
          user,
        },
      }}
    >
      {/* Will be rendered in the server */}
      <SomeDataFetch />
    </FetcherConfig>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      user: "danybeltran",
    },
  };
}

```

### SSR if you are using `fetcher.extend`


```tsx
import { useFetcher, FetcherConfig } from "http-react-fetcher";

const useApi = useFetcher.extend({
  baseUrl: "https://my-url"
})

function SomeDataFetch() {
  const { data } = useApi({
    url: "/api/test",
  });
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default function Home({ user }) {
  return (
    <useApi.Config
      defaults={{
        "/api/test": {
          user,
        },
      }}
    >
      {/* Will be rendered in the server */}
      <SomeDataFetch />
    </useApi.Config>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      user: "danybeltran",
    },
  };
}

```


### Mutating response

You can mutate the returned data using the `mutate` property


```tsx
import { FetcherConfig, useFetcher } from "http-react-fetcher";

function SomeDataFetch() {
  const { data, mutate } = useFetcher<{ user: string }>({
    url: "/api/test",
  });
  return (
    <div>
      <button
        onClick={() => {
          mutate({
            user: "another-user",
          });
        }}
      >
        Change username
      </button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default function Home({ user }) {
  return (
    <FetcherConfig
      defaults={{
        "/api/test": {
          user,
        },
      }}
    >
      <SomeDataFetch />
    </FetcherConfig>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      user: "dany",
    },
  };
}

```

### Fetcher methods

`useFetcher` has other methods that can help you make requests. They are similar to the ones provided by Axios and the configuration is almos the same

Example

```jsx
import { useFetcher } from "http-react-fetcher"


function App() {

  // The hook
  const { data, code } = useFetcher("/api/user", {
    default: {},
    onResolve(d) {
      console.log("User:" , d)
    }
  })

  // Without hooks
  async function getUserData(){

    const { data, error, code } = useFetcher.get("/api/user", {
      default: {},
      onResolve(d) {
        console.log("User:" , d)
      }
    })

  }


  // Another example
  async function saveUserInfo(){

    const { data, error, code } = useFetcher.post("/api/user", {
      onResolve(d) {
        console.log("Info saved")
      },
      onError() {
        consolelog("Error saving info")
      }
    })

  }
}

```


### Fetcher methods when using `.extend`

You can extend the useFetcher hook and use those methods with the same config

```jsx
import { useFetcher } from "http-react-fetcher"

const useAPI = useFetcher.extend({
  baseUrl: "/api"
})

function App() {
  const { data, code } = useAPI("/user", {
    default: {},
    onResolve(d) {
      console.log("User:" , d)
    }
  })

  // Without hooks
  async function getUserData(){

    // We also remove the '/api' part as we moved it to our fetcher extension
    const { data, error, code } = useAPI.get("/user", {
      default: {},
      onResolve(d) {
        console.log("User:" , d)
      }
    })

  }


  // Another example
  async function saveUserInfo(){

    const { data, error, code } = useAPI.post("/user", {
      onResolve(d) {
        console.log("Info saved")
      },
      onError() {
        consolelog("Error saving info")
      }
    })

  }
}

```