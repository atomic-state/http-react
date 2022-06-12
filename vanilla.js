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
exports.fetcher.get = (0, shared_1.createRequestFn)("GET", "", {});
exports.fetcher.delete = (0, shared_1.createRequestFn)("DELETE", "", {});
exports.fetcher.head = (0, shared_1.createRequestFn)("HEAD", "", {});
exports.fetcher.options = (0, shared_1.createRequestFn)("OPTIONS", "", {});
exports.fetcher.post = (0, shared_1.createRequestFn)("POST", "", {});
exports.fetcher.put = (0, shared_1.createRequestFn)("PUT", "", {});
exports.fetcher.patch = (0, shared_1.createRequestFn)("PATCH", "", {});
exports.fetcher.purge = (0, shared_1.createRequestFn)("PURGE", "", {});
exports.fetcher.link = (0, shared_1.createRequestFn)("LINK", "", {});
exports.fetcher.unlink = (0, shared_1.createRequestFn)("UNLINK", "", {});
/**
 * Extend the fetcher object
 */
exports.fetcher.extend = function extendFetcher(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.baseUrl, baseUrl = _c === void 0 ? "" : _c, _d = _b.headers, headers = _d === void 0 ? {} : _d, _e = _b.body, body = _e === void 0 ? {} : _e, 
    // json by default
    _f = _b.resolver, 
    // json by default
    resolver = _f === void 0 ? function (d) { return d.json(); } : _f;
    function customFetcher() { }
    customFetcher.config = {
        baseUrl: baseUrl,
        headers: headers,
        body: body,
    };
    // Creating methods for fetcher.extend
    customFetcher.get = (0, shared_1.createRequestFn)("GET", baseUrl, headers);
    customFetcher.delete = (0, shared_1.createRequestFn)("DELETE", baseUrl, headers);
    customFetcher.head = (0, shared_1.createRequestFn)("HEAD", baseUrl, headers);
    customFetcher.options = (0, shared_1.createRequestFn)("OPTIONS", baseUrl, headers);
    customFetcher.post = (0, shared_1.createRequestFn)("POST", baseUrl, headers);
    customFetcher.put = (0, shared_1.createRequestFn)("PUT", baseUrl, headers);
    customFetcher.patch = (0, shared_1.createRequestFn)("PATCH", baseUrl, headers);
    customFetcher.purge = (0, shared_1.createRequestFn)("PURGE", baseUrl, headers);
    customFetcher.link = (0, shared_1.createRequestFn)("LINK", baseUrl, headers);
    customFetcher.unlink = (0, shared_1.createRequestFn)("UNLINK", baseUrl, headers);
    return customFetcher;
};
