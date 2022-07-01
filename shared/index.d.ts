export declare type CustomResponse<T> = Omit<Response, "json"> & {
    json(): Promise<T>;
};
export declare type RequestWithBody = <R = any, BodyType = any>(url: string, reqConfig?: {
    default?: R;
    config?: {
        query?: any;
        formatBody?(b: BodyType): any;
        headers?: any;
        body?: BodyType;
    };
    resolver?: (r: CustomResponse<R>) => any;
    onError?(error: Error): void;
    onResolve?(data: R, res: CustomResponse<R>): void;
}) => Promise<{
    error: any;
    data: R;
    config: any;
    code: number;
    res: CustomResponse<R>;
}>;
/**
 * Creates a new request function. This is for usage with fetcher and fetcher.extend
 */
export declare function createRequestFn(method: string, baseUrl: string, $headers: any, q?: any): RequestWithBody;
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
