/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createRequestFn, FetcherExtendConfig } from "./shared";

/**
 * Fetcher object
 */

export const fetcher = () => {};

// Create a method for each request
fetcher.get = createRequestFn("GET", "", {});
fetcher.delete = createRequestFn("DELETE", "", {});
fetcher.head = createRequestFn("HEAD", "", {});
fetcher.options = createRequestFn("OPTIONS", "", {});
fetcher.post = createRequestFn("POST", "", {});
fetcher.put = createRequestFn("PUT", "", {});
fetcher.patch = createRequestFn("PATCH", "", {});
fetcher.purge = createRequestFn("PURGE", "", {});
fetcher.link = createRequestFn("LINK", "", {});
fetcher.unlink = createRequestFn("UNLINK", "", {});

/**
 * Extend the fetcher object
 */
fetcher.extend = function extendFetcher({
  baseUrl = "",
  headers = {} as Headers,
  body = {},
  // json by default
  resolver = (d) => d.json(),
}: FetcherExtendConfig = {}) {
  function customFetcher() {}
  customFetcher.config = {
    baseUrl,
    headers,
    body,
  };

  // Creating methods for fetcher.extend
  customFetcher.get = createRequestFn("GET", baseUrl, headers);
  customFetcher.delete = createRequestFn("DELETE", baseUrl, headers);
  customFetcher.head = createRequestFn("HEAD", baseUrl, headers);
  customFetcher.options = createRequestFn("OPTIONS", baseUrl, headers);
  customFetcher.post = createRequestFn("POST", baseUrl, headers);
  customFetcher.put = createRequestFn("PUT", baseUrl, headers);
  customFetcher.patch = createRequestFn("PATCH", baseUrl, headers);
  customFetcher.purge = createRequestFn("PURGE", baseUrl, headers);
  customFetcher.link = createRequestFn("LINK", baseUrl, headers);
  customFetcher.unlink = createRequestFn("UNLINK", baseUrl, headers);

  return customFetcher;
};
