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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetcherConfig = exports.SSRSuspense = void 0;
var react_1 = __importStar(require("react"));
var internal_1 = require("../internal");
var utils_1 = require("../utils");
/**
 * This is a wrapper around `Suspense`. It will render `fallback` during the first render and then leave the rendering to `Suspense`. If you are not using SSR, you should continue using the `Suspense` component.
 */
function SSRSuspense(_a) {
    var fallback = _a.fallback, children = _a.children;
    var _b = (0, react_1.useState)(true), ssr = _b[0], setSSR = _b[1];
    (0, react_1.useEffect)(function () {
        setSSR(false);
    }, []);
    // This will render the fallback in the server
    return (ssr ? fallback : react_1.default.createElement(react_1.Suspense, { fallback: fallback }, children));
}
exports.SSRSuspense = SSRSuspense;
function FetcherConfig(props) {
    var _a, _b, _c, _d, _e;
    var children = props.children, _f = props.defaults, defaults = _f === void 0 ? {} : _f, baseUrl = props.baseUrl, _g = props.suspense, suspense = _g === void 0 ? [] : _g;
    var previousConfig = (0, internal_1.useHRFContext)();
    var _h = previousConfig.cache, cache = _h === void 0 ? internal_1.defaultCache : _h;
    var base = !(0, utils_1.isDefined)(baseUrl)
        ? !(0, utils_1.isDefined)(previousConfig.baseUrl)
            ? ''
            : previousConfig.baseUrl
        : baseUrl;
    for (var defaultKey in defaults) {
        var id = defaults[defaultKey].id;
        var resolvedKey = (0, utils_1.serialize)((0, utils_1.isDefined)(id)
            ? {
                idString: (0, utils_1.serialize)(id)
            }
            : {
                uri: "".concat(base).concat(defaultKey),
                config: {
                    method: (_b = (_a = defaults[defaultKey]) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.method
                }
            });
        if ((0, utils_1.isDefined)(id)) {
            if (!(0, utils_1.isDefined)(internal_1.valuesMemory[resolvedKey])) {
                internal_1.valuesMemory[resolvedKey] = (_c = defaults[defaultKey]) === null || _c === void 0 ? void 0 : _c.value;
            }
            if (!(0, utils_1.isDefined)(internal_1.fetcherDefaults[resolvedKey])) {
                internal_1.fetcherDefaults[resolvedKey] = (_d = defaults[defaultKey]) === null || _d === void 0 ? void 0 : _d.value;
            }
        }
        if (!(0, utils_1.isDefined)(cache.get(resolvedKey))) {
            cache.set(resolvedKey, (_e = defaults[defaultKey]) === null || _e === void 0 ? void 0 : _e.value);
        }
    }
    for (var _i = 0, suspense_1 = suspense; _i < suspense_1.length; _i++) {
        var suspenseKey = suspense_1[_i];
        var key = (0, utils_1.serialize)({
            idString: (0, utils_1.serialize)(suspenseKey)
        });
        internal_1.willSuspend[key] = true;
    }
    var mergedConfig = __assign(__assign(__assign({}, previousConfig), props), { headers: __assign(__assign({}, previousConfig.headers), props.headers) });
    return (react_1.default.createElement(internal_1.FetcherContext.Provider, { value: mergedConfig }, children));
}
exports.FetcherConfig = FetcherConfig;
