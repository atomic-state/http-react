"use strict";
/**
 * @license http-react
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.mutateData = exports.queryProvider = exports.setURLParams = exports.gql = exports.SSRSuspense = exports.FetcherConfig = exports.useResolve = exports.useImperative = exports.useGql = exports.useUNLINK = exports.useText = exports.usePUT = exports.usePURGE = exports.usePOST = exports.usePATCH = exports.useOPTIONS = exports.useMutate = exports.useLoading = exports.useLINK = exports.useHEAD = exports.useGET = exports.useFetchId = exports.useError = exports.useDELETE = exports.useConfig = exports.useCode = exports.useBlob = exports.useData = exports.useFetch = exports.useFetcher = void 0;
var use_fetcher_1 = require("./hooks/use-fetcher");
Object.defineProperty(exports, "useFetcher", { enumerable: true, get: function () { return use_fetcher_1.useFetcher; } });
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "useFetch", { enumerable: true, get: function () { return hooks_1.useFetch; } });
Object.defineProperty(exports, "useData", { enumerable: true, get: function () { return hooks_1.useData; } });
Object.defineProperty(exports, "useBlob", { enumerable: true, get: function () { return hooks_1.useBlob; } });
Object.defineProperty(exports, "useCode", { enumerable: true, get: function () { return hooks_1.useCode; } });
Object.defineProperty(exports, "useConfig", { enumerable: true, get: function () { return hooks_1.useConfig; } });
Object.defineProperty(exports, "useDELETE", { enumerable: true, get: function () { return hooks_1.useDELETE; } });
Object.defineProperty(exports, "useError", { enumerable: true, get: function () { return hooks_1.useError; } });
Object.defineProperty(exports, "useFetchId", { enumerable: true, get: function () { return hooks_1.useFetchId; } });
Object.defineProperty(exports, "useGET", { enumerable: true, get: function () { return hooks_1.useGET; } });
Object.defineProperty(exports, "useHEAD", { enumerable: true, get: function () { return hooks_1.useHEAD; } });
Object.defineProperty(exports, "useLINK", { enumerable: true, get: function () { return hooks_1.useLINK; } });
Object.defineProperty(exports, "useLoading", { enumerable: true, get: function () { return hooks_1.useLoading; } });
Object.defineProperty(exports, "useMutate", { enumerable: true, get: function () { return hooks_1.useMutate; } });
Object.defineProperty(exports, "useOPTIONS", { enumerable: true, get: function () { return hooks_1.useOPTIONS; } });
Object.defineProperty(exports, "usePATCH", { enumerable: true, get: function () { return hooks_1.usePATCH; } });
Object.defineProperty(exports, "usePOST", { enumerable: true, get: function () { return hooks_1.usePOST; } });
Object.defineProperty(exports, "usePURGE", { enumerable: true, get: function () { return hooks_1.usePURGE; } });
Object.defineProperty(exports, "usePUT", { enumerable: true, get: function () { return hooks_1.usePUT; } });
Object.defineProperty(exports, "useText", { enumerable: true, get: function () { return hooks_1.useText; } });
Object.defineProperty(exports, "useUNLINK", { enumerable: true, get: function () { return hooks_1.useUNLINK; } });
Object.defineProperty(exports, "useGql", { enumerable: true, get: function () { return hooks_1.useGql; } });
Object.defineProperty(exports, "useImperative", { enumerable: true, get: function () { return hooks_1.useImperative; } });
Object.defineProperty(exports, "useResolve", { enumerable: true, get: function () { return hooks_1.useResolve; } });
var components_1 = require("./components");
Object.defineProperty(exports, "FetcherConfig", { enumerable: true, get: function () { return components_1.FetcherConfig; } });
Object.defineProperty(exports, "SSRSuspense", { enumerable: true, get: function () { return components_1.SSRSuspense; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "gql", { enumerable: true, get: function () { return utils_1.gql; } });
Object.defineProperty(exports, "setURLParams", { enumerable: true, get: function () { return utils_1.setURLParams; } });
Object.defineProperty(exports, "queryProvider", { enumerable: true, get: function () { return utils_1.queryProvider; } });
Object.defineProperty(exports, "mutateData", { enumerable: true, get: function () { return utils_1.mutateData; } });
Object.defineProperty(exports, "revalidate", { enumerable: true, get: function () { return utils_1.revalidate; } });
