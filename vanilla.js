"use strict";
/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetcher = void 0;
var shared_1 = require("./shared");
/**
 * Fetcher object
 */
var fetcher = function () { };
exports.fetcher = fetcher;
// Create a method for each request
fetcher.get = (0, shared_1.createRequestFn)("GET", "", {});
fetcher.delete = (0, shared_1.createRequestFn)("DELETE", "", {});
fetcher.head = (0, shared_1.createRequestFn)("HEAD", "", {});
fetcher.options = (0, shared_1.createRequestFn)("OPTIONS", "", {});
fetcher.post = (0, shared_1.createRequestFn)("POST", "", {});
fetcher.put = (0, shared_1.createRequestFn)("PUT", "", {});
fetcher.patch = (0, shared_1.createRequestFn)("PATCH", "", {});
fetcher.purge = (0, shared_1.createRequestFn)("PURGE", "", {});
fetcher.link = (0, shared_1.createRequestFn)("LINK", "", {});
fetcher.unlink = (0, shared_1.createRequestFn)("UNLINK", "", {});
/**
 * Extend the fetcher object
 */
fetcher.extend = function extendFetcher(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.baseUrl, baseUrl = _c === void 0 ? "" : _c, _d = _b.headers, headers = _d === void 0 ? {} : _d, _e = _b.body, body = _e === void 0 ? {} : _e, _f = _b.query, query = _f === void 0 ? {} : _f, 
    // json by default
    _g = _b.resolver, 
    // json by default
    resolver = _g === void 0 ? function (d) { return d.json(); } : _g;
    function customFetcher() { }
    customFetcher.config = {
        baseUrl: baseUrl,
        headers: headers,
        body: body,
        query: query,
    };
    // Creating methods for fetcher.extend
    customFetcher.get = (0, shared_1.createRequestFn)("GET", baseUrl, headers, query);
    customFetcher.delete = (0, shared_1.createRequestFn)("DELETE", baseUrl, headers, query);
    customFetcher.head = (0, shared_1.createRequestFn)("HEAD", baseUrl, headers, query);
    customFetcher.options = (0, shared_1.createRequestFn)("OPTIONS", baseUrl, headers, query);
    customFetcher.post = (0, shared_1.createRequestFn)("POST", baseUrl, headers, query);
    customFetcher.put = (0, shared_1.createRequestFn)("PUT", baseUrl, headers, query);
    customFetcher.patch = (0, shared_1.createRequestFn)("PATCH", baseUrl, headers, query);
    customFetcher.purge = (0, shared_1.createRequestFn)("PURGE", baseUrl, headers, query);
    customFetcher.link = (0, shared_1.createRequestFn)("LINK", baseUrl, headers, query);
    customFetcher.unlink = (0, shared_1.createRequestFn)("UNLINK", baseUrl, headers, query);
    return customFetcher;
};
