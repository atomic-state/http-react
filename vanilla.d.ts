/**
 * @license http-react
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export declare type CustomResponse<T> = Omit<Response, 'json'> & {
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
export declare type FetcherExtendConfig = {
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
    /**
     * Request query params
     */
    query?: any;
};
/**
 * Fetcher object
 */
declare const fetcher: {
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
     * Extend the fetcher object
     */
    extend({ baseUrl, headers, body, query, resolver }?: FetcherExtendConfig): {
        (): void;
        config: {
            baseUrl: string;
            headers: object | Headers;
            body: any;
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
    };
};
export { fetcher };
