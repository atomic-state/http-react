"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHRFContext = exports.FetcherContext = exports.requestEmitter = exports.defaultCache = exports.urls = exports.cacheForMutation = exports.fetcherDefaults = exports.suspenseInitialized = exports.hasErrors = exports.abortControllers = exports.resolvedHookCalls = exports.resolvedRequests = exports.willSuspend = exports.valuesMemory = exports.previousProps = exports.previousConfig = exports.runningRequests = exports.DEFAULT_RESOLVER = exports.DEFAULT_GRAPHQL_PATH = void 0;
var react_1 = require("react");
var events_1 = __importDefault(require("events"));
// Constants
exports.DEFAULT_GRAPHQL_PATH = "/graphql";
var DEFAULT_RESOLVER = function (e) { return e.json(); };
exports.DEFAULT_RESOLVER = DEFAULT_RESOLVER;
/**
 * This marks which requests are running
 */
exports.runningRequests = {};
/**
 * Previous request configurations (useful for deduplication)
 */
exports.previousConfig = {};
exports.previousProps = {};
exports.valuesMemory = {};
/**
 * For Suspense
 */
exports.willSuspend = {};
exports.resolvedRequests = {};
exports.resolvedHookCalls = {};
exports.abortControllers = {};
/**
 * Request with errors
 */
exports.hasErrors = {};
/**
 * Suspense calls that resolved
 */
exports.suspenseInitialized = {};
/**
 * Defaults used as fallback data (works with SSR)
 */
exports.fetcherDefaults = {};
exports.cacheForMutation = {};
exports.urls = {};
/**
 * Default store cache
 */
exports.defaultCache = {
    get: function (k) {
        return exports.resolvedRequests[k];
    },
    set: function (k, v) {
        exports.resolvedRequests[k] = v;
    },
    delete: function (k) {
        delete exports.resolvedRequests[k];
    },
};
var createRequestEmitter = function () {
    var emitter = new events_1.default();
    emitter.setMaxListeners(10e10);
    return emitter;
};
exports.requestEmitter = createRequestEmitter();
var defaultContextVaue = {
    defaults: {},
    attempts: 0,
    // By default its 2 seconds
    attemptInterval: 2,
    revalidateOnFocus: false,
    query: {},
    params: {},
    onOffline: function () { },
    onOnline: function () { },
    online: true,
    retryOnReconnect: true,
    revalidateOnMount: true,
};
exports.FetcherContext = (0, react_1.createContext)(defaultContextVaue);
function useHRFContext() {
    return (0, react_1.useContext)(exports.FetcherContext);
}
exports.useHRFContext = useHRFContext;
