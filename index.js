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
exports.createHttpClient = exports.fetcher = exports.useFetcher = exports.useFetcherError = exports.useFetcherLoading = exports.useFetcherData = exports.useFetcherConfig = exports.mutateData = exports.revalidate = exports.FetcherConfig = void 0;
var React = require("react");
var react_1 = require("react");
var events_1 = require("events");
/**
 * Creates a new request function. This is for usage with fetcher and fetcher.extend
 */
function createRequestFn(method, baseUrl, $headers, q) {
    return function (url, init) {
        if (init === void 0) { init = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var def, _a, resolver, _b, c, _c, onResolve, _d, onError, query, _e, _f, qp, reqQueryString, _g, headers, body, formatBody, reqConfig, r, req, data, err_1;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        def = init.default, _a = init.resolver, resolver = _a === void 0 ? function (e) { return e.json(); } : _a, _b = init.config, c = _b === void 0 ? {} : _b, _c = init.onResolve, onResolve = _c === void 0 ? function () { } : _c, _d = init.onError, onError = _d === void 0 ? function () { } : _d;
                        query = __assign(__assign({}, q), c.query);
                        _e = url.split("?"), _f = _e[1], qp = _f === void 0 ? "" : _f;
                        qp.split("&").forEach(function (q) {
                            var _a;
                            var _b = q.split("="), key = _b[0], value = _b[1];
                            if (query[key] !== value) {
                                query = __assign(__assign({}, query), (_a = {}, _a[key] = value, _a));
                            }
                        });
                        reqQueryString = Object.keys(query)
                            .map(function (q) { return [q, query[q]].join("="); })
                            .join("&");
                        _g = c.headers, headers = _g === void 0 ? {} : _g, body = c.body, formatBody = c.formatBody;
                        reqConfig = {
                            method: method,
                            headers: __assign(__assign({ "Content-Type": "application/json" }, $headers), headers),
                            body: (method === null || method === void 0 ? void 0 : method.match(/(POST|PUT|DELETE|PATCH)/))
                                ? typeof formatBody === "function"
                                    ? formatBody((typeof FormData !== "undefined" && body instanceof FormData
                                        ? body
                                        : body))
                                    : formatBody === false ||
                                        (typeof FormData !== "undefined" && body instanceof FormData)
                                        ? body
                                        : JSON.stringify(body)
                                : undefined,
                        };
                        r = undefined;
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(baseUrl || "").concat(url).concat(url.includes("?") ? "&".concat(reqQueryString) : "?".concat(reqQueryString)), reqConfig)];
                    case 2:
                        req = _h.sent();
                        r = req;
                        return [4 /*yield*/, resolver(req)];
                    case 3:
                        data = _h.sent();
                        if ((req === null || req === void 0 ? void 0 : req.status) >= 400) {
                            onError(true);
                            return [2 /*return*/, {
                                    res: req,
                                    data: def,
                                    error: true,
                                    code: req === null || req === void 0 ? void 0 : req.status,
                                    config: __assign(__assign({ url: "".concat(baseUrl || "").concat(url) }, reqConfig), { query: query }),
                                }];
                        }
                        else {
                            onResolve(data, req);
                            return [2 /*return*/, {
                                    res: req,
                                    data: data,
                                    error: false,
                                    code: req === null || req === void 0 ? void 0 : req.status,
                                    config: __assign(__assign({ url: "".concat(baseUrl || "").concat(url) }, reqConfig), { query: query }),
                                }];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _h.sent();
                        onError(err_1);
                        return [2 /*return*/, {
                                res: r,
                                data: def,
                                error: true,
                                code: r === null || r === void 0 ? void 0 : r.status,
                                config: __assign(__assign({ url: "".concat(baseUrl || "").concat(url) }, reqConfig), { query: query }),
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
}
var runningRequests = {};
var createRequestEmitter = function () {
    var emitter = new events_1.EventEmitter();
    emitter.setMaxListeners(10e10);
    return emitter;
};
var requestEmitter = createRequestEmitter();
var FetcherContext = (0, react_1.createContext)({
    defaults: {},
    attempts: 0,
    // By default its 5 seconds
    attemptInterval: 2,
    revalidateOnFocus: false,
    query: {},
    params: {},
    onOffline: function () { },
    onOnline: function () { },
    online: true,
    retryOnReconnect: true,
});
var resolvedRequests = {};
/**
 * Default store cache
 */
var defaultCache = {
    get: function (k) {
        return resolvedRequests[k];
    },
    set: function (k, v) {
        resolvedRequests[k] = v;
    },
    delete: function (k) {
        delete resolvedRequests[k];
    },
};
var valuesMemory = {};
function FetcherConfig(props) {
    var _a, _b, _c, _d;
    var children = props.children, _e = props.defaults, defaults = _e === void 0 ? {} : _e, baseUrl = props.baseUrl;
    var previousConfig = (0, react_1.useContext)(FetcherContext);
    var _f = previousConfig.cache, cache = _f === void 0 ? defaultCache : _f;
    var base = typeof baseUrl === "undefined"
        ? typeof previousConfig.baseUrl === "undefined"
            ? ""
            : previousConfig.baseUrl
        : baseUrl;
    for (var defaultKey in defaults) {
        var id = defaults[defaultKey].id;
        var resolvedKey = JSON.stringify({
            uri: typeof id === "undefined" ? "".concat(base).concat(defaultKey) : undefined,
            idString: typeof id === "undefined" ? undefined : JSON.stringify(id),
            config: typeof id === "undefined"
                ? {
                    method: (_b = (_a = defaults[defaultKey]) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.method,
                }
                : undefined,
        });
        if (typeof id !== "undefined") {
            valuesMemory[JSON.stringify(id)] = (_c = defaults[defaultKey]) === null || _c === void 0 ? void 0 : _c.value;
        }
        cache.set(resolvedKey, (_d = defaults[defaultKey]) === null || _d === void 0 ? void 0 : _d.value);
    }
    var mergedConfig = __assign(__assign(__assign({}, previousConfig), props), { headers: __assign(__assign({}, previousConfig.headers), props.headers) });
    return (React.createElement(FetcherContext.Provider, { value: mergedConfig }, children));
}
exports.FetcherConfig = FetcherConfig;
/**
 * Revalidate requests that match an id or ids
 */
function revalidate(id) {
    if (Array.isArray(id)) {
        id.map(function (reqId) {
            if (typeof reqId !== "undefined") {
                var key = JSON.stringify(reqId);
                requestEmitter.emit(key);
            }
        });
    }
    else {
        if (typeof id !== "undefined") {
            var key = JSON.stringify(id);
            requestEmitter.emit(key);
        }
    }
}
exports.revalidate = revalidate;
var cacheForMutation = {};
/**
 * Force mutation in requests from anywhere. This doesn't revalidate requests
 */
function mutateData() {
    var pairs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pairs[_i] = arguments[_i];
    }
    for (var _a = 0, pairs_1 = pairs; _a < pairs_1.length; _a++) {
        var pair = pairs_1[_a];
        try {
            var k = pair[0], v = pair[1], _revalidate = pair[2];
            var key = JSON.stringify(k);
            if (typeof v === "function") {
                var newVal = v(cacheForMutation[key]);
                requestEmitter.emit(key, {
                    data: newVal,
                });
                if (_revalidate) {
                    requestEmitter.emit(key);
                }
            }
            else {
                requestEmitter.emit(key, {
                    data: v,
                });
                if (_revalidate) {
                    requestEmitter.emit(key);
                }
            }
        }
        catch (err) { }
    }
}
exports.mutateData = mutateData;
/**
 * Get the current fetcher config
 */
function useFetcherConfig() {
    return (0, react_1.useContext)(FetcherContext);
}
exports.useFetcherConfig = useFetcherConfig;
/**
 * Get the data state of a request using its id
 */
function useFetcherData(id) {
    var data = useFetcher({
        id: id,
    }).data;
    return data;
}
exports.useFetcherData = useFetcherData;
/**
 * Get the loading state of a request using its id
 */
function useFetcherLoading(id) {
    var idString = JSON.stringify({ idString: JSON.stringify(id) });
    var data = useFetcher({
        id: id,
    }).data;
    return typeof runningRequests[idString] === "undefined"
        ? true
        : runningRequests[idString];
}
exports.useFetcherLoading = useFetcherLoading;
/**
 * Get the error state of a request using its id
 */
function useFetcherError(id) {
    var error = useFetcher({
        id: id,
    }).error;
    return error;
}
exports.useFetcherError = useFetcherError;
/**
 * Fetcher hook
 */
var useFetcher = function (init, options) {
    var ctx = (0, react_1.useContext)(FetcherContext);
    var _a = {}.cache, cache = _a === void 0 ? defaultCache : _a;
    var _b = typeof init === "string"
        ? __assign({ 
            // Pass init as the url if init is a string
            url: init }, options) : // `url` will be required in init if it is an object
        init, _c = _b.onOnline, onOnline = _c === void 0 ? ctx.onOnline : _c, _d = _b.onOffline, onOffline = _d === void 0 ? ctx.onOffline : _d, _e = _b.retryOnReconnect, retryOnReconnect = _e === void 0 ? ctx.retryOnReconnect : _e, _f = _b.url, url = _f === void 0 ? "" : _f, id = _b.id, def = _b.default, _g = _b.config, config = _g === void 0 ? {
        query: {},
        params: {},
        baseUrl: undefined,
        method: "GET",
        headers: {},
        body: undefined,
        formatBody: false,
    } : _g, _h = _b.resolver, resolver = _h === void 0 ? typeof ctx.resolver === "function"
        ? ctx.resolver
        : function (d) { return d.json(); } : _h, _j = _b.onError, onError = _j === void 0 ? function () { } : _j, _k = _b.auto, auto = _k === void 0 ? typeof ctx.auto === "undefined" ? true : ctx.auto : _k, _l = _b.memory, memory = _l === void 0 ? typeof ctx.memory === "undefined" ? true : ctx.memory : _l, _m = _b.onResolve, onResolve = _m === void 0 ? function () { } : _m, _o = _b.onAbort, onAbort = _o === void 0 ? function () { } : _o, _p = _b.refresh, refresh = _p === void 0 ? typeof ctx.refresh === "undefined" ? 0 : ctx.refresh : _p, _q = _b.cancelOnChange, cancelOnChange = _q === void 0 ? false : _q, //typeof ctx.refresh === "undefined" ? false : ctx.refresh,
    _r = _b.attempts, //typeof ctx.refresh === "undefined" ? false : ctx.refresh,
    attempts = _r === void 0 ? ctx.attempts : _r, _s = _b.attemptInterval, attemptInterval = _s === void 0 ? ctx.attemptInterval : _s, _t = _b.revalidateOnFocus, revalidateOnFocus = _t === void 0 ? ctx.revalidateOnFocus : _t;
    var idString = JSON.stringify(id);
    var _u = (0, react_1.useState)(__assign(__assign({}, ctx.query), Object.fromEntries(Object.keys((config === null || config === void 0 ? void 0 : config.query) || {}).map(function (k) { var _a; return [k, "".concat((_a = config === null || config === void 0 ? void 0 : config.query) === null || _a === void 0 ? void 0 : _a[k])]; })))), reqQuery = _u[0], setReqQuery = _u[1];
    var _v = (0, react_1.useState)(__assign(__assign({}, ctx.params), config.params)), reqParams = _v[0], setReqParams = _v[1];
    (0, react_1.useEffect)(function () {
        setReqParams(__assign(__assign({}, ctx.params), config.params));
    }, [JSON.stringify(__assign(__assign({}, ctx.params), config.params))]);
    (0, react_1.useEffect)(function () {
        setReqQuery(__assign(__assign({}, ctx.query), config.query));
    }, [JSON.stringify(ctx.query), JSON.stringify(config.query), url]);
    var rawUrl = (url.startsWith("http://") || url.startsWith("https://")
        ? ""
        : typeof config.baseUrl === "undefined"
            ? typeof ctx.baseUrl === "undefined"
                ? ""
                : ctx.baseUrl
            : config.baseUrl) + url;
    var urlWithParams = React.useMemo(function () {
        return rawUrl
            .split("/")
            .map(function (segment) {
            if (segment.startsWith("[") && segment.endsWith("]")) {
                var paramName = segment.replace(/\[|\]/g, "");
                if (!(paramName in reqParams)) {
                    console.warn("Param '".concat(paramName, "' does not exist in request configuration for '").concat(url, "'"));
                    return paramName;
                }
                return reqParams[segment.replace(/\[|\]/g, "")];
            }
            else if (segment.startsWith(":")) {
                var paramName = segment.split("").slice(1).join("");
                if (!(paramName in reqParams)) {
                    console.warn("Param '".concat(paramName, "' does not exist in request configuration for '").concat(url, "'"));
                    return paramName;
                }
                return reqParams[paramName];
            }
            else {
                return segment;
            }
        })
            .join("/");
    }, [JSON.stringify(reqParams), config.baseUrl, ctx.baseUrl, url]);
    var reqQueryString = Object.keys(reqQuery)
        .map(function (q) { return [q, reqQuery[q]].join("="); })
        .join("&");
    var realUrl = urlWithParams +
        (urlWithParams.includes("?") ? "&".concat(reqQueryString) : "?" + reqQueryString);
    var _w = realUrl.split("?"), resKey = _w[0], qp = _w[1];
    var resolvedKey = JSON.stringify({
        uri: typeof id === "undefined" ? rawUrl : undefined,
        idString: typeof id === "undefined" ? undefined : idString,
        config: typeof id === "undefined"
            ? {
                method: config === null || config === void 0 ? void 0 : config.method,
            }
            : undefined,
    });
    (0, react_1.useEffect)(function () {
        if (!auto) {
            runningRequests[resolvedKey] = false;
        }
    }, []);
    var _x = (0, react_1.useState)(false), queryReady = _x[0], setQueryReady = _x[1];
    (0, react_1.useEffect)(function () {
        setQueryReady(false);
        var queryParamsFromString = {};
        // getting query params from passed url
        var queryParts = qp.split("&");
        queryParts.forEach(function (q, i) {
            var _a = q.split("="), key = _a[0], value = _a[1];
            if (queryParamsFromString[key] !== value) {
                queryParamsFromString[key] = "".concat(value);
            }
        });
        var tm1 = setTimeout(function () {
            setReqQuery(function (previousQuery) { return (__assign(__assign({}, previousQuery), queryParamsFromString)); });
            clearTimeout(tm1);
        }, 0);
        var tm = setTimeout(function () {
            setQueryReady(true);
            clearTimeout(tm);
        }, 0);
    }, [JSON.stringify(reqQuery)]);
    var requestCache = cache.get(resolvedKey);
    var _y = (0, react_1.useState)(
    // Saved to base url of request without query params
    memory ? requestCache || valuesMemory[rawUrl] || def : def), data = _y[0], setData = _y[1];
    // Used JSON as deppendency instead of directly using a reference to data
    var rawJSON = JSON.stringify(data);
    var _z = (0, react_1.useState)(true), online = _z[0], setOnline = _z[1];
    var _0 = (0, react_1.useState)((typeof FormData !== "undefined"
        ? config.body instanceof FormData
            ? config.body
            : typeof ctx.body !== "undefined" || typeof config.body !== "undefined"
                ? __assign(__assign({}, ctx.body), config.body) : undefined
        : config.body)), requestBody = _0[0], setRequestBody = _0[1];
    var _1 = (0, react_1.useState)(__assign(__assign({}, ctx.headers), config.headers)), requestHeaders = _1[0], setRequestHeades = _1[1];
    var _2 = (0, react_1.useState)(), response = _2[0], setResponse = _2[1];
    var _3 = (0, react_1.useState)(), statusCode = _3[0], setStatusCode = _3[1];
    var _4 = (0, react_1.useState)(null), error = _4[0], setError = _4[1];
    var _5 = (0, react_1.useState)(true), loading = _5[0], setLoading = _5[1];
    var _6 = (0, react_1.useState)(0), completedAttempts = _6[0], setCompletedAttempts = _6[1];
    var _7 = (0, react_1.useState)(new AbortController()), requestAbortController = _7[0], setRequestAbortController = _7[1];
    var requestCallId = React.useMemo(function () { return "".concat(Math.random()).split(".")[1]; }, []);
    function fetchData(c) {
        var _a;
        if (c === void 0) { c = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var newAbortController, json, code, _data, err_2, errorString, _error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        runningRequests[resolvedKey] = true;
                        newAbortController = new AbortController();
                        setRequestAbortController(newAbortController);
                        setError(null);
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            loading: loading,
                            requestAbortController: newAbortController,
                            error: null,
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch(realUrl, {
                                signal: newAbortController.signal,
                                method: config.method,
                                headers: __assign(__assign(__assign({ "Content-Type": 
                                    // If body is form-data, set Content-Type header to 'multipart/form-data'
                                    typeof FormData !== "undefined" && config.body instanceof FormData
                                        ? "multipart/form-data"
                                        : "application/json" }, ctx.headers), config.headers), c.headers),
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
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            response: json,
                        });
                        code = json.status;
                        setStatusCode(code);
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            code: code,
                        });
                        return [4 /*yield*/, resolver(json)];
                    case 3:
                        _data = _b.sent();
                        if (code >= 200 && code < 400) {
                            if (memory) {
                                cache.set(resolvedKey, _data);
                                valuesMemory[idString] = _data;
                            }
                            setData(_data);
                            cacheForMutation[idString] = _data;
                            setError(null);
                            requestEmitter.emit(resolvedKey, {
                                requestCallId: requestCallId,
                                data: _data,
                                error: null,
                            });
                            onResolve(_data, json);
                            requestEmitter.emit(idString + "value", {
                                data: _data,
                            });
                            runningRequests[resolvedKey] = false;
                            // If a request completes succesfuly, we reset the error attempts to 0
                            setCompletedAttempts(0);
                            requestEmitter.emit(resolvedKey, {
                                requestCallId: requestCallId,
                                completedAttempts: 0,
                            });
                        }
                        else {
                            if (def) {
                                setData(def);
                                cacheForMutation[idString] = def;
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: def,
                                });
                            }
                            setError(true);
                            requestEmitter.emit(resolvedKey, {
                                requestCallId: requestCallId,
                                error: true,
                            });
                            onError(_data, json);
                            runningRequests[resolvedKey] = false;
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_2 = _b.sent();
                        errorString = err_2 === null || err_2 === void 0 ? void 0 : err_2.toString();
                        // Only set error if no abort
                        if (!"".concat(errorString).match(/abort/i)) {
                            if (typeof requestCache === "undefined") {
                                setData(def);
                                cacheForMutation[idString] = def;
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: def,
                                });
                            }
                            else {
                                setData(requestCache);
                                cacheForMutation[idString] = requestCache;
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: requestCache,
                                });
                            }
                            _error = new Error(err_2);
                            setError(_error);
                            requestEmitter.emit(resolvedKey, {
                                requestCallId: requestCallId,
                                error: _error,
                            });
                            onError(err_2);
                        }
                        else {
                            if (typeof requestCache === "undefined") {
                                if (typeof def !== "undefined") {
                                    setData(def);
                                    cacheForMutation[idString] = def;
                                }
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: def,
                                });
                            }
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        runningRequests[resolvedKey] = false;
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            loading: false,
                        });
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
    var stringDeps = JSON.stringify(
    // We ignore children and resolver
    Object.assign(ctx, { children: undefined }, config === null || config === void 0 ? void 0 : config.headers, config === null || config === void 0 ? void 0 : config.body, config === null || config === void 0 ? void 0 : config.query, config === null || config === void 0 ? void 0 : config.params, { resolver: undefined }, { reqQuery: reqQuery }, { reqParams: reqParams }));
    (0, react_1.useEffect)(function () {
        function waitFormUpdates(v) {
            return __awaiter(this, void 0, void 0, function () {
                var isMutating, data_1, error_1, online_1, loading_1, response_1, requestAbortController_1, code, completedAttempts_1;
                return __generator(this, function (_a) {
                    if (v.requestCallId !== requestCallId) {
                        isMutating = v.isMutating, data_1 = v.data, error_1 = v.error, online_1 = v.online, loading_1 = v.loading, response_1 = v.response, requestAbortController_1 = v.requestAbortController, code = v.code, completedAttempts_1 = v.completedAttempts;
                        if (typeof completedAttempts_1 !== "undefined") {
                            setCompletedAttempts(completedAttempts_1);
                        }
                        if (typeof code !== "undefined") {
                            setStatusCode(code);
                        }
                        if (typeof requestAbortController_1 !== "undefined") {
                            setRequestAbortController(requestAbortController_1);
                        }
                        if (typeof response_1 !== "undefined") {
                            setResponse(response_1);
                        }
                        if (typeof loading_1 !== "undefined") {
                            setLoading(loading_1);
                        }
                        if (typeof data_1 !== "undefined") {
                            setData(data_1);
                            cacheForMutation[idString] = data_1;
                            if (!isMutating) {
                                onResolve(data_1);
                            }
                            setError(null);
                        }
                        if (typeof error_1 !== "undefined") {
                            setError(error_1);
                            if (error_1 !== null && error_1 !== false) {
                                onError(error_1);
                            }
                        }
                        if (typeof online_1 !== "undefined") {
                            setOnline(online_1);
                        }
                    }
                    return [2 /*return*/];
                });
            });
        }
        requestEmitter.addListener(resolvedKey, waitFormUpdates);
        return function () {
            requestEmitter.removeListener(resolvedKey, waitFormUpdates);
        };
    }, [resolvedKey, id, requestAbortController, stringDeps]);
    var reValidate = React.useCallback(function reValidate(c) {
        if (c === void 0) { c = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (cancelOnChange) {
                    requestAbortController === null || requestAbortController === void 0 ? void 0 : requestAbortController.abort();
                }
                // Only revalidate if request was already completed
                if (c.body) {
                    setRequestBody(c.body);
                }
                else {
                    if (config === null || config === void 0 ? void 0 : config.body) {
                        setRequestBody(config.body);
                    }
                }
                if (c.headers) {
                    setRequestHeades(function (p) { return (__assign(__assign({}, p), c.headers)); });
                }
                else {
                    setRequestHeades(function (previousHeaders) { return (__assign(__assign({}, previousHeaders), config.headers)); });
                }
                if (!loading) {
                    if (!runningRequests[resolvedKey]) {
                        setLoading(true);
                        fetchData(c);
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            loading: true,
                        });
                    }
                }
                return [2 /*return*/];
            });
        });
    }, [stringDeps, cancelOnChange, requestAbortController, loading]);
    (0, react_1.useEffect)(function () {
        function forceRefresh(v) {
            return __awaiter(this, void 0, void 0, function () {
                var d;
                return __generator(this, function (_a) {
                    if (typeof (v === null || v === void 0 ? void 0 : v.data) !== "undefined") {
                        try {
                            d = v.data;
                            if (typeof data !== "undefined") {
                                setData(d);
                                cacheForMutation[idString] = d;
                                cache.set(resolvedKey, d);
                                valuesMemory[idString] = d;
                            }
                        }
                        catch (err) { }
                    }
                    else {
                        setLoading(true);
                        setError(null);
                        if (!runningRequests[resolvedKey]) {
                            // We are preventing revalidation where we only need updates about
                            // 'loading', 'error' and 'data' because the url can be ommited.
                            if (url !== "") {
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    loading: true,
                                    error: null,
                                });
                                fetchData();
                            }
                        }
                    }
                    return [2 /*return*/];
                });
            });
        }
        var idString = JSON.stringify(id);
        requestEmitter.addListener(idString, forceRefresh);
        return function () {
            requestEmitter.removeListener(idString, forceRefresh);
        };
    }, [resolvedKey, stringDeps, rawJSON, idString, id]);
    (0, react_1.useEffect)(function () {
        function backOnline() {
            var willCancel = false;
            function cancelReconectionAttempt() {
                willCancel = true;
            }
            requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                online: true,
            });
            setOnline(true);
            onOnline({ cancel: cancelReconectionAttempt });
            if (!willCancel) {
                reValidate();
            }
        }
        if (typeof window !== "undefined") {
            if ("addEventListener" in window) {
                if (retryOnReconnect) {
                    window.addEventListener("online", backOnline);
                    return function () {
                        window.removeEventListener("online", backOnline);
                    };
                }
            }
        }
    }, [onOnline, reValidate, resolvedKey, retryOnReconnect]);
    (0, react_1.useEffect)(function () {
        function wentOffline() {
            runningRequests[resolvedKey] = false;
            setOnline(false);
            requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                online: false,
            });
            onOffline();
        }
        if (typeof window !== "undefined") {
            if ("addEventListener" in window) {
                window.addEventListener("offline", wentOffline);
                return function () {
                    window.removeEventListener("offline", wentOffline);
                };
            }
        }
    }, [onOffline, reValidate, resolvedKey, retryOnReconnect]);
    (0, react_1.useEffect)(function () {
        setRequestHeades(function (r) { return (__assign(__assign({}, r), ctx.headers)); });
    }, [ctx.headers]);
    (0, react_1.useEffect)(function () {
        // Attempts will be made after a request fails
        var tm = setTimeout(function () {
            if (error) {
                if (completedAttempts < attempts) {
                    reValidate();
                    setCompletedAttempts(function (previousAttempts) {
                        var newAttemptsValue = previousAttempts + 1;
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            completedAttempts: newAttemptsValue,
                        });
                        return newAttemptsValue;
                    });
                }
                else if (completedAttempts === attempts) {
                    requestEmitter.emit(resolvedKey, {
                        requestCallId: requestCallId,
                        online: false,
                    });
                    setOnline(false);
                }
                clearTimeout(tm);
            }
        }, attemptInterval * 1000);
        return function () {
            clearInterval(tm);
        };
    }, [error, attempts, rawJSON, attemptInterval, completedAttempts]);
    (0, react_1.useEffect)(function () {
        // if (error === false) {
        if (completedAttempts === 0) {
            if (refresh > 0 && auto) {
                var interval_1 = setTimeout(reValidate, refresh * 1000);
                return function () { return clearTimeout(interval_1); };
            }
        }
        // }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, rawJSON, completedAttempts, config]);
    (0, react_1.useEffect)(function () {
        var tm = setTimeout(function () {
            if (queryReady) {
                if (auto) {
                    if (url !== "") {
                        setLoading(true);
                        if (!runningRequests[resolvedKey]) {
                            fetchData();
                        }
                    }
                }
                else {
                    if (typeof data === "undefined") {
                        setData(def);
                        cacheForMutation[idString] = def;
                    }
                    setError(null);
                    setLoading(false);
                }
            }
        }, 0);
        return function () {
            clearTimeout(tm);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        url,
        stringDeps,
        refresh,
        JSON.stringify(config),
        ctx.children,
        queryReady,
        auto,
    ]);
    (0, react_1.useEffect)(function () {
        if (revalidateOnFocus) {
            if (typeof window !== "undefined") {
                if ("addEventListener" in window) {
                    window.addEventListener("focus", reValidate);
                    return function () {
                        window.removeEventListener("focus", reValidate);
                    };
                }
            }
        }
    }, [
        url,
        revalidateOnFocus,
        stringDeps,
        loading,
        reValidate,
        ctx.children,
        refresh,
        JSON.stringify(config),
    ]);
    var __config = __assign(__assign({}, config), { params: reqParams, headers: requestHeaders, body: config.body, url: resKey, rawUrl: realUrl, query: reqQuery });
    function forceMutate(newValue) {
        if (typeof newValue !== "function") {
            cache.set(resolvedKey, newValue);
            valuesMemory[idString] = newValue;
            cacheForMutation[idString] = newValue;
            requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                isMutating: true,
                data: newValue,
            });
            setData(newValue);
        }
        else {
            setData(function (prev) {
                var newVal = newValue(prev);
                cache.set(resolvedKey, newVal);
                valuesMemory[idString] = newVal;
                cacheForMutation[idString] = newVal;
                requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    data: newVal,
                });
                return newVal;
            });
        }
    }
    var resolvedData = React.useMemo(function () { return data; }, [rawJSON]);
    return {
        data: resolvedData,
        loading: loading,
        error: error,
        online: online,
        code: statusCode,
        reFetch: reValidate,
        mutate: forceMutate,
        abort: function () {
            requestAbortController.abort();
            if (loading) {
                setError(false);
                setLoading(false);
                setData(requestCache);
                requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    error: false,
                    loading: false,
                    data: requestCache,
                });
            }
        },
        config: __config,
        response: response,
        id: id,
        /**
         * The request key
         */
        key: resolvedKey,
    };
};
exports.useFetcher = useFetcher;
// Create a method for each request
useFetcher.get = createRequestFn("GET", "", {});
useFetcher.delete = createRequestFn("DELETE", "", {});
useFetcher.head = createRequestFn("HEAD", "", {});
useFetcher.options = createRequestFn("OPTIONS", "", {});
useFetcher.post = createRequestFn("POST", "", {});
useFetcher.put = createRequestFn("PUT", "", {});
useFetcher.patch = createRequestFn("PATCH", "", {});
useFetcher.purge = createRequestFn("PURGE", "", {});
useFetcher.link = createRequestFn("LINK", "", {});
useFetcher.unlink = createRequestFn("UNLINK", "", {});
/**
 * Extend the useFetcher hook
 */
useFetcher.extend = function extendFetcher(props) {
    if (props === void 0) { props = {}; }
    var _a = props.baseUrl, baseUrl = _a === void 0 ? undefined : _a, _b = props.headers, headers = _b === void 0 ? {} : _b, _c = props.body, body = _c === void 0 ? {} : _c, _d = props.query, query = _d === void 0 ? {} : _d, 
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
        query: query,
    };
    // Creating methods for fetcher.extend
    useCustomFetcher.get = createRequestFn("GET", baseUrl, headers, query);
    useCustomFetcher.delete = createRequestFn("DELETE", baseUrl, headers, query);
    useCustomFetcher.head = createRequestFn("HEAD", baseUrl, headers, query);
    useCustomFetcher.options = createRequestFn("OPTIONS", baseUrl, headers, query);
    useCustomFetcher.post = createRequestFn("POST", baseUrl, headers, query);
    useCustomFetcher.put = createRequestFn("PUT", baseUrl, headers, query);
    useCustomFetcher.patch = createRequestFn("PATCH", baseUrl, headers, query);
    useCustomFetcher.purge = createRequestFn("PURGE", baseUrl, headers, query);
    useCustomFetcher.link = createRequestFn("LINK", baseUrl, headers, query);
    useCustomFetcher.unlink = createRequestFn("UNLINK", baseUrl, headers, query);
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
