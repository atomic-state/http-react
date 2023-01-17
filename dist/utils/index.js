"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutateData = exports.queryProvider = exports.gql = exports.revalidate = exports.createImperativeFetcher = exports.createRequestFn = exports.setURLParams = exports.queue = exports.isFormData = exports.merge = exports.serialize = exports.jsonCompare = exports.hasBaseUrl = exports.isFunction = exports.isDefined = exports.windowExists = void 0;
var react_1 = __importDefault(require("react"));
var others_1 = require("../hooks/others");
var use_fetcher_1 = require("../hooks/use-fetcher");
var internal_1 = require("../internal");
exports.windowExists = typeof window !== 'undefined';
function isDefined(target) {
    return typeof target !== 'undefined';
}
exports.isDefined = isDefined;
function isFunction(target) {
    return typeof target === 'function';
}
exports.isFunction = isFunction;
function hasBaseUrl(target) {
    return target.startsWith('http://') || target.startsWith('https://');
}
exports.hasBaseUrl = hasBaseUrl;
function jsonCompare(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
exports.jsonCompare = jsonCompare;
function serialize(input) {
    return JSON.stringify(input);
}
exports.serialize = serialize;
function merge() {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    return Object.assign.apply(Object, __spreadArray([{}], objects, false));
}
exports.merge = merge;
var isFormData = function (target) {
    if (typeof FormData !== 'undefined') {
        return target instanceof FormData;
    }
    else
        return false;
};
exports.isFormData = isFormData;
function queue(callback, time) {
    if (time === void 0) { time = 0; }
    // let tm = null
    var tm = setTimeout(function () {
        callback();
        clearTimeout(tm);
    }, time);
    return tm;
}
exports.queue = queue;
// Fetcher utils
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
                        def = init.default, _a = init.resolver, resolver = _a === void 0 ? internal_1.DEFAULT_RESOLVER : _a, _b = init.config, c = _b === void 0 ? {} : _b, _c = init.onResolve, onResolve = _c === void 0 ? function () { } : _c, _d = init.onError, onError = _d === void 0 ? function () { } : _d;
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
                                        : serialize(body)
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
exports.createRequestFn = createRequestFn;
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
            return use_fetcher_1.useFetcher[k.toLowerCase()](hasBaseUrl(url) ? url : baseUrl + url, __assign({ config: {
                    headers: __assign(__assign({}, ctx.headers), config.headers),
                    body: config.body,
                    query: __assign(__assign({}, ctx.query), config.query),
                    params: __assign(__assign({}, ctx.params), config.params),
                    formatBody: config.formatBody
                } }, other));
        }
    ]; })));
};
exports.createImperativeFetcher = createImperativeFetcher;
/**
 * Revalidate requests that match an id or ids
 */
function revalidate(id) {
    if (Array.isArray(id)) {
        id.map(function (reqId) {
            if (isDefined(reqId)) {
                var key = serialize(reqId);
                var resolveKey = serialize({ idString: key });
                internal_1.previousConfig[resolveKey] = undefined;
                internal_1.requestEmitter.emit(key);
            }
        });
    }
    else {
        if (isDefined(id)) {
            var key = serialize(id);
            var resolveKey = serialize({ idString: key });
            internal_1.previousConfig[resolveKey] = undefined;
            internal_1.requestEmitter.emit(key);
        }
    }
}
exports.revalidate = revalidate;
function gql() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var query = args[0][0];
    var returnObj = {
        value: query,
        variables: {},
        baseUrl: undefined,
        graphqlPath: undefined,
        headers: {}
    };
    return returnObj;
}
exports.gql = gql;
/**
 *
 * @param queries
 * @returns A hook that has full TypeScript support and offers autocomplete for every query passed
 */
function queryProvider(queries, providerConfig) {
    return function useQuery(queryName, otherConfig) {
        var _a, _b, _c, _d;
        var defaults = (providerConfig || {}).defaults;
        var thisDefaults = (_a = (defaults || {})) === null || _a === void 0 ? void 0 : _a[queryName];
        var queryVariables = __assign(__assign({}, thisDefaults === null || thisDefaults === void 0 ? void 0 : thisDefaults.variables), otherConfig === null || otherConfig === void 0 ? void 0 : otherConfig.variables);
        var _e = (providerConfig || {}).config, config = _e === void 0 ? {} : _e;
        var cache = config.cache, others = __rest(config, ["cache"]);
        var g = (0, others_1.useGql)(queries[queryName], __assign(__assign(__assign(__assign({ cache: config === null || config === void 0 ? void 0 : config.cache, graphqlPath: isDefined(thisDefaults === null || thisDefaults === void 0 ? void 0 : thisDefaults.graphqlPath)
                ? thisDefaults === null || thisDefaults === void 0 ? void 0 : thisDefaults.graphqlPath
                : undefined }, otherConfig), { config: __assign(__assign(__assign(__assign(__assign({}, others), thisDefaults === null || thisDefaults === void 0 ? void 0 : thisDefaults.headers), { baseUrl: isDefined(thisDefaults === null || thisDefaults === void 0 ? void 0 : thisDefaults.baseUrl)
                    ? thisDefaults === null || thisDefaults === void 0 ? void 0 : thisDefaults.baseUrl
                    : isDefined((_b = providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.config) === null || _b === void 0 ? void 0 : _b.baseUrl)
                        ? (_c = providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.config) === null || _c === void 0 ? void 0 : _c.baseUrl
                        : undefined }), otherConfig === null || otherConfig === void 0 ? void 0 : otherConfig.config), { headers: __assign(__assign(__assign({}, others === null || others === void 0 ? void 0 : others.headers), thisDefaults === null || thisDefaults === void 0 ? void 0 : thisDefaults.headers), (_d = otherConfig === null || otherConfig === void 0 ? void 0 : otherConfig.config) === null || _d === void 0 ? void 0 : _d.headers) }) }), { __fromProvider: true }), { default: {
                data: (isDefined(thisDefaults === null || thisDefaults === void 0 ? void 0 : thisDefaults.value)
                    ? thisDefaults.value
                    : otherConfig === null || otherConfig === void 0 ? void 0 : otherConfig.default)
            }, variables: queryVariables }));
        var thisData = react_1.default.useMemo(function () { return (__assign(__assign({}, g === null || g === void 0 ? void 0 : g.data), { variables: queryVariables })); }, [serialize({ data: g === null || g === void 0 ? void 0 : g.data, queryVariables: queryVariables })]);
        return __assign(__assign({}, g), { config: __assign(__assign({}, g === null || g === void 0 ? void 0 : g.config), { config: undefined }), data: thisData });
    };
}
exports.queryProvider = queryProvider;
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
            var key_1 = serialize({ idString: serialize(k) });
            var requestCallId = '';
            if (isFunction(v_1)) {
                var newVal_1 = v_1(internal_1.cacheForMutation[key_1]);
                internal_1.requestEmitter.emit(key_1, {
                    data: newVal_1,
                    isMutating: true,
                    requestCallId: requestCallId
                });
                if (_revalidate) {
                    internal_1.previousConfig[key_1] = undefined;
                    internal_1.requestEmitter.emit(serialize(k));
                }
                queue(function () {
                    internal_1.cacheForMutation[key_1] = newVal_1;
                });
            }
            else {
                internal_1.requestEmitter.emit(key_1, {
                    requestCallId: requestCallId,
                    isMutating: true,
                    data: v_1
                });
                if (_revalidate) {
                    internal_1.previousConfig[key_1] = undefined;
                    internal_1.requestEmitter.emit(serialize(k));
                }
                queue(function () {
                    internal_1.cacheForMutation[key_1] = v_1;
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
