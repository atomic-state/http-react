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
exports.createHttpClient = exports.isFormData = exports.fetcher = exports.useFetcher = exports.useImperative = exports.useUNLINK = exports.useLINK = exports.usePURGE = exports.usePATCH = exports.usePUT = exports.usePOST = exports.useOPTIONS = exports.useHEAD = exports.useDELETE = exports.useGET = exports.useText = exports.useBlob = exports.useFetchId = exports.useMutate = exports.useError = exports.useCode = exports.useData = exports.useConfig = exports.useLoading = exports.useFetch = exports.gql = exports.useFetcherText = exports.useFetcherBlob = exports.useResolve = exports.useFetcherId = exports.useFetcherMutate = exports.useFetcherError = exports.useFetcherLoading = exports.useFetcherCode = exports.useFetcherData = exports.useFetcherConfig = exports.mutateData = exports.revalidate = exports.FetcherConfig = exports.setURLParams = void 0;
var React = require("react");
var react_1 = require("react");
var events_1 = require("events");
/**
 *
 * @param str The target string
 * @param $params The params to parse in the url
 *
 * Params should be separated by `"/"`, (e.g. `"/api/[resource]/:id"`)
 *
 * URL search params will not be affected
 */
function setURLParams(str, $params) {
    if (str === void 0) { str = ''; }
    if ($params === void 0) { $params = {}; }
    var hasQuery = str.includes('?');
    var queryString = '?' +
        str
            .split('?')
            .filter(function (_, i) { return i > 0; })
            .join('?');
    return (str
        .split('/')
        .map(function ($segment) {
        var segment = $segment.split('?')[0];
        if (segment.startsWith('[') && segment.endsWith(']')) {
            var paramName = segment.replace(/\[|\]/g, '');
            if (!(paramName in $params)) {
                console.warn("Param '".concat(paramName, "' does not exist in params configuration for '").concat(str, "'"));
                return paramName;
            }
            return $params[segment.replace(/\[|\]/g, '')];
            // return $params[segment.replace(/\[|\]/g, '')] + hasQ ? '?' + hasQ : ''
        }
        else if (segment.startsWith(':')) {
            var paramName = segment.split('').slice(1).join('');
            if (!(paramName in $params)) {
                console.warn("Param '".concat(paramName, "' does not exist in params configuration for '").concat(str, "'"));
                return paramName;
            }
            return $params[paramName];
        }
        else {
            return segment;
        }
    })
        .join('/') + (hasQuery ? queryString : ''));
}
exports.setURLParams = setURLParams;
/**
 * Creates a new request function. This is for usage with fetcher and fetcher.extend
 */
function createRequestFn(method, baseUrl, $headers, q) {
    return function (url, init) {
        if (init === void 0) { init = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var def, _a, resolver, _b, c, _c, onResolve, _d, onError, _e, params, query, rawUrl, _f, _g, qp, reqQueryString, _h, headers, body, formatBody, reqConfig, r, req, data, err_1;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        def = init.default, _a = init.resolver, resolver = _a === void 0 ? function (e) { return e.json(); } : _a, _b = init.config, c = _b === void 0 ? {} : _b, _c = init.onResolve, onResolve = _c === void 0 ? function () { } : _c, _d = init.onError, onError = _d === void 0 ? function () { } : _d;
                        _e = (c || {}).params, params = _e === void 0 ? {} : _e;
                        query = __assign(__assign({}, q), c.query);
                        rawUrl = setURLParams(url, params);
                        _f = rawUrl.split('?'), _g = _f[1], qp = _g === void 0 ? '' : _g;
                        qp.split('&').forEach(function (q) {
                            var _a;
                            var _b = q.split('='), key = _b[0], value = _b[1];
                            if (query[key] !== value) {
                                query = __assign(__assign({}, query), (_a = {}, _a[key] = value, _a));
                            }
                        });
                        reqQueryString = Object.keys(query)
                            .map(function (q) { return [q, query[q]].join('='); })
                            .join('&');
                        _h = c.headers, headers = _h === void 0 ? {} : _h, body = c.body, formatBody = c.formatBody;
                        reqConfig = {
                            method: method,
                            headers: __assign(__assign({ 'Content-Type': 'application/json' }, $headers), headers),
                            body: (method === null || method === void 0 ? void 0 : method.match(/(POST|PUT|DELETE|PATCH)/))
                                ? isFunction(formatBody)
                                    ? formatBody(body)
                                    : formatBody === false || (0, exports.isFormData)(body)
                                        ? body
                                        : JSON.stringify(body)
                                : undefined
                        };
                        r = undefined;
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(baseUrl || '').concat(rawUrl).concat(url.includes('?') ? "&".concat(reqQueryString) : "?".concat(reqQueryString)), reqConfig)];
                    case 2:
                        req = _j.sent();
                        r = req;
                        return [4 /*yield*/, resolver(req)];
                    case 3:
                        data = _j.sent();
                        if ((req === null || req === void 0 ? void 0 : req.status) >= 400) {
                            onError(true);
                            return [2 /*return*/, {
                                    res: req,
                                    data: def,
                                    error: true,
                                    code: req === null || req === void 0 ? void 0 : req.status,
                                    config: __assign(__assign({ url: "".concat(baseUrl || '').concat(rawUrl) }, reqConfig), { query: query })
                                }];
                        }
                        else {
                            onResolve(data, req);
                            return [2 /*return*/, {
                                    res: req,
                                    data: data,
                                    error: false,
                                    code: req === null || req === void 0 ? void 0 : req.status,
                                    config: __assign(__assign({ url: "".concat(baseUrl || '').concat(rawUrl) }, reqConfig), { query: query })
                                }];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _j.sent();
                        onError(err_1);
                        return [2 /*return*/, {
                                res: r,
                                data: def,
                                error: true,
                                code: r === null || r === void 0 ? void 0 : r.status,
                                config: __assign(__assign({ url: "".concat(baseUrl || '').concat(rawUrl) }, reqConfig), { query: query })
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
}
var runningRequests = {};
var previousConfig = {};
var previousProps = {};
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
    retryOnReconnect: true
});
var resolvedRequests = {};
var resolvedHookCalls = {};
var abortControllers = {};
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
    }
};
var valuesMemory = {};
function FetcherConfig(props) {
    var _a, _b, _c, _d, _e;
    var children = props.children, _f = props.defaults, defaults = _f === void 0 ? {} : _f, baseUrl = props.baseUrl;
    var previousConfig = useHRFContext();
    var _g = previousConfig.cache, cache = _g === void 0 ? defaultCache : _g;
    var base = !isDefined(baseUrl)
        ? !isDefined(previousConfig.baseUrl)
            ? ''
            : previousConfig.baseUrl
        : baseUrl;
    for (var defaultKey in defaults) {
        var id = defaults[defaultKey].id;
        var resolvedKey = JSON.stringify(isDefined(id)
            ? {
                idString: JSON.stringify(id)
            }
            : {
                uri: "".concat(base).concat(defaultKey),
                config: {
                    method: (_b = (_a = defaults[defaultKey]) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.method
                }
            });
        if (isDefined(id)) {
            if (!isDefined(valuesMemory[resolvedKey])) {
                valuesMemory[resolvedKey] = (_c = defaults[defaultKey]) === null || _c === void 0 ? void 0 : _c.value;
            }
            if (!isDefined(fetcherDefaults[resolvedKey])) {
                fetcherDefaults[resolvedKey] = (_d = defaults[defaultKey]) === null || _d === void 0 ? void 0 : _d.value;
            }
        }
        if (!isDefined(cache.get(resolvedKey))) {
            cache.set(resolvedKey, (_e = defaults[defaultKey]) === null || _e === void 0 ? void 0 : _e.value);
        }
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
            if (isDefined(reqId)) {
                var key = JSON.stringify(reqId);
                var resolveKey = JSON.stringify({ idString: key });
                previousConfig[resolveKey] = undefined;
                requestEmitter.emit(key);
            }
        });
    }
    else {
        if (isDefined(id)) {
            var key = JSON.stringify(id);
            var resolveKey = JSON.stringify({ idString: key });
            previousConfig[resolveKey] = undefined;
            requestEmitter.emit(key);
        }
    }
}
exports.revalidate = revalidate;
var fetcherDefaults = {};
var cacheForMutation = {};
function queue(callback, time) {
    if (time === void 0) { time = 0; }
    // let tm = null
    var tm = setTimeout(function () {
        callback();
        clearTimeout(tm);
    }, time);
    return tm;
}
/**
 * Force mutation in requests from anywhere. This doesn't revalidate requests
 */
function mutateData() {
    var pairs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        pairs[_i] = arguments[_i];
    }
    var _loop_1 = function (pair) {
        try {
            var k = pair[0], v_1 = pair[1], _revalidate = pair[2];
            var key_1 = JSON.stringify({ idString: JSON.stringify(k) });
            var requestCallId = '';
            if (isFunction(v_1)) {
                var newVal_1 = v_1(cacheForMutation[key_1]);
                requestEmitter.emit(key_1, {
                    data: newVal_1,
                    isMutating: true,
                    requestCallId: requestCallId
                });
                if (_revalidate) {
                    previousConfig[key_1] = undefined;
                    requestEmitter.emit(JSON.stringify(k));
                }
                queue(function () {
                    cacheForMutation[key_1] = newVal_1;
                });
            }
            else {
                requestEmitter.emit(key_1, {
                    requestCallId: requestCallId,
                    isMutating: true,
                    data: v_1
                });
                if (_revalidate) {
                    previousConfig[key_1] = undefined;
                    requestEmitter.emit(JSON.stringify(k));
                }
                queue(function () {
                    cacheForMutation[key_1] = v_1;
                });
            }
        }
        catch (err) { }
    };
    for (var _a = 0, pairs_1 = pairs; _a < pairs_1.length; _a++) {
        var pair = pairs_1[_a];
        _loop_1(pair);
    }
}
exports.mutateData = mutateData;
/**
 * Get the current fetcher config
 */
function useFetcherConfig(id) {
    var ftxcf = useHRFContext();
    var config = useFetcherId(id).config;
    var allowedKeys = [
        'headers',
        'baseUrl',
        'body',
        'defaults',
        'resolver',
        'auto',
        'memory',
        'refresh',
        'attempts',
        'attemptInterval',
        'revalidateOnFocus',
        'query',
        'params',
        'onOnline',
        'onOffline',
        'online',
        'retryOnReconnect',
        'cache'
    ];
    // Remove the 'method' strings
    for (var k in ftxcf) {
        if (allowedKeys.indexOf(k) === -1) {
            delete ftxcf[k];
        }
    }
    return isDefined(id) ? config : ftxcf;
}
exports.useFetcherConfig = useFetcherConfig;
exports.useConfig = useFetcherConfig;
/**
 * Get the data state of a request using its id
 */
function useFetcherData(id, onResolve) {
    var _a = useHRFContext().cache, cache = _a === void 0 ? defaultCache : _a;
    var defaultsKey = JSON.stringify({
        idString: JSON.stringify(id)
    });
    var def = cache.get(defaultsKey);
    var data = useFetcher({
        default: def,
        onResolve: onResolve,
        id: id
    }).data;
    return data;
}
exports.useFetcherData = useFetcherData;
exports.useData = useFetcherData;
function useFetcherCode(id) {
    var code = useFetcher({
        id: id
    }).code;
    return code;
}
exports.useFetcherCode = useFetcherCode;
exports.useCode = useFetcherCode;
/**
 * Get the loading state of a request using its id
 */
function useFetcherLoading(id) {
    var idString = JSON.stringify({ idString: JSON.stringify(id) });
    var data = useFetcher({
        id: id
    }).data;
    return !isDefined(runningRequests[idString])
        ? true
        : runningRequests[idString];
}
exports.useFetcherLoading = useFetcherLoading;
exports.useLoading = useFetcherLoading;
/**
 * Get the error state of a request using its id
 */
function useFetcherError(id, onError) {
    var error = useFetcher({
        id: id,
        onError: onError
    }).error;
    return error;
}
exports.useFetcherError = useFetcherError;
exports.useError = useFetcherError;
/**
 * Get the mutate the request data using its id
 */
function useFetcherMutate(
/**
 * The id of the `useFetch` call
 */
id, 
/**
 * The function to run after mutating
 */
onMutate) {
    var mutate = useFetcher({
        id: id,
        onMutate: onMutate
    }).mutate;
    return mutate;
}
exports.useFetcherMutate = useFetcherMutate;
exports.useMutate = useFetcherMutate;
/**
 * Get everything from a `useFetcher` call using its id
 */
function useFetcherId(id) {
    var defaultsKey = JSON.stringify({
        idString: JSON.stringify(id)
    });
    var def = fetcherDefaults[defaultsKey];
    return useFetcher({
        id: id,
        default: def
    });
}
exports.useFetcherId = useFetcherId;
exports.useFetchId = useFetcherId;
/**
 * Create an effect for when the request completes
 */
function useResolve(id, onResolve) {
    var defaultsKey = JSON.stringify({
        idString: JSON.stringify(id)
    });
    var def = fetcherDefaults[defaultsKey];
    useFetcher({
        id: id,
        onResolve: onResolve,
        default: def
    });
}
exports.useResolve = useResolve;
/**
 * User a `GET` request
 */
function useGET(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'GET' }) }));
}
exports.useGET = useGET;
/**
 * Use a `DELETE` request
 */
function useDELETE(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'DELETE' }) }));
}
exports.useDELETE = useDELETE;
/**
 * Use a `HEAD` request
 */
function useHEAD(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'HEAD' }) }));
}
exports.useHEAD = useHEAD;
/**
 * Use an `OPTIONS` request
 */
function useOPTIONS(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'OPTIONS' }) }));
}
exports.useOPTIONS = useOPTIONS;
/**
 * Use a `POST` request
 */
function usePOST(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'POST' }) }));
}
exports.usePOST = usePOST;
/**
 * Use a `PUT` request
 */
function usePUT(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'PUT' }) }));
}
exports.usePUT = usePUT;
/**
 * Use a `PATCH` request
 */
function usePATCH(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'PATCH' }) }));
}
exports.usePATCH = usePATCH;
/**
 * Use a `PURGE` request
 */
function usePURGE(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'PURGE' }) }));
}
exports.usePURGE = usePURGE;
/**
 * Use a `LINK` request
 */
function useLINK(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'LINK' }) }));
}
exports.useLINK = useLINK;
/**
 * Use an `UNLINK` request
 */
function useUNLINK(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'UNLINK' }) }));
}
exports.useUNLINK = useUNLINK;
/**
 * Get a blob of the response. You can pass an `objectURL` property that will convet that blob into a string using `URL.createObjectURL`
 */
function useFetcherBlob(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { resolver: function (res) {
            return __awaiter(this, void 0, void 0, function () {
                var blob;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, res.blob()];
                        case 1:
                            blob = _a.sent();
                            if (typeof URL !== 'undefined') {
                                if (init.objectURL) {
                                    return [2 /*return*/, URL.createObjectURL(blob)];
                                }
                                else {
                                    if (options === null || options === void 0 ? void 0 : options.objectURL) {
                                        return [2 /*return*/, URL.createObjectURL(blob)];
                                    }
                                }
                            }
                            return [2 /*return*/, blob];
                    }
                });
            });
        } }));
}
exports.useFetcherBlob = useFetcherBlob;
exports.useBlob = useFetcherBlob;
/**
 * Get a text of the response
 */
function useFetcherText(init, options) {
    return useFetcher(init, __assign(__assign({}, options), { resolver: function (res) {
            return __awaiter(this, void 0, void 0, function () {
                var text;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, res.text()];
                        case 1:
                            text = _a.sent();
                            return [2 /*return*/, text];
                    }
                });
            });
        } }));
}
exports.useFetcherText = useFetcherText;
exports.useText = useFetcherText;
/**
 * Make a graphQL request
 */
function useGql() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (_a) {
        if (_a === void 0) { _a = { variables: {}, graphqlPath: '/graphql' }; }
        var variables = _a.variables, _b = _a.graphqlPath, graphqlPath = _b === void 0 ? '/graphql' : _b, otherArgs = __rest(_a, ["variables", "graphqlPath"]);
        var query = args[0][0];
        var config = otherArgs.config;
        return usePOST(__assign(__assign({ url: graphqlPath, id: query, resolver: function (gqlResponse) {
                return __awaiter(this, void 0, void 0, function () {
                    var gqlr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, gqlResponse.json()];
                            case 1:
                                gqlr = _a.sent();
                                return [2 /*return*/, gqlr.data];
                        }
                    });
                });
            } }, otherArgs), { config: __assign(__assign({}, config), { formatBody: function () {
                    return JSON.stringify({
                        query: query,
                        variables: variables
                    });
                } }) }));
    };
}
exports.gql = useGql;
var createImperativeFetcher = function (ctx) {
    var keys = [
        'GET',
        'DELETE',
        'HEAD',
        'OPTIONS',
        'POST',
        'PUT',
        'PATCH',
        'PURGE',
        'LINK',
        'UNLINK'
    ];
    var baseUrl = ctx.baseUrl;
    return Object.fromEntries(new Map(keys.map(function (k) { return [
        k.toLowerCase(),
        function (url, _a) {
            if (_a === void 0) { _a = {}; }
            var _b = _a.config, config = _b === void 0 ? {} : _b, other = __rest(_a, ["config"]);
            return exports.fetcher[k.toLowerCase()](hasBaseUrl(url) ? url : baseUrl + url, __assign({ config: {
                    headers: __assign(__assign({}, ctx.headers), config.headers),
                    body: config.body,
                    query: __assign(__assign({}, ctx.query), config.query),
                    params: __assign(__assign({}, ctx.params), config.params),
                    formatBody: config.formatBody
                } }, other));
        }
    ]; })));
};
/**
 * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
 */
function useImperative() {
    var ctx = useFetcherConfig();
    var imperativeFetcher = React.useMemo(function () { return createImperativeFetcher(ctx); }, [JSON.stringify(ctx)]);
    return imperativeFetcher;
}
exports.useImperative = useImperative;
function isDefined(target) {
    return typeof target !== 'undefined';
}
function isFunction(target) {
    return typeof target === 'function';
}
function hasBaseUrl(target) {
    return target.startsWith('http://') || target.startsWith('https://');
}
function useHRFContext() {
    return (0, react_1.useContext)(FetcherContext);
}
var windowExists = typeof window !== 'undefined';
/**
 * Fetcher hook
 */
var useFetcher = function (init, options) {
    var ctx = useHRFContext();
    var _a = ctx.cache, cache = _a === void 0 ? defaultCache : _a;
    var optionsConfig = typeof init === 'string'
        ? __assign({ 
            // Pass init as the url if init is a string
            url: init }, options) : init;
    var _b = optionsConfig.onOnline, onOnline = _b === void 0 ? ctx.onOnline : _b, _c = optionsConfig.onOffline, onOffline = _c === void 0 ? ctx.onOffline : _c, onMutate = optionsConfig.onMutate, onPropsChange = optionsConfig.onPropsChange, _d = optionsConfig.url, url = _d === void 0 ? '' : _d, id = optionsConfig.id, _e = optionsConfig.config, config = _e === void 0 ? {
        query: {},
        params: {},
        baseUrl: undefined,
        method: 'GET',
        headers: {},
        body: undefined,
        formatBody: false
    } : _e, _f = optionsConfig.resolver, resolver = _f === void 0 ? isFunction(ctx.resolver) ? ctx.resolver : function (d) { return d.json(); } : _f, onError = optionsConfig.onError, _g = optionsConfig.auto, auto = _g === void 0 ? isDefined(ctx.auto) ? ctx.auto : true : _g, _h = optionsConfig.memory, memory = _h === void 0 ? isDefined(ctx.memory) ? ctx.memory : true : _h, onResolve = optionsConfig.onResolve, onAbort = optionsConfig.onAbort, _j = optionsConfig.refresh, refresh = _j === void 0 ? isDefined(ctx.refresh) ? ctx.refresh : 0 : _j, _k = optionsConfig.cancelOnChange, cancelOnChange = _k === void 0 ? false : _k, _l = optionsConfig.attempts, attempts = _l === void 0 ? ctx.attempts : _l, _m = optionsConfig.attemptInterval, attemptInterval = _m === void 0 ? ctx.attemptInterval : _m, _o = optionsConfig.revalidateOnFocus, revalidateOnFocus = _o === void 0 ? ctx.revalidateOnFocus : _o;
    var requestCallId = React.useMemo(function () { return "".concat(Math.random()).split('.')[1]; }, []);
    var willResolve = isDefined(onResolve);
    var handleError = isDefined(onError);
    var handlePropsChange = isDefined(onPropsChange);
    var handleOnAbort = isDefined(onAbort);
    var handleMutate = isDefined(onMutate);
    var handleOnline = isDefined(onOnline);
    var handleOffline = isDefined(onOffline);
    var retryOnReconnect = optionsConfig.auto === false
        ? false
        : isDefined(optionsConfig.retryOnReconnect)
            ? optionsConfig.retryOnReconnect
            : ctx.retryOnReconnect;
    var idString = JSON.stringify(id);
    var _p = (0, react_1.useState)(__assign(__assign({}, ctx.query), config.query)), reqQuery = _p[0], setReqQuery = _p[1];
    var _q = (0, react_1.useState)({
        realUrl: '',
        rawUrl: ''
    }), configUrl = _q[0], setConfigUrl = _q[1];
    var _r = (0, react_1.useState)(__assign(__assign({}, ctx.params), config.params)), reqParams = _r[0], setReqParams = _r[1];
    var rawUrl = (hasBaseUrl(url)
        ? ''
        : !isDefined(config.baseUrl)
            ? !isDefined(ctx.baseUrl)
                ? ''
                : ctx.baseUrl
            : config.baseUrl) + url;
    var urlWithParams = React.useMemo(function () { return setURLParams(rawUrl, reqParams); }, [JSON.stringify(reqParams), config.baseUrl, ctx.baseUrl, url]);
    var resolvedKey = JSON.stringify(isDefined(id)
        ? {
            idString: idString
        }
        : {
            uri: rawUrl,
            config: {
                method: config === null || config === void 0 ? void 0 : config.method
            }
        });
    var realUrl = urlWithParams + (urlWithParams.includes('?') ? "" : '?');
    if (!isDefined(previousProps[resolvedKey])) {
        if (url !== '') {
            previousProps[resolvedKey] = optionsConfig;
        }
    }
    (0, react_1.useEffect)(function () {
        if (url !== '') {
            setReqParams(function () {
                var newParams = __assign(__assign({}, ctx.params), config.params);
                return newParams;
            });
        }
    }, [JSON.stringify(__assign(__assign({}, ctx.params), config.params)), resolvedKey]);
    var stringDeps = JSON.stringify(
    // We ignore children and resolver
    Object.assign(ctx, { children: undefined }, config === null || config === void 0 ? void 0 : config.headers, config === null || config === void 0 ? void 0 : config.method, config === null || config === void 0 ? void 0 : config.body, config === null || config === void 0 ? void 0 : config.query, config === null || config === void 0 ? void 0 : config.params, { resolver: undefined }, { reqQuery: reqQuery }, { reqParams: reqParams }));
    var _s = realUrl.split('?'), resKey = _s[0], qp = _s[1];
    // This helps pass default values to other useFetcher calls using the same id
    (0, react_1.useEffect)(function () {
        if (isDefined(optionsConfig.default)) {
            if (!isDefined(fetcherDefaults[resolvedKey])) {
                if (url !== '') {
                    if (!isDefined(cache.get(resolvedKey))) {
                        fetcherDefaults[resolvedKey] = optionsConfig.default;
                    }
                }
                else {
                    if (!isDefined(cache.get(resolvedKey))) {
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            data: optionsConfig.default
                        });
                    }
                }
            }
        }
        else {
            if (isDefined(fetcherDefaults[resolvedKey])) {
                if (!isDefined(cache.get(resolvedKey))) {
                    setData(fetcherDefaults[resolvedKey]);
                }
            }
        }
    }, [resolvedKey]);
    var def = resolvedKey in fetcherDefaults
        ? fetcherDefaults[resolvedKey]
        : optionsConfig.default;
    (0, react_1.useEffect)(function () {
        if (!auto) {
            runningRequests[resolvedKey] = false;
        }
    }, []);
    (0, react_1.useEffect)(function () {
        var queryParamsFromString = {};
        try {
            // getting query params from passed url
            var queryParts = qp.split('&');
            queryParts.forEach(function (q, i) {
                var _a = q.split('='), key = _a[0], value = _a[1];
                if (queryParamsFromString[key] !== value) {
                    queryParamsFromString[key] = "".concat(value);
                }
            });
        }
        finally {
            if (url !== '') {
                setReqQuery(function () {
                    var newQuery = __assign(__assign(__assign({}, ctx.query), queryParamsFromString), config.query);
                    return newQuery;
                });
            }
        }
    }, [
        resolvedKey,
        requestCallId,
        JSON.stringify(__assign(__assign({ qp: qp }, ctx.query), config.query))
    ]);
    var requestCache = cache.get(resolvedKey);
    var initialDataValue = isDefined(valuesMemory[resolvedKey])
        ? valuesMemory[resolvedKey]
        : isDefined(cache.get(resolvedKey))
            ? cache.get(resolvedKey)
            : def;
    var _t = (0, react_1.useState)(memory ? initialDataValue : def), data = _t[0], setData = _t[1];
    // Used JSON as deppendency instead of directly using a reference to data
    var rawJSON = JSON.stringify(data);
    var _u = (0, react_1.useState)(true), online = _u[0], setOnline = _u[1];
    var _v = (0, react_1.useState)(__assign(__assign({}, ctx.headers), config.headers)), requestHeaders = _v[0], setRequestHeades = _v[1];
    var _w = (0, react_1.useState)(), response = _w[0], setResponse = _w[1];
    var _x = (0, react_1.useState)(), statusCode = _x[0], setStatusCode = _x[1];
    var _y = (0, react_1.useState)(null), error = _y[0], setError = _y[1];
    var _z = (0, react_1.useState)(true), loading = _z[0], setLoading = _z[1];
    var _0 = (0, react_1.useState)(0), completedAttempts = _0[0], setCompletedAttempts = _0[1];
    var _1 = (0, react_1.useState)(new AbortController()), requestAbortController = _1[0], setRequestAbortController = _1[1];
    var _2 = (0, react_1.useState)(config.method), reqMethod = _2[0], setReqMethod = _2[1];
    (0, react_1.useEffect)(function () {
        if (url !== '') {
            setReqMethod(config.method);
            requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                method: config.method
            });
        }
    }, [stringDeps, response, requestAbortController, requestCallId]);
    (0, react_1.useEffect)(function () {
        if (url !== '') {
            if (error) {
                requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    error: error
                });
            }
        }
    }, [url, error, resolvedKey, requestCallId]);
    var fetchData = React.useCallback(function fetchData(c) {
        var _a;
        if (c === void 0) { c = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var rawUrl, urlWithParams, realUrl, resKey, newAbortController, json, code, _data_1, err_2, errorString, _error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestEmitter.emit(resolvedKey, {
                            config: c
                        });
                        rawUrl = (hasBaseUrl(url)
                            ? ''
                            : !isDefined(config.baseUrl)
                                ? !isDefined(ctx.baseUrl)
                                    ? ''
                                    : ctx.baseUrl
                                : config.baseUrl) + url;
                        urlWithParams = setURLParams(rawUrl, c.params);
                        realUrl = urlWithParams +
                            (urlWithParams.includes('?') ? ((c === null || c === void 0 ? void 0 : c.query) !== '' ? "&" : '') : '?');
                        resKey = realUrl.split('?')[0];
                        if (!(previousConfig[resolvedKey] !== JSON.stringify(optionsConfig))) return [3 /*break*/, 6];
                        queue(function () {
                            setReqMethod(config.method);
                            if (url !== '') {
                                setConfigUrl({
                                    rawUrl: rawUrl,
                                    realUrl: realUrl
                                });
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    realUrl: resKey,
                                    rawUrl: rawUrl
                                });
                            }
                        });
                        if (!!runningRequests[resolvedKey]) return [3 /*break*/, 6];
                        runningRequests[resolvedKey] = true;
                        setLoading(true);
                        previousConfig[resolvedKey] = JSON.stringify(optionsConfig);
                        newAbortController = new AbortController();
                        setRequestAbortController(newAbortController);
                        setError(null);
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            loading: loading,
                            requestAbortController: newAbortController,
                            error: null
                        });
                        abortControllers[resolvedKey] = newAbortController;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch(realUrl + c.query, {
                                signal: newAbortController.signal,
                                method: config.method,
                                headers: __assign(__assign(__assign({ 'Content-Type': 
                                    // If body is form-data, set Content-Type header to 'multipart/form-data'
                                    (0, exports.isFormData)(config.body)
                                        ? 'multipart/form-data'
                                        : 'application/json' }, ctx.headers), config.headers), c.headers),
                                body: ((_a = config.method) === null || _a === void 0 ? void 0 : _a.match(/(POST|PUT|DELETE|PATCH)/))
                                    ? isFunction(config.formatBody)
                                        ? config.formatBody(((0, exports.isFormData)(config.body)
                                            ? config.body
                                            : __assign(__assign({}, config.body), c.body)))
                                        : config.formatBody === false || (0, exports.isFormData)(config.body)
                                            ? config.body
                                            : JSON.stringify(__assign(__assign({}, config.body), c.body))
                                    : undefined
                            })];
                    case 2:
                        json = _b.sent();
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            response: json
                        });
                        code = json.status;
                        setStatusCode(code);
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            code: code
                        });
                        return [4 /*yield*/, resolver(json)];
                    case 3:
                        _data_1 = _b.sent();
                        if (code >= 200 && code < 400) {
                            if (memory) {
                                cache.set(resolvedKey, _data_1);
                                valuesMemory[resolvedKey] = _data_1;
                            }
                            requestEmitter.emit(resolvedKey, {
                                requestCallId: requestCallId,
                                data: _data_1,
                                isResolved: true,
                                loading: false,
                                error: null,
                                completedAttempts: 0
                            });
                            setData(_data_1);
                            cacheForMutation[idString] = _data_1;
                            setError(null);
                            setLoading(false);
                            if (willResolve) {
                                ;
                                onResolve(_data_1, json);
                            }
                            runningRequests[resolvedKey] = false;
                            // If a request completes succesfuly, we reset the error attempts to 0
                            setCompletedAttempts(0);
                            queue(function () {
                                cacheForMutation[resolvedKey] = _data_1;
                            });
                        }
                        else {
                            if (def) {
                                setData(def);
                                cacheForMutation[idString] = def;
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: def
                                });
                            }
                            setError(true);
                            if (handleError) {
                                ;
                                onError(_data_1, json);
                            }
                            runningRequests[resolvedKey] = false;
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_2 = _b.sent();
                        errorString = err_2 === null || err_2 === void 0 ? void 0 : err_2.toString();
                        // Only set error if no abort
                        if (!"".concat(errorString).match(/abort/i)) {
                            _error = new Error(err_2);
                            requestEmitter.emit(resolvedKey, {
                                requestCallId: requestCallId,
                                error: _error
                            });
                            if (!isDefined(cache.get(resolvedKey))) {
                                setData(def);
                                cacheForMutation[idString] = def;
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: def
                                });
                            }
                            else {
                                setData(requestCache);
                                cacheForMutation[idString] = requestCache;
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: requestCache
                                });
                            }
                            setError(_error);
                            if (handleError) {
                                ;
                                onError(err_2);
                            }
                        }
                        else {
                            if (!isDefined(cache.get(resolvedKey))) {
                                if (isDefined(def)) {
                                    setData(def);
                                    cacheForMutation[idString] = def;
                                }
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: def
                                });
                            }
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        runningRequests[resolvedKey] = false;
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            loading: false
                        });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, [
        auto,
        ctx.auto,
        stringDeps,
        resolvedKey,
        config.method,
        JSON.stringify(optionsConfig),
        realUrl,
        requestCallId,
        memory,
        def
    ]);
    (0, react_1.useEffect)(function () {
        var signal = (requestAbortController || {}).signal;
        // Run onAbort callback
        var abortCallback = function () {
            if (loading) {
                if (runningRequests[resolvedKey]) {
                    if (handleOnAbort) {
                        ;
                        onAbort();
                    }
                }
            }
        };
        signal === null || signal === void 0 ? void 0 : signal.addEventListener('abort', abortCallback);
        return function () {
            signal === null || signal === void 0 ? void 0 : signal.removeEventListener('abort', abortCallback);
        };
    }, [requestAbortController, resolvedKey, onAbort, loading]);
    var imperativeFetcher = React.useMemo(function () {
        var __headers = __assign(__assign({}, ctx.headers), config.headers);
        var __params = __assign(__assign({}, ctx.params), config.params);
        var __baseUrl = isDefined(config.baseUrl) ? config.baseUrl : ctx.baseUrl;
        return createImperativeFetcher(__assign(__assign({}, ctx), { headers: __headers, baseUrl: __baseUrl, params: __params }));
    }, [JSON.stringify(ctx)]);
    if (willResolve) {
        if (resolvedHookCalls[resolvedKey]) {
            if (isDefined(cache.get(resolvedKey))) {
                ;
                onResolve(cache.get(resolvedKey), response);
                queue(function () {
                    delete resolvedHookCalls[resolvedKey];
                });
            }
        }
    }
    (0, react_1.useEffect)(function () {
        function waitFormUpdates(v) {
            return __awaiter(this, void 0, void 0, function () {
                var isMutating_1, $data_1, $error_1, isResolved, online_1, loading_1, response_1, requestAbortController_1, code_1, config_1, rawUrl_1, realUrl_1, method_1, completedAttempts_1;
                return __generator(this, function (_a) {
                    if (v.requestCallId !== requestCallId) {
                        isMutating_1 = v.isMutating, $data_1 = v.data, $error_1 = v.error, isResolved = v.isResolved, online_1 = v.online, loading_1 = v.loading, response_1 = v.response, requestAbortController_1 = v.requestAbortController, code_1 = v.code, config_1 = v.config, rawUrl_1 = v.rawUrl, realUrl_1 = v.realUrl, method_1 = v.method, completedAttempts_1 = v.completedAttempts;
                        if (isDefined(isResolved)) {
                            resolvedHookCalls[resolvedKey] = true;
                        }
                        if (isDefined(method_1)) {
                            queue(function () {
                                setReqMethod(method_1);
                            });
                        }
                        if (isDefined(config_1 === null || config_1 === void 0 ? void 0 : config_1.query)) {
                            queue(function () {
                                setReqQuery(config_1.query);
                            });
                        }
                        if (isDefined(rawUrl_1) && isDefined(realUrl_1)) {
                            queue(function () {
                                setConfigUrl({
                                    rawUrl: rawUrl_1,
                                    realUrl: realUrl_1
                                });
                            });
                        }
                        if (isDefined(config_1 === null || config_1 === void 0 ? void 0 : config_1.params)) {
                            queue(function () {
                                setReqParams(config_1 === null || config_1 === void 0 ? void 0 : config_1.params);
                            });
                        }
                        if (isDefined(config_1 === null || config_1 === void 0 ? void 0 : config_1.headers)) {
                            queue(function () {
                                setRequestHeades(config_1 === null || config_1 === void 0 ? void 0 : config_1.headers);
                            });
                        }
                        if (isDefined(completedAttempts_1)) {
                            queue(function () {
                                setCompletedAttempts(completedAttempts_1);
                            });
                        }
                        if (isDefined(code_1)) {
                            queue(function () {
                                setStatusCode(code_1);
                            });
                        }
                        if (isDefined(requestAbortController_1)) {
                            queue(function () {
                                setRequestAbortController(requestAbortController_1);
                            });
                        }
                        if (isDefined(response_1)) {
                            queue(function () {
                                setResponse(response_1);
                            });
                        }
                        if (isDefined(loading_1)) {
                            queue(function () {
                                setLoading(loading_1);
                            });
                        }
                        if (isDefined($data_1)) {
                            queue(function () {
                                if (JSON.stringify(data) !== JSON.stringify(cache.get(resolvedKey))) {
                                    setData($data_1);
                                }
                                if (JSON.stringify($data_1) !==
                                    JSON.stringify(cacheForMutation[resolvedKey])) {
                                    cacheForMutation[idString] = data;
                                    if (isMutating_1) {
                                        if (handleMutate) {
                                            ;
                                            onMutate($data_1, imperativeFetcher);
                                        }
                                    }
                                }
                            });
                        }
                        if (isDefined($error_1)) {
                            queue(function () {
                                setError($error_1);
                                if ($error_1 !== null) {
                                    if (handleError) {
                                        ;
                                        onError($error_1);
                                    }
                                }
                            });
                        }
                        if (isDefined(online_1)) {
                            queue(function () {
                                setOnline(online_1);
                            });
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
    }, [
        resolvedKey,
        data,
        imperativeFetcher,
        reqMethod,
        id,
        error,
        requestCallId,
        stringDeps,
        onResolve
    ]);
    var reValidate = React.useCallback(function reValidate() {
        return __awaiter(this, void 0, void 0, function () {
            var reqQ_1, reqP;
            return __generator(this, function (_a) {
                // Only revalidate if request was already completed
                if (!loading) {
                    if (!runningRequests[resolvedKey]) {
                        previousConfig[resolvedKey] = undefined;
                        setLoading(true);
                        reqQ_1 = __assign(__assign({}, ctx.query), config.query);
                        reqP = __assign(__assign({}, ctx.params), config.params);
                        if (url !== '') {
                            fetchData({
                                query: Object.keys(reqQ_1)
                                    .map(function (q) { return [q, reqQ_1[q]].join('='); })
                                    .join('&'),
                                params: reqP
                            });
                        }
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            loading: true
                        });
                    }
                }
                return [2 /*return*/];
            });
        });
    }, [
        requestCallId,
        stringDeps,
        cancelOnChange,
        url,
        requestAbortController,
        loading,
        auto,
        ctx.auto
    ]);
    (0, react_1.useEffect)(function () {
        function forceRefresh(v) {
            return __awaiter(this, void 0, void 0, function () {
                var d, reqQ_2, reqP;
                return __generator(this, function (_a) {
                    if (isDefined(v === null || v === void 0 ? void 0 : v.data)) {
                        try {
                            d = v.data;
                            if (isDefined(data)) {
                                setData(d);
                                cacheForMutation[idString] = d;
                                cache.set(resolvedKey, d);
                                valuesMemory[resolvedKey] = d;
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
                            if (url !== '') {
                                requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    loading: true,
                                    error: null
                                });
                                reqQ_2 = __assign(__assign({}, ctx.query), config.query);
                                reqP = __assign(__assign({}, ctx.params), config.params);
                                fetchData({
                                    query: Object.keys(reqQ_2)
                                        .map(function (q) { return [q, reqQ_2[q]].join('='); })
                                        .join('&'),
                                    params: reqP
                                });
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
    }, [resolvedKey, requestCallId, stringDeps, auto, ctx.auto, idString, id]);
    (0, react_1.useEffect)(function () {
        function backOnline() {
            var willCancel = false;
            function cancelReconectionAttempt() {
                willCancel = true;
            }
            requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                online: true
            });
            setOnline(true);
            if (handleOnline) {
                ;
                onOnline({ cancel: cancelReconectionAttempt });
            }
            if (!willCancel) {
                reValidate();
            }
        }
        function addOnlineListener() {
            if (windowExists) {
                if ('addEventListener' in window) {
                    if (retryOnReconnect) {
                        window.addEventListener('online', backOnline);
                    }
                }
            }
        }
        addOnlineListener();
        return function () {
            if (windowExists) {
                if ('addEventListener' in window) {
                    window.removeEventListener('online', backOnline);
                }
            }
        };
    }, [onOnline, reValidate, resolvedKey, retryOnReconnect]);
    (0, react_1.useEffect)(function () {
        function wentOffline() {
            runningRequests[resolvedKey] = false;
            setOnline(false);
            requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                online: false
            });
            if (handleOffline) {
                ;
                onOffline();
            }
        }
        function addOfflineListener() {
            if (windowExists) {
                if ('addEventListener' in window) {
                    window.addEventListener('offline', wentOffline);
                }
            }
        }
        addOfflineListener();
        return function () {
            if (windowExists) {
                if ('addEventListener' in window) {
                    window.removeEventListener('offline', wentOffline);
                }
            }
        };
    }, [onOffline, reValidate, resolvedKey, retryOnReconnect]);
    (0, react_1.useEffect)(function () {
        var newHeaders = __assign(__assign({}, ctx.headers), config.headers);
        setRequestHeades(newHeaders);
    }, [JSON.stringify(__assign(__assign({}, ctx.headers), config.headers)), resolvedKey]);
    (0, react_1.useEffect)(function () {
        previousConfig[resolvedKey] = undefined;
    }, [requestCallId, resolvedKey]);
    (0, react_1.useEffect)(function () {
        // Attempts will be made after a request fails
        var tm = queue(function () {
            if (error) {
                if (completedAttempts < attempts) {
                    reValidate();
                    setCompletedAttempts(function (previousAttempts) {
                        var newAttemptsValue = previousAttempts + 1;
                        requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            completedAttempts: newAttemptsValue
                        });
                        return newAttemptsValue;
                    });
                }
                else if (completedAttempts === attempts) {
                    requestEmitter.emit(resolvedKey, {
                        requestCallId: requestCallId,
                        online: false
                    });
                    setOnline(false);
                }
            }
        }, attemptInterval * 1000);
        return function () {
            clearTimeout(tm);
        };
    }, [error, attempts, rawJSON, attemptInterval, completedAttempts]);
    (0, react_1.useEffect)(function () {
        if (completedAttempts === 0) {
            if (refresh > 0 && auto) {
                var tm_1 = queue(reValidate, refresh * 1000);
                return function () {
                    clearTimeout(tm_1);
                };
            }
        }
        return function () { };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, rawJSON, completedAttempts, config]);
    var initMemo = React.useMemo(function () { return JSON.stringify(optionsConfig); }, []);
    (0, react_1.useEffect)(function () {
        if (auto) {
            if (url !== '') {
                if (runningRequests[resolvedKey]) {
                    setLoading(true);
                }
                var reqQ_3 = __assign(__assign({}, ctx.query), config.query);
                var reqP = __assign(__assign({}, ctx.params), config.params);
                fetchData({
                    query: Object.keys(reqQ_3)
                        .map(function (q) { return [q, reqQ_3[q]].join('='); })
                        .join('&'),
                    params: reqP
                });
            }
            // It means a url is not passed
            else {
                setError(null);
                setLoading(false);
            }
        }
        else {
            if (!isDefined(data)) {
                setData(def);
                cacheForMutation[idString] = def;
            }
            setError(null);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        requestCallId,
        initMemo,
        url,
        stringDeps,
        refresh,
        JSON.stringify(config),
        auto,
        ctx.auto
    ]);
    (0, react_1.useEffect)(function () {
        function addFocusListener() {
            if (revalidateOnFocus && windowExists) {
                if ('addEventListener' in window) {
                    window.addEventListener('focus', reValidate);
                }
            }
        }
        addFocusListener();
        return function () {
            if (windowExists) {
                if ('addEventListener' in window) {
                    window.removeEventListener('focus', reValidate);
                }
            }
        };
    }, [
        requestCallId,
        url,
        revalidateOnFocus,
        stringDeps,
        loading,
        reValidate,
        // ctx.children,
        refresh,
        JSON.stringify(config)
    ]);
    var __config = __assign(__assign({}, config), { method: reqMethod, params: reqParams, headers: requestHeaders, body: config.body, baseUrl: ctx.baseUrl || config.baseUrl, url: configUrl === null || configUrl === void 0 ? void 0 : configUrl.realUrl, rawUrl: configUrl === null || configUrl === void 0 ? void 0 : configUrl.rawUrl, query: reqQuery });
    function forceMutate(newValue, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!isFunction(newValue)) {
            if (JSON.stringify(cache.get(resolvedKey)) !== JSON.stringify(newValue)) {
                if (handleMutate) {
                    ;
                    onMutate(newValue, imperativeFetcher);
                }
                callback(newValue, imperativeFetcher);
                cache.set(resolvedKey, newValue);
                valuesMemory[resolvedKey] = newValue;
                cacheForMutation[idString] = newValue;
                requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    isMutating: true,
                    data: newValue
                });
                setData(newValue);
            }
        }
        else {
            var newVal = newValue(data);
            if (JSON.stringify(cache.get(resolvedKey)) !== JSON.stringify(newVal)) {
                if (handleMutate) {
                    ;
                    onMutate(newVal, imperativeFetcher);
                }
                callback(newVal, imperativeFetcher);
                cache.set(resolvedKey, newVal);
                valuesMemory[resolvedKey] = newVal;
                cacheForMutation[idString] = newVal;
                requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    isMutating: true,
                    data: newVal
                });
                setData(newVal);
            }
        }
    }
    (0, react_1.useEffect)(function () {
        var rev = {
            revalidate: function () { return queue(function () { return revalidate(id); }); },
            cancel: function () {
                try {
                    if (url !== '') {
                        if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
                            requestAbortController === null || requestAbortController === void 0 ? void 0 : requestAbortController.abort();
                        }
                    }
                }
                catch (err) { }
            },
            fetcher: imperativeFetcher,
            props: optionsConfig,
            previousProps: previousProps[resolvedKey]
        };
        if (JSON.stringify(previousProps[resolvedKey]) !==
            JSON.stringify(optionsConfig)) {
            if (handlePropsChange) {
                ;
                onPropsChange(rev);
            }
            if (url !== '') {
                previousProps[resolvedKey] = optionsConfig;
            }
            if (previousConfig[resolvedKey] !== JSON.stringify(optionsConfig)) {
                if (cancelOnChange) {
                    requestAbortController === null || requestAbortController === void 0 ? void 0 : requestAbortController.abort();
                }
            }
        }
    }, [
        url,
        cancelOnChange,
        JSON.stringify(id),
        JSON.stringify(optionsConfig),
        resolvedKey
    ]);
    var resolvedData = React.useMemo(function () { return data; }, [rawJSON]);
    return {
        data: resolvedData,
        loading: loading,
        error: error,
        online: online,
        code: statusCode,
        reFetch: reValidate,
        mutate: forceMutate,
        fetcher: imperativeFetcher,
        abort: function () {
            var _a;
            (_a = abortControllers[resolvedKey]) === null || _a === void 0 ? void 0 : _a.abort();
            if (loading) {
                setError(false);
                setLoading(false);
                setData(requestCache);
                requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    error: false,
                    loading: false,
                    data: requestCache
                });
            }
        },
        config: __config,
        response: response,
        id: id,
        /**
         * The request key
         */
        key: resolvedKey
    };
};
exports.useFetch = useFetcher;
exports.useFetcher = useFetcher;
// Create a method for each request
useFetcher.get = createRequestFn('GET', '', {});
useFetcher.delete = createRequestFn('DELETE', '', {});
useFetcher.head = createRequestFn('HEAD', '', {});
useFetcher.options = createRequestFn('OPTIONS', '', {});
useFetcher.post = createRequestFn('POST', '', {});
useFetcher.put = createRequestFn('PUT', '', {});
useFetcher.patch = createRequestFn('PATCH', '', {});
useFetcher.purge = createRequestFn('PURGE', '', {});
useFetcher.link = createRequestFn('LINK', '', {});
useFetcher.unlink = createRequestFn('UNLINK', '', {});
/**
 * @deprecated Everything with `extend` can be achieved with `useFetch` alone
 *
 *
 * Extend the useFetcher hook
 */
useFetcher.extend = function extendFetcher(props) {
    if (props === void 0) { props = {}; }
    var _a = props.baseUrl, baseUrl = _a === void 0 ? undefined : _a, _b = props.headers, headers = _b === void 0 ? {} : _b, _c = props.query, query = _c === void 0 ? {} : _c, 
    // json by default
    resolver = props.resolver;
    function useCustomFetcher(init, options) {
        var ctx = useHRFContext();
        var _a = typeof init === 'string'
            ? __assign({ 
                // set url if init is a stringss
                url: init }, options) : // `url` will be required in init if it is an object
            init, _b = _a.url, url = _b === void 0 ? '' : _b, _c = _a.config, config = _c === void 0 ? {} : _c, otherProps = __rest(_a, ["url", "config"]);
        return useFetcher(__assign(__assign({}, otherProps), { url: "".concat(url), 
            // If resolver is present is hook call, use that instead
            resolver: resolver || otherProps.resolver || ctx.resolver || (function (d) { return d.json(); }), config: {
                baseUrl: !isDefined(config.baseUrl)
                    ? !isDefined(ctx.baseUrl)
                        ? baseUrl
                        : ctx.baseUrl
                    : config.baseUrl,
                method: config.method,
                headers: __assign(__assign(__assign({}, headers), ctx.headers), config.headers),
                body: config.body
            } }));
    }
    useCustomFetcher.config = {
        baseUrl: baseUrl,
        headers: headers,
        query: query
    };
    // Creating methods for fetcher.extend
    useCustomFetcher.get = createRequestFn('GET', baseUrl, headers, query);
    useCustomFetcher.delete = createRequestFn('DELETE', baseUrl, headers, query);
    useCustomFetcher.head = createRequestFn('HEAD', baseUrl, headers, query);
    useCustomFetcher.options = createRequestFn('OPTIONS', baseUrl, headers, query);
    useCustomFetcher.post = createRequestFn('POST', baseUrl, headers, query);
    useCustomFetcher.put = createRequestFn('PUT', baseUrl, headers, query);
    useCustomFetcher.patch = createRequestFn('PATCH', baseUrl, headers, query);
    useCustomFetcher.purge = createRequestFn('PURGE', baseUrl, headers, query);
    useCustomFetcher.link = createRequestFn('LINK', baseUrl, headers, query);
    useCustomFetcher.unlink = createRequestFn('UNLINK', baseUrl, headers, query);
    useCustomFetcher.Config = FetcherConfig;
    return useCustomFetcher;
};
exports.fetcher = useFetcher;
var isFormData = function (target) {
    if (typeof FormData !== 'undefined') {
        return target instanceof FormData;
    }
    else
        return false;
};
exports.isFormData = isFormData;
var defaultConfig = { headers: {}, body: undefined };
/**
 * Basic HttpClient
 */
var HttpClient = /** @class */ (function () {
    function HttpClient(url) {
        this.baseUrl = '';
        this.baseUrl = url;
    }
    HttpClient.prototype.get = function (path, _a, method) {
        var _b = _a === void 0 ? defaultConfig : _a, headers = _b.headers, body = _b.body;
        if (method === void 0) { method = 'GET'; }
        return __awaiter(this, void 0, void 0, function () {
            var requestUrl, responseBody, responseData;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        requestUrl = "".concat(this.baseUrl).concat(path);
                        return [4 /*yield*/, fetch(requestUrl, __assign({ method: method, headers: __assign({ 'Content-Type': 'application/json', Accept: 'application/json' }, headers) }, (body ? { body: JSON.stringify(body) } : {})))];
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
                    case 0: return [4 /*yield*/, this.get(path, props, 'POST')];
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
                    case 0: return [4 /*yield*/, this.get(path, props, 'PUT')];
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
                    case 0: return [4 /*yield*/, this.get(path, props, 'DELETE')];
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
