## React HTTP Fetcher

Wrapper component for the `fetch` API.
Make an http request directly inside JSX.

```jsx
// JavaScript

import Fetcher from "http-react-fetcher";

export default function App() {
    return (
      <Fetcher 
        url="/my-api-url"

        // Default data value
        default={{
          username:"Me"
        }}

        /*
         Function to run on unsuccessful
         request completion
        */
        onError={(err)=>{
          console.log({err})
        }}

        /*
         Function to run on successful
         request completion
        */
        onResolve={(data)=>{
          console.log({data})
        }}

        /*
         Interval for data fetching (in seconds).
         If 0, there will be no refresh.
        */
        refresh={0}

        // Request config
        config={{
          // Request method
          method: "GET" // POST, PUT, etc,
          headers:{
            // Your request headers
          },
          body:{
            // Your request body
          }
        }}
      >
        {
        /*
         Unique childr to render.
         Params are pretty self-describing:)
        */
        ({data, error, loading}) =>
            loading ? <p>Loading...</p> :
            error ? <p>Oops!</p> :
            (
            <>
                <h2>User info</h2>
                <p>{data.username}</p>
            </>
        )}
      </Fetcher>
    )
}
```

```tsx
/*
TypeScript (with optional type parameter
for the Fetcher child `data` property) 
*/

import Fetcher from "http-react-fetcher";

export default function App() {
    return (
      <Fetcher<{username:string}> 
        url="/my-api-url"

        // Default data value
        default={{
          username:"Me"
        }}

        /*
         Function to run on unsuccessful
         request completion
        */
        onError={(err)=>{
          console.log({err})
        }}

        /*
         Function to run on successful
         request completion
        */
        onResolve={(data)=>{
          console.log({data})
        }}

        /*
         Interval for data fetching (in seconds).
         If 0, there will be no refresh.
        */
        refresh={0}

        // Request config
        config={{
          // Request method
          method: "GET" // POST, PUT, etc,
          headers:{
            // Your request headers
          },
          body:{
            // Your request body
          }
        }}
      >
        {
        /*
         Unique childr to render.
         Params are pretty self-describing:)
        */
        ({data, error, loading}) =>
            loading ? <p>Loading...</p> :
            error ? <p>Oops!</p> :
            (
            <>
                <h2>User info</h2>
                <p>{data.username}</p>
            </>
        )}
      </Fetcher>
    )
}
```