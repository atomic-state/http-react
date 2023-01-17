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
exports.useImperative = exports.useGql = exports.useFetcherText = exports.useFetcherBlob = exports.useUNLINK = exports.useLINK = exports.usePURGE = exports.usePATCH = exports.usePUT = exports.usePOST = exports.useOPTIONS = exports.useHEAD = exports.useDELETE = exports.useGET = exports.useResolve = exports.useFetcherId = exports.useFetcherMutate = exports.useFetcherError = exports.useFetcherLoading = exports.useFetcherCode = exports.useFetcherData = exports.useFetcherConfig = void 0;
var react_1 = __importStar(require("react"));
var internal_1 = require("../internal");
var use_fetcher_1 = require("./use-fetcher");
var utils_1 = require("../utils");
/**
 * Get the current fetcher config
 */
function useFetcherConfig(id) {
    var ftxcf = (0, internal_1.useHRFContext)();
    var config = (0, use_fetcher_1.useFetcher)({ id: id }).config;
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
    return (0, utils_1.isDefined)(id) ? config : ftxcf;
}
exports.useFetcherConfig = useFetcherConfig;
/**
 * Get the data state of a request using its id
 */
function useFetcherData(id, onResolve) {
    var _a = (0, internal_1.useHRFContext)().cache, cache = _a === void 0 ? internal_1.defaultCache : _a;
    var defaultsKey = (0, utils_1.serialize)({
        idString: (0, utils_1.serialize)(id)
    });
    var def = cache.get(defaultsKey);
    var data = (0, use_fetcher_1.useFetcher)({
        default: def,
        id: id
    }).data;
    useResolve(id, onResolve);
    return data;
}
exports.useFetcherData = useFetcherData;
function useFetcherCode(id) {
    var code = (0, use_fetcher_1.useFetcher)({
        id: id
    }).code;
    return code;
}
exports.useFetcherCode = useFetcherCode;
/**
 * Get the loading state of a request using its id
 */
function useFetcherLoading(id) {
    var idString = (0, utils_1.serialize)({ idString: (0, utils_1.serialize)(id) });
    var data = (0, use_fetcher_1.useFetcher)({
        id: id
    }).data;
    return !(0, utils_1.isDefined)(internal_1.runningRequests[idString])
        ? true
        : internal_1.runningRequests[idString];
}
exports.useFetcherLoading = useFetcherLoading;
/**
 * Get the error state of a request using its id
 */
function useFetcherError(id, onError) {
    var error = (0, use_fetcher_1.useFetcher)({
        id: id,
        onError: onError
    }).error;
    return error;
}
exports.useFetcherError = useFetcherError;
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
    var mutate = (0, use_fetcher_1.useFetcher)({
        id: id,
        onMutate: onMutate
    }).mutate;
    return mutate;
}
exports.useFetcherMutate = useFetcherMutate;
/**
 * Get everything from a `useFetcher` call using its id
 */
function useFetcherId(id) {
    var defaultsKey = (0, utils_1.serialize)({
        idString: (0, utils_1.serialize)(id)
    });
    var def = internal_1.fetcherDefaults[defaultsKey];
    return (0, use_fetcher_1.useFetcher)({
        id: id,
        default: def
    });
}
exports.useFetcherId = useFetcherId;
/**
 * Create an effect for when the request completes
 */
function useResolve(id, onResolve) {
    var defaultsKey = (0, utils_1.serialize)({
        idString: (0, utils_1.serialize)(id)
    });
    (0, react_1.useEffect)(function () {
        function resolve(v) {
            return __awaiter(this, void 0, void 0, function () {
                var isResolved, data;
                return __generator(this, function (_a) {
                    isResolved = v.isResolved, data = v.data;
                    if (isResolved) {
                        if ((0, utils_1.isFunction)(onResolve)) {
                            onResolve(data);
                        }
                    }
                    return [2 /*return*/];
                });
            });
        }
        internal_1.requestEmitter.addListener(defaultsKey, resolve);
        return function () {
            internal_1.requestEmitter.removeListener(defaultsKey, resolve);
        };
    }, [defaultsKey, onResolve]);
}
exports.useResolve = useResolve;
/**
 * User a `GET` request
 */
function useGET(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'GET' }) }));
}
exports.useGET = useGET;
/**
 * Use a `DELETE` request
 */
function useDELETE(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'DELETE' }) }));
}
exports.useDELETE = useDELETE;
/**
 * Use a `HEAD` request
 */
function useHEAD(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'HEAD' }) }));
}
exports.useHEAD = useHEAD;
/**
 * Use an `OPTIONS` request
 */
function useOPTIONS(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'OPTIONS' }) }));
}
exports.useOPTIONS = useOPTIONS;
/**
 * Use a `POST` request
 */
function usePOST(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'POST' }) }));
}
exports.usePOST = usePOST;
/**
 * Use a `PUT` request
 */
function usePUT(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'PUT' }) }));
}
exports.usePUT = usePUT;
/**
 * Use a `PATCH` request
 */
function usePATCH(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'PATCH' }) }));
}
exports.usePATCH = usePATCH;
/**
 * Use a `PURGE` request
 */
function usePURGE(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'PURGE' }) }));
}
exports.usePURGE = usePURGE;
/**
 * Use a `LINK` request
 */
function useLINK(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'LINK' }) }));
}
exports.useLINK = useLINK;
/**
 * Use an `UNLINK` request
 */
function useUNLINK(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { config: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.config), { method: 'UNLINK' }) }));
}
exports.useUNLINK = useUNLINK;
/**
 * Get a blob of the response. You can pass an `objectURL` property that will convet that blob into a string using `URL.createObjectURL`
 */
function useFetcherBlob(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { resolver: function (res) {
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
/**
 * Get a text of the response
 */
function useFetcherText(init, options) {
    return (0, use_fetcher_1.useFetcher)(init, __assign(__assign({}, options), { resolver: function (res) {
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
/**
 * Make a graphQL request
 */
function useGql(arg1, cfg) {
    if (cfg === void 0) { cfg = {}; }
    var isUsingExternalQuery = typeof arg1.value === 'string';
    var query;
    if (isUsingExternalQuery) {
        query = arg1.value;
    }
    else {
        query = arg1[0][0];
    }
    var _a = cfg.variables, variables = _a === void 0 ? {} : _a, _b = cfg.graphqlPath, graphqlPath = _b === void 0 ? internal_1.DEFAULT_GRAPHQL_PATH : _b, otherArgs = __rest(cfg, ["variables", "graphqlPath"]);
    var _c = otherArgs.config, config = _c === void 0 ? {} : _c;
    var JSONBody = (0, utils_1.serialize)({
        query: query,
        variables: variables
    });
    var usingProvider = (0, utils_1.isDefined)(cfg['__fromProvider']);
    var g = (0, use_fetcher_1.useFetcher)(__assign(__assign(__assign(__assign(__assign({ url: graphqlPath, id: arg1 }, { variables: cfg.variables || {} }), otherArgs), { default: usingProvider
            ? otherArgs.default
            : {
                data: cfg === null || cfg === void 0 ? void 0 : cfg.default,
                errors: undefined,
                variables: cfg.variables || {}
            } }), { __gql: true }), { config: __assign(__assign({}, config), { formatBody: function () { return JSONBody; }, body: JSONBody, method: 'POST' }) }));
    return g;
}
exports.useGql = useGql;
/**
 * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
 */
function useImperative() {
    var ctx = useFetcherConfig();
    var imperativeFetcher = react_1.default.useMemo(function () { return (0, utils_1.createImperativeFetcher)(ctx); }, [(0, utils_1.serialize)(ctx)]);
    return imperativeFetcher;
}
exports.useImperative = useImperative;
