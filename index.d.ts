/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react";
declare type FetcherType<FetchDataType, BodyType> = {
    /**
     * url of the resource to fetch
     */
    url: string;
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
     * Whether a change in deps will cancel a queued request and make a new one
     */
    cancelOnChange?: boolean;
    /**
     * Parse as json by default
     */
    resolver?: (d: Response) => any;
    /**
     * Request configuration
     */
    config?: {
        /**
         * Request method
         */
        method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK";
        headers?: Headers | object;
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
     * Whether a change in deps will cancel a queued request and make a new one
     */
    cancelOnChange?: boolean;
    /**
     * Parse as json by default
     */
    resolver?: (d: Response) => any;
    /**
     * Request configuration
     */
    config?: {
        /**
         * Request method
         */
        method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK";
        headers?: Headers | object;
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
/**
 * @deprecated Use the `useFetcher` hook instead
 */
declare const Fetcher: <FetchDataType extends unknown>({ url, default: def, config, children: Children, onError, onResolve, refresh, }: FetcherType<FetchDataType, any>) => JSX.Element | null;
export default Fetcher;
declare type fetcherConfigComponentType = {
    children: any;
    defaults: any;
};
export declare function FetcherConfig({ children, defaults, }: fetcherConfigComponentType): any;
declare type RequestWithBody = <R = any, BodyType = any>(url: string, reqConfig?: {
    default?: R;
    config?: {
        formatBody?(b: BodyType): any;
        headers?: any;
        body?: BodyType;
    };
    resolver?: (r: Response) => any;
    onError?(error: Error): void;
    onResolve?(data: R, res: Response): void;
}) => Promise<{
    error: any;
    data: R;
    config: any;
    code: number;
    res: Response;
}>;
/**
 * Fetcher available as a hook
 */
export declare const useFetcher: {
    <FetchDataType extends unknown, BodyType = any>(init: string | FetcherType<FetchDataType, BodyType>, options?: FetcherConfigOptions<FetchDataType, BodyType> | undefined): {
        data: FetchDataType;
        loading: boolean;
        error: Error | null;
        code: number;
        reFetch: (c?: object | {
            headers?: any;
            body?: BodyType | undefined;
        } | undefined) => Promise<void>;
        mutate: React.Dispatch<React.SetStateAction<FetchDataType>>;
        abort: () => void;
        config: {
            /**
             * Request method
             */
            method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
            headers?: object | Headers | undefined;
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
        };
        response: Response;
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
    extend({ baseUrl, headers, body, resolver, }?: FetcherExtendConfig): {
        <T, BodyType_1 = any>(init: string | FetcherType<T, BodyType_1>, options?: FetcherConfigOptions<T, BodyType_1> | undefined): {
            data: T;
            loading: boolean;
            error: Error | null;
            code: number;
            reFetch: (c?: object | {
                headers?: any;
                body?: BodyType_1 | undefined;
            } | undefined) => Promise<void>;
            mutate: React.Dispatch<React.SetStateAction<T>>;
            abort: () => void;
            config: {
                /**
                 * Request method
                 */
                method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
                headers?: object | Headers | undefined;
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
            };
            response: Response;
        };
        config: {
            baseUrl: string;
            headers: object | Headers;
            body: any;
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
        Config({ children, defaults, }: fetcherConfigComponentType): any;
    };
};
declare type FetcherExtendConfig = {
    /**
     * Request base url
     */
    baseUrl?: string;
    /**
     * Headers to include in each request
     */
    headers?: Headers | object;
    /**
     * Body to include in each request (if aplicable)
     */
    body?: any;
    /**
     * Customize how body is formated for the next requests. By default it will be sent in JSON format but you can set it to false if for example, you are sending a `FormData`
     * body, or to `b => JSON.stringify(b)` for example, if you want to send JSON data
     * (the last one is the default behaviour so in that case you can ignore it)
     */
    formatBody?: (b: any) => any;
    /**
     * Custom resolver
     */
    resolver?: (d: Response) => any;
};
export declare const fetcher: {
    <FetchDataType extends unknown, BodyType = any>(init: string | FetcherType<FetchDataType, BodyType>, options?: FetcherConfigOptions<FetchDataType, BodyType> | undefined): {
        data: FetchDataType;
        loading: boolean;
        error: Error | null;
        code: number;
        reFetch: (c?: object | {
            headers?: any;
            body?: BodyType | undefined;
        } | undefined) => Promise<void>;
        mutate: React.Dispatch<React.SetStateAction<FetchDataType>>;
        abort: () => void;
        config: {
            /**
             * Request method
             */
            method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
            headers?: object | Headers | undefined;
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
        };
        response: Response;
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
    extend({ baseUrl, headers, body, resolver, }?: FetcherExtendConfig): {
        <T, BodyType_1 = any>(init: string | FetcherType<T, BodyType_1>, options?: FetcherConfigOptions<T, BodyType_1> | undefined): {
            data: T;
            loading: boolean;
            error: Error | null;
            code: number;
            reFetch: (c?: object | {
                headers?: any;
                body?: BodyType_1 | undefined;
            } | undefined) => Promise<void>;
            mutate: React.Dispatch<React.SetStateAction<T>>;
            abort: () => void;
            config: {
                /**
                 * Request method
                 */
                method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
                headers?: object | Headers | undefined;
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
            };
            response: Response;
        };
        config: {
            baseUrl: string;
            headers: object | Headers;
            body: any;
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
        Config({ children, defaults, }: fetcherConfigComponentType): any;
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
 * Creates a new HTTP client
 */
export declare function createHttpClient(url: string): HttpClient;
