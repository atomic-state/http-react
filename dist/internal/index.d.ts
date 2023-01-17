/// <reference types="node" />
/// <reference types="react" />
import EventEmitter from "events";
import { CacheStoreType, FetcherContextType } from "../types";
export declare const DEFAULT_GRAPHQL_PATH = "/graphql";
export declare const DEFAULT_RESOLVER: (e: any) => any;
/**
 * This marks which requests are running
 */
export declare const runningRequests: any;
/**
 * Previous request configurations (useful for deduplication)
 */
export declare const previousConfig: any;
export declare const previousProps: any;
export declare const valuesMemory: any;
/**
 * For Suspense
 */
export declare const willSuspend: any;
export declare const resolvedRequests: any;
export declare const resolvedHookCalls: any;
export declare const abortControllers: any;
/**
 * Request with errors
 */
export declare const hasErrors: any;
/**
 * Suspense calls that resolved
 */
export declare const suspenseInitialized: any;
/**
 * Defaults used as fallback data (works with SSR)
 */
export declare const fetcherDefaults: any;
export declare const cacheForMutation: any;
export declare const urls: {
    [k: string]: {
        realUrl: string;
        rawUrl: string;
    };
};
/**
 * Default store cache
 */
export declare const defaultCache: CacheStoreType;
export declare const requestEmitter: EventEmitter;
export declare const FetcherContext: import("react").Context<FetcherContextType>;
export declare function useHRFContext(): FetcherContextType;
