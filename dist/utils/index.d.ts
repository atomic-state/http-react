/// <reference types="node" />
import { CacheStoreType, FetcherContextType, ImperativeFetcher, RequestWithBody, FetcherInit } from '../types';
export declare const windowExists: boolean;
export declare function isDefined(target: any): boolean;
export declare function isFunction(target: any): boolean;
export declare function hasBaseUrl(target: string): boolean;
export declare function jsonCompare(a: any, b: any): boolean;
export declare function serialize(input: any): string;
export declare function merge(...objects: any): any;
export declare const isFormData: (target: any) => boolean;
export declare function queue(callback: any, time?: number): NodeJS.Timeout;
/**
 *
 * @param str The target string
 * @param $params The params to parse in the url
 *
 * Params should be separated by `"/"`, (e.g. `"/api/[resource]/:id"`)
 *
 * URL search params will not be affected
 */
export declare function setURLParams(str?: string, $params?: any): string;
/**
 * Creates a new request function. This is for usage with fetcher and fetcher.extend
 */
export declare function createRequestFn(method: string, baseUrl: string, $headers: any, q?: any): RequestWithBody;
export declare const createImperativeFetcher: (ctx: FetcherContextType) => ImperativeFetcher;
/**
 * Revalidate requests that match an id or ids
 */
export declare function revalidate(id: any | any[]): void;
export declare function gql<T = any, VT = {
    [k: string]: any;
}>(...args: any): {
    value: T;
    variables: VT;
    baseUrl: string;
    graphqlPath: string;
    headers: {
        [key: string]: any;
    };
};
/**
 *
 * @param queries
 * @returns A hook that has full TypeScript support and offers autocomplete for every query passed
 */
export declare function queryProvider<R>(queries: {
    [e in keyof R]: R[e];
}, providerConfig?: {
    defaults?: {
        [key in keyof R]?: Partial<ReturnType<typeof gql<R[key]>>['value']>;
    };
    config?: {
        /**
         * The base url
         */
        baseUrl?: string;
        /**
         * Any aditional headers
         */
        headers?: {
            [key: string]: any;
        };
        /**
         * The caching mechanism
         */
        cache?: CacheStoreType;
    };
}): <P extends keyof R>(queryName: P, otherConfig?: (Omit<FetcherInit<{ [e in keyof R]: R[e]; }[P] extends {
    value: unknown;
    variables: unknown;
    baseUrl: string;
    graphqlPath: string;
    headers: {
        [key: string]: any;
    };
} ? { [e in keyof R]: R[e]; }[P]["value"] : any, any>, "url"> & {
    default?: ({ [e in keyof R]: R[e]; }[P] extends {
        value: unknown;
        variables: unknown;
        baseUrl: string;
        graphqlPath: string;
        headers: {
            [key: string]: any;
        };
    } ? { [e in keyof R]: R[e]; }[P]["value"] : any) | undefined;
    variables?: ({ [e in keyof R]: R[e]; }[P] extends {
        value: unknown;
        variables: unknown;
        baseUrl: string;
        graphqlPath: string;
        headers: {
            [key: string]: any;
        };
    } ? { [e in keyof R]: R[e]; }[P]["variables"] : any) | undefined;
    graphqlPath?: string | undefined;
}) | undefined) => Omit<Omit<{
    data: any;
    loading: boolean;
    error: Error | null;
    online: boolean;
    code: number;
    reFetch: () => Promise<void>;
    mutate: (update: any, callback?: ((data: any, fetcher: ImperativeFetcher) => void) | undefined) => any;
    fetcher: ImperativeFetcher;
    abort: () => void;
    config: {
        baseUrl?: string | undefined;
        method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
        headers?: object | Headers | undefined;
        query?: any;
        params?: any;
        body?: any;
        formatBody?: boolean | ((b: any) => any) | undefined;
    } & {
        baseUrl: string;
        url: string;
        rawUrl: string;
    };
    response: import("../types").CustomResponse<any>;
    id: any;
    key: string;
}, "data"> & {
    data: {
        data: { [e in keyof R]: R[e]; }[P] extends {
            value: unknown;
            variables: unknown;
            baseUrl: string;
            graphqlPath: string;
            headers: {
                [key: string]: any;
            };
        } ? { [e in keyof R]: R[e]; }[P]["value"] : any;
        errors: any[];
        variables: any;
    };
}, "data"> & {
    data: {
        data: { [e in keyof R]: R[e]; }[P] extends {
            value: unknown;
            variables: unknown;
            baseUrl: string;
            graphqlPath: string;
            headers: {
                [key: string]: any;
            };
        } ? { [e in keyof R]: R[e]; }[P]["value"] : any;
        errors?: any[] | undefined;
        variables: { [e in keyof R]: R[e]; }[P] extends {
            value: unknown;
            variables: unknown;
            baseUrl: string;
            graphqlPath: string;
            headers: {
                [key: string]: any;
            };
        } ? { [e in keyof R]: R[e]; }[P]["variables"] : any;
    };
};
/**
 * Force mutation in requests from anywhere. This doesn't revalidate requests
 */
export declare function mutateData(...pairs: [any, any | ((cache: any) => any), boolean?][]): void;
