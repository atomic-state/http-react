"use strict";
/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpClient = exports.fetcher = exports.useFetcher = exports.FetcherConfig = void 0;
var React = require("react");
var react_1 = require("react");
var shared_1 = require("./shared");
var FetcherContext = (0, react_1.createContext)({
    defaults: {},
});
/**
 * @deprecated Use the `useFetcher` hook instead
 */
var Fetcher = function (_a) {
    var _b = _a.url, url = _b === void 0 ? "/" : _b, def = _a.default, _c = _a.config, config = _c === void 0 ? { method: "GET", headers: {}, body: {} } : _c, Children = _a.children, _d = _a.onError, onError = _d === void 0 ? function () { } : _d, _e = _a.onResolve, onResolve = _e === void 0 ? function () { } : _e, _f = _a.refresh, refresh = _f === void 0 ? 0 : _f;
    var _g = (0, react_1.useState)(def), data = _g[0], setData = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)(true), loading = _j[0], setLoading = _j[1];
    function fetchData() {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var json, _data, code, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, fetch(url, {
                                method: config.method,
                                headers: __assign({ "Content-Type": "application/json" }, config.headers),
                                body: ((_a = config.method) === null || _a === void 0 ? void 0 : _a.match(/(POST|PUT|DELETE|PATCH)/))
                                    ? JSON.stringify(config.body)
                                    : undefined,
                            })];
                    case 1:
                        json = _b.sent();
                        return [4 /*yield*/, json.json()];
                    case 2:
                        _data = _b.sent();
                        code = json.status;
                        if (code >= 200 && code < 300) {
                            setData(_data);
                            setError(null);
                            onResolve(_data, json);
                        }
                        else {
                            if (def) {
                                setData(def);
                            }
                            setError(true);
                            onError(_data);
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        setData(undefined);
                        setError(new Error(err_1));
                        onError(err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    (0, react_1.useEffect)(function () {
        function reValidate() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if ((data || error) && !loading) {
                        setLoading(true);
                        fetchData();
                    }
                    return [2 /*return*/];
                });
            });
        }
        if (refresh > 0) {
            var interval_1 = setTimeout(reValidate, refresh * 1000);
            return function () { return clearTimeout(interval_1); };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, data, config]);
    (0, react_1.useEffect)(function () {
        setLoading(true);
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, refresh, config]);
    if (typeof Children !== "undefined") {
        return React.createElement(Children, { data: data, error: error, loading: loading });
    }
    else {
        return null;
    }
};
exports.default = Fetcher;
var resolvedRequests = {};
function FetcherConfig(props) {
    var children = props.children, _a = props.defaults, defaults = _a === void 0 ? {} : _a, baseUrl = props.baseUrl, body = props.body, resolver = props.resolver, headers = props.headers, auto = props.auto, memory = props.memory, refresh = props.refresh;
    for (var defaultKey in defaults) {
        resolvedRequests["".concat(typeof baseUrl === "undefined" ? "" : baseUrl).concat(defaultKey)] = defaults[defaultKey];
    }
    return (React.createElement(FetcherContext.Provider, { value: { baseUrl: baseUrl, body: body, resolver: resolver, headers: headers, auto: auto, memory: memory, refresh: refresh } }, children));
}
exports.FetcherConfig = FetcherConfig;
/**
 * Fetcher available as a hook
 */
var useFetcher = function (init, options) {
    var ctx = (0, react_1.useContext)(FetcherContext);
    var _a = typeof init === "string"
        ? __assign({ 
            // Pass init as the url if init is a string
            url: init }, options) : // `url` will be required in init if it is an object
        init, _b = _a.url, url = _b === void 0 ? "/" : _b, def = _a.default, _c = _a.config, config = _c === void 0 ? {
        baseUrl: undefined,
        method: "GET",
        headers: {},
        body: undefined,
        formatBody: false,
    } : _c, _d = _a.resolver, resolver = _d === void 0 ? typeof ctx.resolver === "function"
        ? ctx.resolver
        : function (d) { return d.json(); } : _d, _e = _a.onError, onError = _e === void 0 ? function () { } : _e, _f = _a.auto, auto = _f === void 0 ? typeof ctx.auto === "undefined" ? true : ctx.memory : _f, _g = _a.memory, memory = _g === void 0 ? typeof ctx.memory === "undefined" ? true : ctx.memory : _g, _h = _a.onResolve, onResolve = _h === void 0 ? function () { } : _h, _j = _a.onAbort, onAbort = _j === void 0 ? function () { } : _j, _k = _a.refresh, refresh = _k === void 0 ? typeof ctx.refresh === "undefined" ? 0 : ctx.refresh : _k, _l = _a.cancelOnChange, cancelOnChange = _l === void 0 ? typeof ctx.refresh === "undefined" ? false : ctx.refresh : _l;
    var realUrl = (typeof config.baseUrl === "undefined"
        ? typeof ctx.baseUrl === "undefined"
            ? ""
            : ctx.baseUrl
        : config.baseUrl) + url;
    var resolvedKey = realUrl.split("?")[0];
    var _m = (0, react_1.useState)(
    // Saved to base url of request without query params
    memory ? resolvedRequests[resolvedKey] || def : def), data = _m[0], setData = _m[1];
    var _o = (0, react_1.useState)((typeof FormData !== "undefined"
        ? config.body instanceof FormData
            ? config.body
            : typeof ctx.body !== "undefined" || typeof config.body !== "undefined"
                ? __assign(__assign({}, ctx.body), config.body) : undefined
        : config.body)), requestBody = _o[0], setRequestBody = _o[1];
    var _p = (0, react_1.useState)(__assign(__assign({}, ctx.headers), config.headers)), requestHeaders = _p[0], setRequestHeades = _p[1];
    var _q = (0, react_1.useState)(), response = _q[0], setResponse = _q[1];
    var _r = (0, react_1.useState)(), statusCode = _r[0], setStatusCode = _r[1];
    var _s = (0, react_1.useState)(null), error = _s[0], setError = _s[1];
    var _t = (0, react_1.useState)(true), loading = _t[0], setLoading = _t[1];
    var _u = (0, react_1.useState)(new AbortController()), requestAbortController = _u[0], setRequestAbortController = _u[1];
    function fetchData(c) {
        var _a;
        if (c === void 0) { c = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var newAbortController, json, code, _data, err_2, errorString;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (cancelOnChange) {
                            requestAbortController === null || requestAbortController === void 0 ? void 0 : requestAbortController.abort();
                        }
                        newAbortController = new AbortController();
                        setRequestAbortController(newAbortController);
                        setError(null);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch(realUrl, {
                                signal: newAbortController.signal,
                                method: config.method,
                                headers: __assign(__assign({ "Content-Type": 
                                    // If body is form-data, set Content-Type header to 'multipart/form-data'
                                    typeof FormData !== "undefined" && config.body instanceof FormData
                                        ? "multipart/form-data"
                                        : "application/json" }, config.headers), c.headers),
                                body: ((_a = config.method) === null || _a === void 0 ? void 0 : _a.match(/(POST|PUT|DELETE|PATCH)/))
                                    ? typeof config.formatBody === "function"
                                        ? config.formatBody((typeof FormData !== "undefined" &&
                                            config.body instanceof FormData
                                            ? config.body
                                            : __assign(__assign({}, config.body), c.body)))
                                        : config.formatBody === false ||
                                            (typeof FormData !== "undefined" &&
                                                config.body instanceof FormData)
                                            ? config.body
                                            : JSON.stringify(__assign(__assign({}, config.body), c.body))
                                    : undefined,
                            })];
                    case 2:
                        json = _b.sent();
                        setResponse(json);
                        code = json.status;
                        setStatusCode(code);
                        return [4 /*yield*/, resolver(json)];
                    case 3:
                        _data = _b.sent();
                        if (code >= 200 && code < 400) {
                            if (memory) {
                                resolvedRequests[resolvedKey] = _data;
                            }
                            setData(_data);
                            setError(null);
                            onResolve(_data, json);
                        }
                        else {
                            if (def) {
                                setData(def);
                            }
                            setError(true);
                            onError(_data, json);
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_2 = _b.sent();
                        errorString = err_2 === null || err_2 === void 0 ? void 0 : err_2.toString();
                        // Only set error if no abort
                        if (!errorString.match(/abort/i)) {
                            setData(undefined);
                            setError(new Error(err_2));
                            onError(err_2);
                        }
                        else {
                            if (!resolvedRequests[resolvedKey]) {
                                setData(def);
                            }
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    (0, react_1.useEffect)(function () {
        var signal = (requestAbortController || {}).signal;
        // Run onAbort callback
        var abortCallback = function () {
            var timeout = setTimeout(function () {
                onAbort();
                clearTimeout(timeout);
            });
        };
        signal === null || signal === void 0 ? void 0 : signal.addEventListener("abort", abortCallback);
        return function () {
            signal === null || signal === void 0 ? void 0 : signal.removeEventListener("abort", abortCallback);
        };
    }, [requestAbortController, onAbort]);
    function reValidate(c) {
        if (c === void 0) { c = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Only revalidate if request was already completed
                if (c.body) {
                    setRequestBody(function (p) { return (__assign(__assign({}, p), c.body)); });
                }
                if (c.headers) {
                    setRequestHeades(function (p) { return (__assign(__assign({}, p), c.headers)); });
                }
                if (!loading) {
                    setLoading(true);
                    fetchData(c);
                }
                return [2 /*return*/];
            });
        });
    }
    (0, react_1.useEffect)(function () {
        if (refresh > 0 && auto) {
            var interval_2 = setTimeout(reValidate, refresh * 1000);
            return function () { return clearTimeout(interval_2); };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, data, config]);
    (0, react_1.useEffect)(function () {
        if (auto) {
            setLoading(true);
            fetchData();
        }
        else {
            setData(def);
            setError(null);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, refresh, JSON.stringify(config)]);
    return {
        data: data,
        loading: loading,
        error: error,
        code: statusCode,
        reFetch: reValidate,
        mutate: setData,
        abort: function () {
            requestAbortController.abort();
            if (loading) {
                setError(false);
                setLoading(false);
                setData(resolvedRequests[resolvedKey]);
            }
        },
        config: __assign(__assign({}, config), { headers: requestHeaders, body: requestBody, url: realUrl }),
        response: response,
    };
};
exports.useFetcher = useFetcher;
// Create a method for each request
useFetcher.get = (0, shared_1.createRequestFn)("GET", "", {});
useFetcher.delete = (0, shared_1.createRequestFn)("DELETE", "", {});
useFetcher.head = (0, shared_1.createRequestFn)("HEAD", "", {});
useFetcher.options = (0, shared_1.createRequestFn)("OPTIONS", "", {});
useFetcher.post = (0, shared_1.createRequestFn)("POST", "", {});
useFetcher.put = (0, shared_1.createRequestFn)("PUT", "", {});
useFetcher.patch = (0, shared_1.createRequestFn)("PATCH", "", {});
useFetcher.purge = (0, shared_1.createRequestFn)("PURGE", "", {});
useFetcher.link = (0, shared_1.createRequestFn)("LINK", "", {});
useFetcher.unlink = (0, shared_1.createRequestFn)("UNLINK", "", {});
/**
 * Extend the useFetcher hook
 */
useFetcher.extend = function extendFetcher(props) {
    if (props === void 0) { props = {}; }
    var _a = props.baseUrl, baseUrl = _a === void 0 ? undefined : _a, _b = props.headers, headers = _b === void 0 ? {} : _b, _c = props.body, body = _c === void 0 ? {} : _c, 
    // json by default
    resolver = props.resolver;
    function useCustomFetcher(init, options) {
        var ctx = (0, react_1.useContext)(FetcherContext);
        var _a = typeof init === "string"
            ? __assign({ 
                // set url if init is a stringss
                url: init }, options) : // `url` will be required in init if it is an object
            init, _b = _a.url, url = _b === void 0 ? "" : _b, _c = _a.config, config = _c === void 0 ? {} : _c, otherProps = __rest(_a, ["url", "config"]);
        return useFetcher(__assign(__assign({}, otherProps), { url: "".concat(url), 
            // If resolver is present is hook call, use that instead
            resolver: resolver || otherProps.resolver || ctx.resolver || (function (d) { return d.json(); }), config: {
                baseUrl: typeof config.baseUrl === "undefined"
                    ? typeof ctx.baseUrl === "undefined"
                        ? baseUrl
                        : ctx.baseUrl
                    : config.baseUrl,
                method: config.method,
                headers: __assign(__assign(__assign({}, headers), ctx.headers), config.headers),
                body: __assign(__assign(__assign({}, body), ctx.body), config.body),
            } }));
    }
    useCustomFetcher.config = {
        baseUrl: baseUrl,
        headers: headers,
        body: body,
    };
    // Creating methods for fetcher.extend
    useCustomFetcher.get = (0, shared_1.createRequestFn)("GET", baseUrl, headers);
    useCustomFetcher.delete = (0, shared_1.createRequestFn)("DELETE", baseUrl, headers);
    useCustomFetcher.head = (0, shared_1.createRequestFn)("HEAD", baseUrl, headers);
    useCustomFetcher.options = (0, shared_1.createRequestFn)("OPTIONS", baseUrl, headers);
    useCustomFetcher.post = (0, shared_1.createRequestFn)("POST", baseUrl, headers);
    useCustomFetcher.put = (0, shared_1.createRequestFn)("PUT", baseUrl, headers);
    useCustomFetcher.patch = (0, shared_1.createRequestFn)("PATCH", baseUrl, headers);
    useCustomFetcher.purge = (0, shared_1.createRequestFn)("PURGE", baseUrl, headers);
    useCustomFetcher.link = (0, shared_1.createRequestFn)("LINK", baseUrl, headers);
    useCustomFetcher.unlink = (0, shared_1.createRequestFn)("UNLINK", baseUrl, headers);
    useCustomFetcher.Config = FetcherConfig;
    return useCustomFetcher;
};
exports.fetcher = useFetcher;
var defaultConfig = { headers: {}, body: undefined };
/**
 * Basic HttpClient
 */
var HttpClient = /** @class */ (function () {
    function HttpClient(url) {
        this.baseUrl = "";
        this.baseUrl = url;
    }
    HttpClient.prototype.get = function (path, _a, method) {
        var _b = _a === void 0 ? defaultConfig : _a, headers = _b.headers, body = _b.body;
        if (method === void 0) { method = "GET"; }
        return __awaiter(this, void 0, void 0, function () {
            var requestUrl, responseBody, responseData;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        requestUrl = "".concat(this.baseUrl).concat(path);
                        return [4 /*yield*/, fetch(requestUrl, __assign({ method: method, headers: __assign({ "Content-Type": "application/json", Accept: "application/json" }, headers) }, (body ? { body: JSON.stringify(body) } : {})))];
                    case 1:
                        responseBody = _c.sent();
                        return [4 /*yield*/, responseBody.json()];
                    case 2:
                        responseData = _c.sent();
                        return [2 /*return*/, responseData];
                }
            });
        });
    };
    HttpClient.prototype.post = function (path, props) {
        if (props === void 0) { props = defaultConfig; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(path, props, "POST")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    HttpClient.prototype.put = function (path, props) {
        if (props === void 0) { props = defaultConfig; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(path, props, "PUT")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    HttpClient.prototype.delete = function (path, props) {
        if (props === void 0) { props = defaultConfig; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(path, props, "DELETE")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return HttpClient;
}());
/**
 * @deprecated - Use the fetcher instead
 *
 * Basic HttpClient
 */
function createHttpClient(url) {
    return new HttpClient(url);
}
exports.createHttpClient = createHttpClient;
