/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from "react";
import { CustomResponse } from "./shared";
declare type FetcherContextType = {
    headers?: any;
    baseUrl?: string;
    body?: object | FormData;
    defaults?: any;
    resolver?: (r: Response) => any;
    children?: any;
    auto?: boolean;
    memory?: boolean;
    refresh?: number;
    attempts?: number;
    attemptInterval?: number;
    revalidateOnFocus?: boolean;
};
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
export declare function FetcherConfig(props: FetcherContextType): JSX.Element;
/**
 * Fetcher available as a hook
 */
declare const useFetcher: {
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
             * Override base url
             */
            baseUrl?: string | undefined;
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
        response: CustomResponse<FetchDataType>;
    };
    get: import("./shared").RequestWithBody;
    delete: import("./shared").RequestWithBody;
    head: import("./shared").RequestWithBody;
    options: import("./shared").RequestWithBody;
    post: import("./shared").RequestWithBody;
    put: import("./shared").RequestWithBody;
    patch: import("./shared").RequestWithBody;
    purge: import("./shared").RequestWithBody;
    link: import("./shared").RequestWithBody;
    unlink: import("./shared").RequestWithBody;
    /**
     * Extend the useFetcher hook
     */
    extend(props?: FetcherContextType): {
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
                 * Override base url
                 */
                baseUrl?: string | undefined;
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
            response: CustomResponse<T>;
        };
        config: {
            baseUrl: any;
            headers: any;
            body: object;
        };
        get: import("./shared").RequestWithBody;
        delete: import("./shared").RequestWithBody;
        head: import("./shared").RequestWithBody;
        options: import("./shared").RequestWithBody;
        post: import("./shared").RequestWithBody;
        put: import("./shared").RequestWithBody;
        patch: import("./shared").RequestWithBody;
        purge: import("./shared").RequestWithBody;
        link: import("./shared").RequestWithBody;
        unlink: import("./shared").RequestWithBody;
        Config: typeof FetcherConfig;
    };
};
export { useFetcher };
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
             * Override base url
             */
            baseUrl?: string | undefined;
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
        response: CustomResponse<FetchDataType>;
    };
    get: import("./shared").RequestWithBody;
    delete: import("./shared").RequestWithBody;
    head: import("./shared").RequestWithBody;
    options: import("./shared").RequestWithBody;
    post: import("./shared").RequestWithBody;
    put: import("./shared").RequestWithBody;
    patch: import("./shared").RequestWithBody;
    purge: import("./shared").RequestWithBody;
    link: import("./shared").RequestWithBody;
    unlink: import("./shared").RequestWithBody;
    /**
     * Extend the useFetcher hook
     */
    extend(props?: FetcherContextType): {
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
                 * Override base url
                 */
                baseUrl?: string | undefined;
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
            response: CustomResponse<T>;
        };
        config: {
            baseUrl: any;
            headers: any;
            body: object;
        };
        get: import("./shared").RequestWithBody;
        delete: import("./shared").RequestWithBody;
        head: import("./shared").RequestWithBody;
        options: import("./shared").RequestWithBody;
        post: import("./shared").RequestWithBody;
        put: import("./shared").RequestWithBody;
        patch: import("./shared").RequestWithBody;
        purge: import("./shared").RequestWithBody;
        link: import("./shared").RequestWithBody;
        unlink: import("./shared").RequestWithBody;
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
