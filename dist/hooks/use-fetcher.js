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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetcher = void 0;
var react_1 = __importStar(require("react"));
var internal_1 = require("../internal");
var utils_1 = require("../utils");
/**
 * Fetcher hook
 */
var useFetcher = function (init, options) {
    var ctx = (0, internal_1.useHRFContext)();
    var optionsConfig = typeof init === "string"
        ? __assign({ 
            // Pass init as the url if init is a string
            url: init }, options) : init;
    var _a = optionsConfig.onOnline, onOnline = _a === void 0 ? ctx.onOnline : _a, _b = optionsConfig.onOffline, onOffline = _b === void 0 ? ctx.onOffline : _b, onMutate = optionsConfig.onMutate, onPropsChange = optionsConfig.onPropsChange, _c = optionsConfig.revalidateOnMount, revalidateOnMount = _c === void 0 ? ctx.revalidateOnMount : _c, _d = optionsConfig.url, url = _d === void 0 ? "" : _d, id = optionsConfig.id, _e = optionsConfig.config, config = _e === void 0 ? {
        query: {},
        params: {},
        baseUrl: undefined,
        method: "GET",
        headers: {},
        body: undefined,
        formatBody: false,
    } : _e, _f = optionsConfig.resolver, resolver = _f === void 0 ? (0, utils_1.isFunction)(ctx.resolver) ? ctx.resolver : internal_1.DEFAULT_RESOLVER : _f, onError = optionsConfig.onError, _g = optionsConfig.auto, auto = _g === void 0 ? (0, utils_1.isDefined)(ctx.auto) ? ctx.auto : true : _g, _h = optionsConfig.memory, memory = _h === void 0 ? (0, utils_1.isDefined)(ctx.memory) ? ctx.memory : true : _h, onResolve = optionsConfig.onResolve, onAbort = optionsConfig.onAbort, _j = optionsConfig.refresh, refresh = _j === void 0 ? (0, utils_1.isDefined)(ctx.refresh) ? ctx.refresh : 0 : _j, _k = optionsConfig.cancelOnChange, cancelOnChange = _k === void 0 ? false : _k, _l = optionsConfig.attempts, attempts = _l === void 0 ? ctx.attempts : _l, _m = optionsConfig.attemptInterval, attemptInterval = _m === void 0 ? ctx.attemptInterval : _m, _o = optionsConfig.revalidateOnFocus, revalidateOnFocus = _o === void 0 ? ctx.revalidateOnFocus : _o, $suspense = optionsConfig.suspense;
    var _p = ctx.cache, $cache = _p === void 0 ? internal_1.defaultCache : _p;
    var _q = optionsConfig.cache, cache = _q === void 0 ? $cache : _q;
    var requestCallId = react_1.default.useMemo(function () { return "".concat(Math.random()).split(".")[1]; }, []);
    var willResolve = (0, utils_1.isDefined)(onResolve);
    var handleError = (0, utils_1.isDefined)(onError);
    var handlePropsChange = (0, utils_1.isDefined)(onPropsChange);
    var handleOnAbort = (0, utils_1.isDefined)(onAbort);
    var handleMutate = (0, utils_1.isDefined)(onMutate);
    var handleOnline = (0, utils_1.isDefined)(onOnline);
    var handleOffline = (0, utils_1.isDefined)(onOffline);
    var retryOnReconnect = optionsConfig.auto === false
        ? false
        : (0, utils_1.isDefined)(optionsConfig.retryOnReconnect)
            ? optionsConfig.retryOnReconnect
            : ctx.retryOnReconnect;
    var idString = (0, utils_1.serialize)(id);
    var _r = (0, react_1.useState)(__assign(__assign({}, ctx.query), config.query)), reqQuery = _r[0], setReqQuery = _r[1];
    var _s = (0, react_1.useState)(__assign(__assign({}, ctx.params), config.params)), reqParams = _s[0], setReqParams = _s[1];
    var rawUrl = ((0, utils_1.hasBaseUrl)(url)
        ? ""
        : !(0, utils_1.isDefined)(config.baseUrl)
            ? !(0, utils_1.isDefined)(ctx.baseUrl)
                ? ""
                : ctx.baseUrl
            : config.baseUrl) + url;
    var urlWithParams = react_1.default.useMemo(function () { return (0, utils_1.setURLParams)(rawUrl, reqParams); }, [(0, utils_1.serialize)(reqParams), config.baseUrl, ctx.baseUrl, url]);
    var resolvedKey = (0, utils_1.serialize)((0, utils_1.isDefined)(id)
        ? {
            idString: idString,
        }
        : {
            uri: rawUrl,
            config: {
                method: config === null || config === void 0 ? void 0 : config.method,
            },
        });
    var _t = (0, react_1.useState)(internal_1.urls[resolvedKey]), configUrl = _t[0], setConfigUrl = _t[1];
    (0, react_1.useEffect)(function () {
        setConfigUrl(internal_1.urls[resolvedKey]);
    }, [(0, utils_1.serialize)(internal_1.urls[resolvedKey])]);
    var suspense = $suspense || internal_1.willSuspend[resolvedKey];
    var realUrl = urlWithParams + (urlWithParams.includes("?") ? "" : "?");
    if (!(0, utils_1.isDefined)(internal_1.previousProps[resolvedKey])) {
        if (url !== "") {
            internal_1.previousProps[resolvedKey] = optionsConfig;
        }
    }
    (0, react_1.useEffect)(function () {
        if (url !== "") {
            setReqParams(function () {
                var newParams = __assign(__assign({}, ctx.params), config.params);
                return newParams;
            });
        }
    }, [(0, utils_1.serialize)(__assign(__assign({}, ctx.params), config.params)), resolvedKey]);
    var stringDeps = (0, utils_1.serialize)(
    // We ignore children and resolver
    Object.assign(ctx, { children: undefined }, config === null || config === void 0 ? void 0 : config.headers, config === null || config === void 0 ? void 0 : config.method, config === null || config === void 0 ? void 0 : config.body, config === null || config === void 0 ? void 0 : config.query, config === null || config === void 0 ? void 0 : config.params, { resolver: undefined }, { reqQuery: reqQuery }, { reqParams: reqParams }));
    var _u = realUrl.split("?"), resKey = _u[0], qp = _u[1];
    // This helps pass default values to other useFetcher calls using the same id
    (0, react_1.useEffect)(function () {
        if ((0, utils_1.isDefined)(optionsConfig.default)) {
            if (!(0, utils_1.isDefined)(internal_1.fetcherDefaults[resolvedKey])) {
                if (url !== "") {
                    if (!(0, utils_1.isDefined)(cache.get(resolvedKey))) {
                        internal_1.fetcherDefaults[resolvedKey] = optionsConfig.default;
                    }
                }
                else {
                    if (!(0, utils_1.isDefined)(cache.get(resolvedKey))) {
                        internal_1.requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            data: optionsConfig.default,
                        });
                    }
                }
            }
        }
        else {
            if ((0, utils_1.isDefined)(internal_1.fetcherDefaults[resolvedKey])) {
                if (!(0, utils_1.isDefined)(cache.get(resolvedKey))) {
                    setData(internal_1.fetcherDefaults[resolvedKey]);
                }
            }
        }
    }, [resolvedKey]);
    var def = resolvedKey in internal_1.fetcherDefaults
        ? internal_1.fetcherDefaults[resolvedKey]
        : optionsConfig.default;
    (0, react_1.useEffect)(function () {
        if (!auto) {
            internal_1.runningRequests[resolvedKey] = false;
        }
    }, []);
    (0, react_1.useEffect)(function () {
        var queryParamsFromString = {};
        try {
            // getting query params from passed url
            var queryParts = qp.split("&");
            queryParts.forEach(function (q, i) {
                var _a = q.split("="), key = _a[0], value = _a[1];
                if (queryParamsFromString[key] !== value) {
                    queryParamsFromString[key] = "".concat(value);
                }
            });
        }
        finally {
            if (url !== "") {
                setReqQuery(function () {
                    var newQuery = __assign(__assign(__assign({}, ctx.query), queryParamsFromString), config.query);
                    return newQuery;
                });
            }
        }
    }, [
        resolvedKey,
        requestCallId,
        (0, utils_1.serialize)(__assign(__assign({ qp: qp }, ctx.query), config.query)),
    ]);
    var requestCache = cache.get(resolvedKey);
    var initialDataValue = (0, utils_1.isDefined)(internal_1.valuesMemory[resolvedKey])
        ? internal_1.valuesMemory[resolvedKey]
        : (0, utils_1.isDefined)(cache.get(resolvedKey))
            ? cache.get(resolvedKey)
            : def;
    var _v = (0, react_1.useState)(memory ? initialDataValue : def), data = _v[0], setData = _v[1];
    // Used JSON as deppendency instead of directly using a reference to data
    var rawJSON = (0, utils_1.serialize)(data);
    var _w = (0, react_1.useState)(true), online = _w[0], setOnline = _w[1];
    var _x = (0, react_1.useState)(__assign(__assign({}, ctx.headers), config.headers)), requestHeaders = _x[0], setRequestHeades = _x[1];
    var _y = (0, react_1.useState)(), response = _y[0], setResponse = _y[1];
    var _z = (0, react_1.useState)(), statusCode = _z[0], setStatusCode = _z[1];
    var _0 = (0, react_1.useState)(internal_1.hasErrors[resolvedKey]), error = _0[0], setError = _0[1];
    var _1 = (0, react_1.useState)(revalidateOnMount
        ? true
        : internal_1.previousConfig[resolvedKey] !== (0, utils_1.serialize)(optionsConfig)), loading = _1[0], setLoading = _1[1];
    var _2 = (0, react_1.useState)(0), completedAttempts = _2[0], setCompletedAttempts = _2[1];
    var _3 = (0, react_1.useState)(new AbortController()), requestAbortController = _3[0], setRequestAbortController = _3[1];
    var _4 = (0, react_1.useState)(config.method), reqMethod = _4[0], setReqMethod = _4[1];
    (0, react_1.useEffect)(function () {
        if (url !== "") {
            setReqMethod(config.method);
            internal_1.requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                method: config.method,
            });
        }
    }, [stringDeps, response, requestAbortController, requestCallId]);
    (0, react_1.useEffect)(function () {
        if (url !== "") {
            if (error && !internal_1.hasErrors[resolvedKey]) {
                internal_1.requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    error: error,
                });
            }
        }
    }, [url, error, resolvedKey, requestCallId]);
    var isGqlRequest = (0, utils_1.isDefined)(optionsConfig["__gql"]);
    var fetchData = react_1.default.useCallback(function fetchData(c) {
        var _a;
        if (c === void 0) { c = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var rawUrl, urlWithParams, realUrl, resKey, newAbortController, json, code, _data_1, __data_1, err_1, errorString, _error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        internal_1.requestEmitter.emit(resolvedKey, {
                            config: c,
                        });
                        rawUrl = ((0, utils_1.hasBaseUrl)(url)
                            ? ""
                            : !(0, utils_1.isDefined)(config.baseUrl)
                                ? !(0, utils_1.isDefined)(ctx.baseUrl)
                                    ? ""
                                    : ctx.baseUrl
                                : config.baseUrl) + url;
                        urlWithParams = (0, utils_1.setURLParams)(rawUrl, c.params);
                        realUrl = urlWithParams +
                            (urlWithParams.includes("?") ? ((c === null || c === void 0 ? void 0 : c.query) !== "" ? "&" : "") : "?");
                        resKey = realUrl.split("?")[0];
                        if (!(internal_1.previousConfig[resolvedKey] !== (0, utils_1.serialize)(optionsConfig))) return [3 /*break*/, 6];
                        internal_1.previousProps[resolvedKey] = optionsConfig;
                        (0, utils_1.queue)(function () {
                            setReqMethod(config.method);
                            if (url !== "") {
                                var newUrls = {
                                    realUrl: realUrl,
                                    rawUrl: rawUrl,
                                };
                                internal_1.urls[resolvedKey] = newUrls;
                                setConfigUrl({
                                    rawUrl: rawUrl,
                                    realUrl: realUrl,
                                });
                                internal_1.requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    realUrl: resKey,
                                    rawUrl: rawUrl,
                                });
                            }
                        });
                        if (!!internal_1.runningRequests[resolvedKey]) return [3 /*break*/, 6];
                        internal_1.previousConfig[resolvedKey] = (0, utils_1.serialize)(optionsConfig);
                        internal_1.runningRequests[resolvedKey] = true;
                        setLoading(true);
                        newAbortController = new AbortController();
                        setRequestAbortController(newAbortController);
                        setError(null);
                        internal_1.hasErrors[resolvedKey] = null;
                        internal_1.requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            loading: loading,
                            requestAbortController: newAbortController,
                            error: null,
                        });
                        internal_1.abortControllers[resolvedKey] = newAbortController;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch(realUrl + c.query, {
                                signal: newAbortController.signal,
                                method: config.method,
                                headers: __assign(__assign(__assign({ "Content-Type": 
                                    // If body is form-data, set Content-Type header to 'multipart/form-data'
                                    (0, utils_1.isFormData)(config.body)
                                        ? "multipart/form-data"
                                        : "application/json" }, ctx.headers), config.headers), c.headers),
                                body: ((_a = config.method) === null || _a === void 0 ? void 0 : _a.match(/(POST|PUT|DELETE|PATCH)/))
                                    ? (0, utils_1.isFunction)(config.formatBody)
                                        ? config.formatBody(((0, utils_1.isFormData)(config.body)
                                            ? config.body
                                            : __assign(__assign({}, config.body), c.body)))
                                        : config.formatBody === false || (0, utils_1.isFormData)(config.body)
                                            ? config.body
                                            : (0, utils_1.serialize)(__assign(__assign({}, config.body), c.body))
                                    : undefined,
                            })];
                    case 2:
                        json = _b.sent();
                        internal_1.requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            response: json,
                        });
                        code = json.status;
                        setStatusCode(code);
                        internal_1.requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            code: code,
                        });
                        return [4 /*yield*/, resolver(json)];
                    case 3:
                        _data_1 = _b.sent();
                        if (code >= 200 && code < 400) {
                            __data_1 = isGqlRequest
                                ? __assign(__assign({}, _data_1), { variables: optionsConfig === null || optionsConfig === void 0 ? void 0 : optionsConfig.variables, errors: (_data_1 === null || _data_1 === void 0 ? void 0 : _data_1.errors) ? _data_1.errors : undefined }) : _data_1;
                            if ((_data_1 === null || _data_1 === void 0 ? void 0 : _data_1.errors) && isGqlRequest) {
                                setError(true);
                                internal_1.hasErrors[resolvedKey] = true;
                                if (handleError) {
                                    ;
                                    onError(true);
                                }
                            }
                            if (memory) {
                                cache.set(resolvedKey, __data_1);
                                internal_1.valuesMemory[resolvedKey] = __data_1;
                            }
                            internal_1.requestEmitter.emit(resolvedKey, {
                                requestCallId: requestCallId,
                                data: __data_1,
                                isResolved: true,
                                loading: false,
                                error: (_data_1 === null || _data_1 === void 0 ? void 0 : _data_1.errors) && isGqlRequest ? true : null,
                                variables: isGqlRequest
                                    ? (optionsConfig === null || optionsConfig === void 0 ? void 0 : optionsConfig.variables) || {}
                                    : undefined,
                                completedAttempts: 0,
                            });
                            setData(__data_1);
                            internal_1.cacheForMutation[idString] = __data_1;
                            if (!(_data_1 === null || _data_1 === void 0 ? void 0 : _data_1.errors) && isGqlRequest) {
                                setError(null);
                                internal_1.hasErrors[resolvedKey] = null;
                            }
                            setLoading(false);
                            if (willResolve) {
                                ;
                                onResolve(__data_1, json);
                            }
                            internal_1.runningRequests[resolvedKey] = false;
                            // If a request completes succesfuly, we reset the error attempts to 0
                            setCompletedAttempts(0);
                            (0, utils_1.queue)(function () {
                                internal_1.cacheForMutation[resolvedKey] = __data_1;
                            });
                        }
                        else {
                            if (_data_1.errors && isGqlRequest) {
                                setData(function (previous) {
                                    var newData = __assign(__assign({}, previous), { variables: optionsConfig === null || optionsConfig === void 0 ? void 0 : optionsConfig.variables, errors: _data_1.errors });
                                    internal_1.cacheForMutation[idString] = newData;
                                    internal_1.requestEmitter.emit(resolvedKey, {
                                        requestCallId: requestCallId,
                                        data: newData,
                                        error: true,
                                    });
                                    cache.set(resolvedKey, newData);
                                    return newData;
                                });
                                if (handleError) {
                                    ;
                                    onError(true, json);
                                }
                            }
                            else {
                                if (def) {
                                    setData(def);
                                    internal_1.cacheForMutation[idString] = def;
                                    internal_1.requestEmitter.emit(resolvedKey, {
                                        requestCallId: requestCallId,
                                        data: def,
                                    });
                                }
                                if (handleError) {
                                    ;
                                    onError(_data_1, json);
                                }
                                internal_1.requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    error: true,
                                });
                            }
                            setError(true);
                            internal_1.hasErrors[resolvedKey] = true;
                            internal_1.runningRequests[resolvedKey] = false;
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _b.sent();
                        errorString = err_1 === null || err_1 === void 0 ? void 0 : err_1.toString();
                        // Only set error if no abort
                        if (!"".concat(errorString).match(/abort/i)) {
                            _error = new Error(err_1);
                            internal_1.requestEmitter.emit(resolvedKey, {
                                requestCallId: requestCallId,
                                error: _error,
                            });
                            if (!(0, utils_1.isDefined)(cache.get(resolvedKey))) {
                                setData(def);
                                internal_1.cacheForMutation[idString] = def;
                                internal_1.requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: def,
                                });
                            }
                            else {
                                setData(requestCache);
                                internal_1.cacheForMutation[idString] = requestCache;
                                internal_1.requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: requestCache,
                                });
                            }
                            setError(_error);
                            internal_1.hasErrors[resolvedKey] = true;
                            if (handleError) {
                                ;
                                onError(err_1);
                            }
                        }
                        else {
                            if (!(0, utils_1.isDefined)(cache.get(resolvedKey))) {
                                if ((0, utils_1.isDefined)(def)) {
                                    setData(def);
                                    internal_1.cacheForMutation[idString] = def;
                                }
                                internal_1.requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    data: def,
                                });
                            }
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        internal_1.runningRequests[resolvedKey] = false;
                        internal_1.requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            loading: false,
                        });
                        internal_1.suspenseInitialized[resolvedKey] = true;
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
        (0, utils_1.serialize)(optionsConfig),
        realUrl,
        requestCallId,
        memory,
        def,
    ]);
    (0, react_1.useEffect)(function () {
        var signal = (requestAbortController || {}).signal;
        // Run onAbort callback
        var abortCallback = function () {
            if (loading) {
                if (internal_1.runningRequests[resolvedKey]) {
                    if (handleOnAbort) {
                        ;
                        onAbort();
                    }
                }
            }
        };
        signal === null || signal === void 0 ? void 0 : signal.addEventListener("abort", abortCallback);
        return function () {
            signal === null || signal === void 0 ? void 0 : signal.removeEventListener("abort", abortCallback);
        };
    }, [requestAbortController, resolvedKey, onAbort, loading]);
    var imperativeFetcher = react_1.default.useMemo(function () {
        var __headers = __assign(__assign({}, ctx.headers), config.headers);
        var __params = __assign(__assign({}, ctx.params), config.params);
        var __baseUrl = (0, utils_1.isDefined)(config.baseUrl) ? config.baseUrl : ctx.baseUrl;
        return (0, utils_1.createImperativeFetcher)(__assign(__assign({}, ctx), { headers: __headers, baseUrl: __baseUrl, params: __params }));
    }, [(0, utils_1.serialize)(ctx)]);
    if (willResolve) {
        if (internal_1.resolvedHookCalls[resolvedKey]) {
            if ((0, utils_1.isDefined)(cache.get(resolvedKey))) {
                if (!suspense) {
                    ;
                    onResolve(cache.get(resolvedKey), response);
                }
                (0, utils_1.queue)(function () {
                    delete internal_1.resolvedHookCalls[resolvedKey];
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
                        if ((0, utils_1.isDefined)(isResolved)) {
                            internal_1.resolvedHookCalls[resolvedKey] = true;
                        }
                        if ((0, utils_1.isDefined)(method_1)) {
                            (0, utils_1.queue)(function () {
                                setReqMethod(method_1);
                            });
                        }
                        if ((0, utils_1.isDefined)(config_1 === null || config_1 === void 0 ? void 0 : config_1.query)) {
                            (0, utils_1.queue)(function () {
                                setReqQuery(config_1.query);
                            });
                        }
                        if ((0, utils_1.isDefined)(rawUrl_1) && (0, utils_1.isDefined)(realUrl_1)) {
                            (0, utils_1.queue)(function () {
                                setConfigUrl({
                                    rawUrl: rawUrl_1,
                                    realUrl: realUrl_1,
                                });
                            });
                        }
                        if ((0, utils_1.isDefined)(config_1 === null || config_1 === void 0 ? void 0 : config_1.params)) {
                            (0, utils_1.queue)(function () {
                                setReqParams(config_1 === null || config_1 === void 0 ? void 0 : config_1.params);
                            });
                        }
                        if ((0, utils_1.isDefined)(config_1 === null || config_1 === void 0 ? void 0 : config_1.headers)) {
                            (0, utils_1.queue)(function () {
                                setRequestHeades(config_1 === null || config_1 === void 0 ? void 0 : config_1.headers);
                            });
                        }
                        if ((0, utils_1.isDefined)(completedAttempts_1)) {
                            (0, utils_1.queue)(function () {
                                setCompletedAttempts(completedAttempts_1);
                            });
                        }
                        if ((0, utils_1.isDefined)(code_1)) {
                            (0, utils_1.queue)(function () {
                                setStatusCode(code_1);
                            });
                        }
                        if ((0, utils_1.isDefined)(requestAbortController_1)) {
                            (0, utils_1.queue)(function () {
                                setRequestAbortController(requestAbortController_1);
                            });
                        }
                        if ((0, utils_1.isDefined)(response_1)) {
                            (0, utils_1.queue)(function () {
                                setResponse(response_1);
                            });
                        }
                        if ((0, utils_1.isDefined)(loading_1)) {
                            (0, utils_1.queue)(function () {
                                setLoading(loading_1);
                            });
                        }
                        if ((0, utils_1.isDefined)($data_1)) {
                            (0, utils_1.queue)(function () {
                                if ((0, utils_1.serialize)(data) !== (0, utils_1.serialize)(cache.get(resolvedKey))) {
                                    setData($data_1);
                                }
                                if ((0, utils_1.serialize)($data_1) !== (0, utils_1.serialize)(internal_1.cacheForMutation[resolvedKey])) {
                                    internal_1.cacheForMutation[idString] = data;
                                    if (isMutating_1) {
                                        if (handleMutate) {
                                            ;
                                            onMutate($data_1, imperativeFetcher);
                                        }
                                    }
                                }
                            });
                        }
                        if ((0, utils_1.isDefined)($error_1)) {
                            (0, utils_1.queue)(function () {
                                setError($error_1);
                                if ($error_1 !== null) {
                                    internal_1.hasErrors[resolvedKey] = true;
                                    if (handleError) {
                                        ;
                                        onError($error_1);
                                    }
                                }
                            });
                        }
                        if ((0, utils_1.isDefined)(online_1)) {
                            (0, utils_1.queue)(function () {
                                setOnline(online_1);
                            });
                        }
                    }
                    return [2 /*return*/];
                });
            });
        }
        internal_1.requestEmitter.addListener(resolvedKey, waitFormUpdates);
        return function () {
            internal_1.requestEmitter.removeListener(resolvedKey, waitFormUpdates);
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
        onResolve,
    ]);
    var reValidate = react_1.default.useCallback(function reValidate() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, utils_1.revalidate)(id);
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
        ctx.auto,
    ]);
    (0, react_1.useEffect)(function () {
        function forceRefresh(v) {
            return __awaiter(this, void 0, void 0, function () {
                var d, reqQ_1, reqP;
                return __generator(this, function (_a) {
                    if ((0, utils_1.isDefined)(v === null || v === void 0 ? void 0 : v.data)) {
                        try {
                            d = v.data;
                            if ((0, utils_1.isDefined)(data)) {
                                setData(d);
                                internal_1.cacheForMutation[idString] = d;
                                cache.set(resolvedKey, d);
                                internal_1.valuesMemory[resolvedKey] = d;
                            }
                        }
                        catch (err) { }
                    }
                    else {
                        setLoading(true);
                        setError(null);
                        internal_1.hasErrors[resolvedKey] = null;
                        if (!internal_1.runningRequests[resolvedKey]) {
                            // We are preventing revalidation where we only need updates about
                            // 'loading', 'error' and 'data' because the url can be ommited.
                            if (url !== "") {
                                internal_1.requestEmitter.emit(resolvedKey, {
                                    requestCallId: requestCallId,
                                    loading: true,
                                    error: null,
                                });
                                reqQ_1 = __assign(__assign({}, ctx.query), config.query);
                                reqP = __assign(__assign({}, ctx.params), config.params);
                                fetchData({
                                    query: Object.keys(reqQ_1)
                                        .map(function (q) { return [q, reqQ_1[q]].join("="); })
                                        .join("&"),
                                    params: reqP,
                                });
                            }
                        }
                    }
                    return [2 /*return*/];
                });
            });
        }
        var idString = (0, utils_1.serialize)(id);
        internal_1.requestEmitter.addListener(idString, forceRefresh);
        return function () {
            internal_1.requestEmitter.removeListener(idString, forceRefresh);
        };
    }, [resolvedKey, requestCallId, stringDeps, auto, ctx.auto, idString, id]);
    (0, react_1.useEffect)(function () {
        function backOnline() {
            var willCancel = false;
            function cancelReconectionAttempt() {
                willCancel = true;
            }
            internal_1.requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                online: true,
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
            if (utils_1.windowExists) {
                if ("addEventListener" in window) {
                    if (retryOnReconnect) {
                        window.addEventListener("online", backOnline);
                    }
                }
            }
        }
        addOnlineListener();
        return function () {
            if (utils_1.windowExists) {
                if ("addEventListener" in window) {
                    window.removeEventListener("online", backOnline);
                }
            }
        };
    }, [onOnline, reValidate, resolvedKey, retryOnReconnect]);
    (0, react_1.useEffect)(function () {
        function wentOffline() {
            internal_1.runningRequests[resolvedKey] = false;
            setOnline(false);
            internal_1.requestEmitter.emit(resolvedKey, {
                requestCallId: requestCallId,
                online: false,
            });
            if (handleOffline) {
                ;
                onOffline();
            }
        }
        function addOfflineListener() {
            if (utils_1.windowExists) {
                if ("addEventListener" in window) {
                    window.addEventListener("offline", wentOffline);
                }
            }
        }
        addOfflineListener();
        return function () {
            if (utils_1.windowExists) {
                if ("addEventListener" in window) {
                    window.removeEventListener("offline", wentOffline);
                }
            }
        };
    }, [onOffline, reValidate, resolvedKey, retryOnReconnect]);
    (0, react_1.useEffect)(function () {
        var newHeaders = __assign(__assign({}, ctx.headers), config.headers);
        setRequestHeades(newHeaders);
    }, [(0, utils_1.serialize)(__assign(__assign({}, ctx.headers), config.headers)), resolvedKey]);
    (0, react_1.useEffect)(function () {
        if (revalidateOnMount) {
            if (suspense) {
                if (internal_1.suspenseInitialized[resolvedKey]) {
                    (0, utils_1.queue)(function () {
                        internal_1.previousConfig[resolvedKey] = undefined;
                    });
                }
            }
            else {
                internal_1.previousConfig[resolvedKey] = undefined;
            }
        }
    }, [requestCallId, resolvedKey, revalidateOnMount, suspense]);
    (0, react_1.useEffect)(function () {
        // Attempts will be made after a request fails
        var tm = (0, utils_1.queue)(function () {
            if (error) {
                if (completedAttempts < attempts) {
                    reValidate();
                    setCompletedAttempts(function (previousAttempts) {
                        var newAttemptsValue = previousAttempts + 1;
                        internal_1.requestEmitter.emit(resolvedKey, {
                            requestCallId: requestCallId,
                            completedAttempts: newAttemptsValue,
                        });
                        return newAttemptsValue;
                    });
                }
                else if (completedAttempts === attempts) {
                    internal_1.requestEmitter.emit(resolvedKey, {
                        requestCallId: requestCallId,
                        online: false,
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
                var tm_1 = (0, utils_1.queue)(reValidate, refresh * 1000);
                return function () {
                    clearTimeout(tm_1);
                };
            }
        }
        return function () { };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh, loading, error, rawJSON, completedAttempts, config]);
    var initMemo = react_1.default.useMemo(function () { return (0, utils_1.serialize)(optionsConfig); }, []);
    var initializeRevalidation = react_1.default.useCallback(function initializeRevalidation() {
        return __awaiter(this, void 0, void 0, function () {
            var reqQ_2, reqP;
            return __generator(this, function (_a) {
                if (auto) {
                    if (url !== "") {
                        if (internal_1.runningRequests[resolvedKey]) {
                            setLoading(true);
                        }
                        reqQ_2 = __assign(__assign({}, ctx.query), config.query);
                        reqP = __assign(__assign({}, ctx.params), config.params);
                        fetchData({
                            query: Object.keys(reqQ_2)
                                .map(function (q) { return [q, reqQ_2[q]].join("="); })
                                .join("&"),
                            params: reqP,
                        });
                    }
                    // It means a url is not passed
                    else {
                        setError(internal_1.hasErrors[resolvedKey]);
                        setLoading(false);
                    }
                }
                else {
                    if (!(0, utils_1.isDefined)(data)) {
                        setData(def);
                        internal_1.cacheForMutation[idString] = def;
                    }
                    setError(null);
                    internal_1.hasErrors[resolvedKey] = null;
                    setLoading(false);
                }
                return [2 /*return*/];
            });
        });
    }, [(0, utils_1.serialize)((0, utils_1.serialize)(optionsConfig))]);
    if (!suspense) {
        internal_1.suspenseInitialized[resolvedKey] = true;
    }
    react_1.default.useMemo(function () {
        if (suspense) {
            if (utils_1.windowExists) {
                if (!internal_1.suspenseInitialized[resolvedKey]) {
                    throw initializeRevalidation();
                }
            }
            else {
                throw {
                    message: "Use 'SSRSuspense' instead of 'Suspense' when using SSR and suspense",
                };
            }
        }
    }, [loading, utils_1.windowExists, suspense, resolvedKey, data]);
    (0, react_1.useEffect)(function () {
        if (suspense) {
            if (internal_1.previousConfig[resolvedKey] !== (0, utils_1.serialize)(optionsConfig)) {
                if (internal_1.suspenseInitialized[resolvedKey]) {
                    initializeRevalidation();
                }
            }
        }
        else {
            if (revalidateOnMount
                ? true
                : internal_1.previousConfig[resolvedKey] !== (0, utils_1.serialize)(optionsConfig)) {
                initializeRevalidation();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(0, utils_1.serialize)(optionsConfig)]);
    (0, react_1.useEffect)(function () {
        function addFocusListener() {
            if (revalidateOnFocus && utils_1.windowExists) {
                if ("addEventListener" in window) {
                    window.addEventListener("focus", reValidate);
                }
            }
        }
        addFocusListener();
        return function () {
            if (utils_1.windowExists) {
                if ("addEventListener" in window) {
                    window.removeEventListener("focus", reValidate);
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
        (0, utils_1.serialize)(config),
    ]);
    var __config = __assign(__assign({}, config), { method: reqMethod, params: reqParams, headers: requestHeaders, body: config.body, baseUrl: ctx.baseUrl || config.baseUrl, url: configUrl === null || configUrl === void 0 ? void 0 : configUrl.realUrl, rawUrl: configUrl === null || configUrl === void 0 ? void 0 : configUrl.rawUrl, query: reqQuery });
    function forceMutate(newValue, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!(0, utils_1.isFunction)(newValue)) {
            if ((0, utils_1.serialize)(cache.get(resolvedKey)) !== (0, utils_1.serialize)(newValue)) {
                if (handleMutate) {
                    ;
                    onMutate(newValue, imperativeFetcher);
                }
                callback(newValue, imperativeFetcher);
                cache.set(resolvedKey, newValue);
                internal_1.valuesMemory[resolvedKey] = newValue;
                internal_1.cacheForMutation[idString] = newValue;
                internal_1.requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    isMutating: true,
                    data: newValue,
                });
                setData(newValue);
            }
        }
        else {
            var newVal = newValue(data);
            if ((0, utils_1.serialize)(cache.get(resolvedKey)) !== (0, utils_1.serialize)(newVal)) {
                if (handleMutate) {
                    ;
                    onMutate(newVal, imperativeFetcher);
                }
                callback(newVal, imperativeFetcher);
                cache.set(resolvedKey, newVal);
                internal_1.valuesMemory[resolvedKey] = newVal;
                internal_1.cacheForMutation[idString] = newVal;
                internal_1.requestEmitter.emit(resolvedKey, {
                    requestCallId: requestCallId,
                    isMutating: true,
                    data: newVal,
                });
                setData(newVal);
            }
        }
    }
    (0, react_1.useEffect)(function () {
        var rev = {
            revalidate: function () { return (0, utils_1.queue)(function () { return (0, utils_1.revalidate)(id); }); },
            cancel: function () {
                try {
                    if (url !== "") {
                        if (internal_1.previousConfig[resolvedKey] !== (0, utils_1.serialize)(optionsConfig)) {
                            requestAbortController === null || requestAbortController === void 0 ? void 0 : requestAbortController.abort();
                        }
                    }
                }
                catch (err) { }
            },
            fetcher: imperativeFetcher,
            props: optionsConfig,
            previousProps: internal_1.previousProps[resolvedKey],
        };
        if ((0, utils_1.serialize)(internal_1.previousProps[resolvedKey]) !== (0, utils_1.serialize)(optionsConfig)) {
            if (handlePropsChange) {
                ;
                onPropsChange(rev);
            }
            if (cancelOnChange) {
                ;
                (function (_a) {
                    var cancel = _a.cancel, revalidate = _a.revalidate;
                    cancel();
                    if (auto && url !== "") {
                        revalidate();
                    }
                })(rev);
            }
            if (url !== "") {
                internal_1.previousProps[resolvedKey] = optionsConfig;
            }
            if (internal_1.previousConfig[resolvedKey] !== (0, utils_1.serialize)(optionsConfig)) {
                if (cancelOnChange) {
                    requestAbortController === null || requestAbortController === void 0 ? void 0 : requestAbortController.abort();
                }
            }
        }
    }, [
        url,
        auto,
        cancelOnChange,
        (0, utils_1.serialize)(id),
        (0, utils_1.serialize)(optionsConfig),
        resolvedKey,
    ]);
    var resolvedData = react_1.default.useMemo(function () { return data; }, [rawJSON]);
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
            (_a = internal_1.abortControllers[resolvedKey]) === null || _a === void 0 ? void 0 : _a.abort();
            if (loading) {
                setError(null);
                internal_1.hasErrors[resolvedKey] = null;
                setLoading(false);
                setData(requestCache);
                internal_1.requestEmitter.emit(resolvedKey, {
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
exports.useFetcher.get = (0, utils_1.createRequestFn)("GET", "", {});
exports.useFetcher.delete = (0, utils_1.createRequestFn)("DELETE", "", {});
exports.useFetcher.head = (0, utils_1.createRequestFn)("HEAD", "", {});
exports.useFetcher.options = (0, utils_1.createRequestFn)("OPTIONS", "", {});
exports.useFetcher.post = (0, utils_1.createRequestFn)("POST", "", {});
exports.useFetcher.put = (0, utils_1.createRequestFn)("PUT", "", {});
exports.useFetcher.patch = (0, utils_1.createRequestFn)("PATCH", "", {});
exports.useFetcher.purge = (0, utils_1.createRequestFn)("PURGE", "", {});
exports.useFetcher.link = (0, utils_1.createRequestFn)("LINK", "", {});
exports.useFetcher.unlink = (0, utils_1.createRequestFn)("UNLINK", "", {});
