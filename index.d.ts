/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react";
declare type CustomResponse<T> = Omit<Response, "json"> & {
    json(): Promise<T>;
};
declare type RequestWithBody = <R = any, BodyType = any>(
/**
 * The request url
 */
url: string, 
/**
 * The request configuration
 */
reqConfig?: {
    /**
     * Default value
     */
    default?: R;
    /**
     * Other configuration
     */
    config?: {
        /**
         * Request query
         */
        query?: any;
        /**
         * The function that formats the body
         */
        formatBody?(b: BodyType): any;
        /**
         * Request headers
         */
        headers?: any;
        /**
         * Request params (like Express)
         */
        params?: any;
        /**
         * The request body
         */
        body?: BodyType;
    };
    /**
     * The function that returns the resolved data
     */
    resolver?: (r: CustomResponse<R>) => any;
    /**
     * A function that will run when the request fails
     */
    onError?(error: Error): void;
    /**
     * A function that will run when the request completes succesfuly
     */
    onResolve?(data: R, res: CustomResponse<R>): void;
}) => Promise<{
    error: any;
    data: R;
    config: any;
    code: number;
    res: CustomResponse<R>;
}>;
export declare type CacheStoreType = {
    get(k?: any): any;
    set(k?: any, v?: any): any;
    delete(k?: any): any;
};
declare type FetcherContextType = {
    headers?: any;
    baseUrl?: string;
    body?: object | FormData;
    /**
     * Keys in `defaults` are just friendly names. Defaults are based on the `id` and `value` passed
     */
    defaults?: {
        [key: string]: {
            /**
             * The `id` passed to the request
             */
            id?: any;
            /**
             * Default value for this request
             */
            value?: any;
            config?: any;
        };
    };
    resolver?: (r: Response) => any;
    children?: any;
    auto?: boolean;
    memory?: boolean;
    refresh?: number;
    attempts?: number;
    attemptInterval?: number;
    revalidateOnFocus?: boolean;
    query?: any;
    params?: any;
    onOnline?: (e: {
        cancel: () => void;
    }) => void;
    onOffline?: () => void;
    online?: boolean;
    retryOnReconnect?: boolean;
    cache?: CacheStoreType;
};
declare type FetcherType<FetchDataType, BodyType> = {
    /**
     * Any serializable id. This is optional.
     */
    id?: any;
    /**
     * url of the resource to fetch
     */
    url?: string;
    /**
     * Default data value
     */
    default?: FetchDataType;
    /**
     * Refresh interval (in seconds) to re-fetch the resource
     */
    refresh?: number;
    /**
     * This will prevent automatic requests.
     * By setting this to `false`, requests will
     * only be made by calling `reFetch()`
     */
    auto?: boolean;
    /**
     * Default is true. Responses are saved in memory and used as default data.
     * If `false`, the `default` prop will be used instead.
     */
    memory?: boolean;
    /**
     * Function to run when request is resolved succesfuly
     */
    onResolve?: (data: FetchDataType, req?: Response) => void;
    /**
     * Function to run when the request fails
     */
    onError?: (error: Error, req?: Response) => void;
    /**
     * Function to run when a request is aborted
     */
    onAbort?: () => void;
    /**
     * @deprecated - Use the `abort` function to cancel a request instead
     *
     * Whether a change in deps will cancel a queued request and make a new one
     */
    cancelOnChange?: boolean;
    /**
     * Parse as json by default
     */
    resolver?: (d: CustomResponse<FetchDataType>) => any;
    /**
     * The ammount of attempts if request fails
     */
    attempts?: number;
    /**
     * The interval at which to run attempts on request fail
     */
    attemptInterval?: number;
    /**
     * If a request should be made when the tab is focused. This currently works on browsers
     */
    revalidateOnFocus?: boolean;
    /**
     * This will run when connection is interrupted
     */
    onOffline?: () => void;
    /**
     * This will run when connection is restored
     */
    onOnline?: (e: {
        cancel: () => void;
    }) => void;
    /**
     * If the request should retry when connection is restored
     */
    retryOnReconnect?: boolean;
    /**
     * Request configuration
     */
    config?: {
        /**
         * Override base url
         */
        baseUrl?: string;
        /**
         * Request method
         */
        method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK";
        headers?: Headers | object;
        query?: any;
        /**
         * URL params
         */
        params?: any;
        body?: BodyType;
        /**
         * Customize how body is formated for the request. By default it will be sent in JSON format
         * but you can set it to false if for example, you are sending a `FormData`
         * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
         * (the last one is the default behaviour so in that case you can ignore it)
         */
        formatBody?: boolean | ((b: BodyType) => any);
    };
    children?: React.FC<{
        data: FetchDataType | undefined;
        error: Error | null;
        loading: boolean;
    }>;
};
declare type FetcherConfigOptions<FetchDataType, BodyType = any> = {
    /**
     * Any serializable id. This is optional.
     */
    id?: any;
    /**
     * Default data value
     */
    default?: FetchDataType;
    /**
     * Refresh interval (in seconds) to re-fetch the resource
     */
    refresh?: number;
    /**
     * This will prevent automatic requests.
     * By setting this to `false`, requests will
     * only be made by calling `reFetch()`
     */
    auto?: boolean;
    /**
     * Default is true. Responses are saved in memory and used as default data.
     * If `false`, the `default` prop will be used instead.
     */
    memory?: boolean;
    /**
     * Function to run when request is resolved succesfuly
     */
    onResolve?: (data: FetchDataType) => void;
    /**
     * Function to run when the request fails
     */
    onError?: (error: Error) => void;
    /**
     * Function to run when a request is aborted
     */
    onAbort?: () => void;
    /**
     * @deprecated Use the `abort` function to cancel a request instead
     *
     * Whether a change in deps will cancel a queued request and make a new one
     */
    cancelOnChange?: boolean;
    /**
     * Parse as json by default
     */
    resolver?: (d: CustomResponse<FetchDataType>) => any;
    /**
     * The ammount of attempts if request fails
     */
    attempts?: number;
    /**
     * The interval at which to run attempts on request fail
     */
    attemptInterval?: number;
    /**
     * If a request should be made when the tab is focused. This currently works on browsers
     */
    revalidateOnFocus?: boolean;
    /**
     * This will run when connection is interrupted
     */
    onOffline?: () => void;
    /**
     * This will run when connection is restored
     */
    onOnline?: (e: {
        cancel: () => void;
    }) => void;
    /**
     * If the request should retry when connection is restored
     */
    retryOnReconnect?: boolean;
    /**
     * Request configuration
     */
    config?: {
        /**
         * Override base url
         */
        baseUrl?: string;
        /**
         * Request method
         */
        method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK";
        headers?: Headers | object;
        /**
         * Request query params
         */
        query?: any;
        /**
         * URL params
         */
        params?: any;
        body?: BodyType;
        /**
         * Customize how body is formated for the request. By default it will be sent in JSON format
         * but you can set it to false if for example, you are sending a `FormData`
         * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
         * (the last one is the default behaviour so in that case you can ignore it)
         */
        formatBody?: (b: BodyType) => any;
    };
    children?: React.FC<{
        data: FetchDataType | undefined;
        error: Error | null;
        loading: boolean;
    }>;
};
export declare function FetcherConfig(props: FetcherContextType): JSX.Element;
/**
 * Revalidate requests that match an id or ids
 */
export declare function revalidate(id: any | any[]): void;
/**
 * Force mutation in requests from anywhere. This doesn't revalidate requests
 */
export declare function mutateData(...pairs: [any, any | ((cache: any) => any), boolean?][]): void;
/**
 * Get the current fetcher config
 */
export declare function useFetcherConfig(): FetcherContextType;
/**
 * Get the data state of a request using its id
 */
export declare function useFetcherData<T = any>(id: any): T;
/**
 * Get the loading state of a request using its id
 */
export declare function useFetcherLoading(id: any): boolean;
/**
 * Get the error state of a request using its id
 */
export declare function useFetcherError(id: any): Error | null;
/**
 * Get everything from a `useFetcher` call using its id
 */
export declare function useFetcherId<ResponseType = any, BodyType = any>(id: any): {
    data: ResponseType;
    loading: boolean;
    error: Error | null;
    online: boolean;
    code: number;
    reFetch: () => Promise<void>;
    mutate: React.Dispatch<React.SetStateAction<ResponseType>>;
    abort: () => void;
    config: {
        /**
         * Override base url
         */
        baseUrl?: string | undefined;
        /**
         * Request method
         */
        method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
        headers?: object | Headers | undefined;
        query?: any;
        /**
         * URL params
         */
        params?: any;
        body?: BodyType | undefined;
        /**
         * Customize how body is formated for the request. By default it will be sent in JSON format
         * but you can set it to false if for example, you are sending a `FormData`
         * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
         * (the last one is the default behaviour so in that case you can ignore it)
         */
        formatBody?: boolean | ((b: BodyType) => any) | undefined;
    } & {
        url: string;
        rawUrl: string;
    };
    response: CustomResponse<ResponseType>;
    id: any;
    key: string;
};
export { useFetcher as useFetch, useFetcherLoading as useLoading, useFetcherConfig as useConfig, useFetcherData as useData, useFetcherError as useError, useFetcherId as useFetchId, };
/**
 * Create a configuration object to use in a 'useFetcher' call
 */
export declare type FetcherInit<FDT = any, BT = any> = FetcherConfigOptions<FDT, BT> & {
    url?: string;
};
/**
 * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
 */
export declare function useImperative(): {
    get: RequestWithBody;
    delete: RequestWithBody;
    head: RequestWithBody;
    options: RequestWithBody;
    post: RequestWithBody;
    put: RequestWithBody;
    patch: RequestWithBody;
    purge: RequestWithBody;
    link: RequestWithBody;
    unlink: RequestWithBody;
};
/**
 * Fetcher hook
 */
declare const useFetcher: {
    <FetchDataType = any, BodyType = any>(init: string | FetcherType<FetchDataType, BodyType>, options?: FetcherConfigOptions<FetchDataType, BodyType> | undefined): {
        data: FetchDataType;
        loading: boolean;
        error: Error | null;
        online: boolean;
        code: number;
        reFetch: () => Promise<void>;
        mutate: React.Dispatch<React.SetStateAction<FetchDataType>>;
        abort: () => void;
        config: {
            /**
             * Override base url
             */
            baseUrl?: string | undefined;
            /**
             * Request method
             */
            method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
            headers?: object | Headers | undefined;
            query?: any;
            /**
             * URL params
             */
            params?: any;
            body?: BodyType | undefined;
            /**
             * Customize how body is formated for the request. By default it will be sent in JSON format
             * but you can set it to false if for example, you are sending a `FormData`
             * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
             * (the last one is the default behaviour so in that case you can ignore it)
             */
            formatBody?: boolean | ((b: BodyType) => any) | undefined;
        } & {
            url: string;
            rawUrl: string;
        };
        response: CustomResponse<FetchDataType>;
        id: any;
        key: string;
    };
    get: RequestWithBody;
    delete: RequestWithBody;
    head: RequestWithBody;
    options: RequestWithBody;
    post: RequestWithBody;
    put: RequestWithBody;
    patch: RequestWithBody;
    purge: RequestWithBody;
    link: RequestWithBody;
    unlink: RequestWithBody;
    /**
     * Extend the useFetcher hook
     */
    extend(props?: FetcherContextType): {
        <T, BodyType_1 = any>(init: string | FetcherType<T, BodyType_1>, options?: FetcherConfigOptions<T, BodyType_1> | undefined): {
            data: T;
            loading: boolean;
            error: Error | null;
            online: boolean;
            code: number;
            reFetch: () => Promise<void>;
            mutate: React.Dispatch<React.SetStateAction<T>>;
            abort: () => void;
            config: {
                /**
                 * Override base url
                 */
                baseUrl?: string | undefined;
                /**
                 * Request method
                 */
                method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
                headers?: object | Headers | undefined;
                query?: any;
                /**
                 * URL params
                 */
                params?: any;
                body?: BodyType_1 | undefined;
                /**
                 * Customize how body is formated for the request. By default it will be sent in JSON format
                 * but you can set it to false if for example, you are sending a `FormData`
                 * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
                 * (the last one is the default behaviour so in that case you can ignore it)
                 */
                formatBody?: boolean | ((b: BodyType_1) => any) | undefined;
            } & {
                url: string;
                rawUrl: string;
            };
            response: CustomResponse<T>;
            id: any;
            key: string;
        };
        config: {
            baseUrl: any;
            headers: any;
            body: object;
            query: any;
        };
        get: RequestWithBody;
        delete: RequestWithBody;
        head: RequestWithBody;
        options: RequestWithBody;
        post: RequestWithBody;
        put: RequestWithBody;
        patch: RequestWithBody;
        purge: RequestWithBody;
        link: RequestWithBody;
        unlink: RequestWithBody;
        Config: typeof FetcherConfig;
    };
};
export { useFetcher };
export declare const fetcher: {
    <FetchDataType = any, BodyType = any>(init: string | FetcherType<FetchDataType, BodyType>, options?: FetcherConfigOptions<FetchDataType, BodyType> | undefined): {
        data: FetchDataType;
        loading: boolean;
        error: Error | null;
        online: boolean;
        code: number;
        reFetch: () => Promise<void>;
        mutate: React.Dispatch<React.SetStateAction<FetchDataType>>;
        abort: () => void;
        config: {
            /**
             * Override base url
             */
            baseUrl?: string | undefined;
            /**
             * Request method
             */
            method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
            headers?: object | Headers | undefined;
            query?: any;
            /**
             * URL params
             */
            params?: any;
            body?: BodyType | undefined;
            /**
             * Customize how body is formated for the request. By default it will be sent in JSON format
             * but you can set it to false if for example, you are sending a `FormData`
             * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
             * (the last one is the default behaviour so in that case you can ignore it)
             */
            formatBody?: boolean | ((b: BodyType) => any) | undefined;
        } & {
            url: string;
            rawUrl: string;
        };
        response: CustomResponse<FetchDataType>;
        id: any;
        key: string;
    };
    get: RequestWithBody;
    delete: RequestWithBody;
    head: RequestWithBody;
    options: RequestWithBody;
    post: RequestWithBody;
    put: RequestWithBody;
    patch: RequestWithBody;
    purge: RequestWithBody;
    link: RequestWithBody;
    unlink: RequestWithBody;
    /**
     * Extend the useFetcher hook
     */
    extend(props?: FetcherContextType): {
        <T, BodyType_1 = any>(init: string | FetcherType<T, BodyType_1>, options?: FetcherConfigOptions<T, BodyType_1> | undefined): {
            data: T;
            loading: boolean;
            error: Error | null;
            online: boolean;
            code: number;
            reFetch: () => Promise<void>;
            mutate: React.Dispatch<React.SetStateAction<T>>;
            abort: () => void;
            config: {
                /**
                 * Override base url
                 */
                baseUrl?: string | undefined;
                /**
                 * Request method
                 */
                method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
                headers?: object | Headers | undefined;
                query?: any;
                /**
                 * URL params
                 */
                params?: any;
                body?: BodyType_1 | undefined;
                /**
                 * Customize how body is formated for the request. By default it will be sent in JSON format
                 * but you can set it to false if for example, you are sending a `FormData`
                 * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
                 * (the last one is the default behaviour so in that case you can ignore it)
                 */
                formatBody?: boolean | ((b: BodyType_1) => any) | undefined;
            } & {
                url: string;
                rawUrl: string;
            };
            response: CustomResponse<T>;
            id: any;
            key: string;
        };
        config: {
            baseUrl: any;
            headers: any;
            body: object;
            query: any;
        };
        get: RequestWithBody;
        delete: RequestWithBody;
        head: RequestWithBody;
        options: RequestWithBody;
        post: RequestWithBody;
        put: RequestWithBody;
        patch: RequestWithBody;
        purge: RequestWithBody;
        link: RequestWithBody;
        unlink: RequestWithBody;
        Config: typeof FetcherConfig;
    };
};
interface IRequestParam {
    headers?: any;
    body?: any;
    /**
     * Customize how body is formated for the request. By default it will be sent in JSON format
     * but you can set it to false if for example, you are sending a `FormData`
     * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
     * (the last one is the default behaviour so in that case you can ignore it)
     */
    formatBody?: boolean | ((b: any) => any);
}
declare type requestType = <T>(path: string, data: IRequestParam) => Promise<T>;
interface IHttpClient {
    baseUrl: string;
    get: requestType;
    post: requestType;
    put: requestType;
    delete: requestType;
}
/**
 * Basic HttpClient
 */
declare class HttpClient implements IHttpClient {
    baseUrl: string;
    get<T>(path: string, { headers, body }?: IRequestParam, method?: string): Promise<T>;
    post<T>(path: string, props?: IRequestParam): Promise<T>;
    put<T>(path: string, props?: IRequestParam): Promise<T>;
    delete<T>(path: string, props?: IRequestParam): Promise<T>;
    constructor(url: string);
}
/**
 * @deprecated - Use the fetcher instead
 *
 * Basic HttpClient
 */
export declare function createHttpClient(url: string): HttpClient;
