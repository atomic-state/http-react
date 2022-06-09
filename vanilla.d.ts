/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
 * Fetcher object
 */
export declare const fetcher: {
    (): void;
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
        (): void;
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
 * Basic HttpClient
 */
export declare function createHttpClient(url: string): HttpClient;
export {};
