import { CustomResponse, FetcherConfigType, FetcherConfigTypeNoUrl, ImperativeFetcher } from "../types";
/**
 * Fetcher hook
 */
export declare const useFetcher: {
    <FetchDataType = any, BodyType = any>(init: string | FetcherConfigType<FetchDataType, BodyType>, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType> | undefined): {
        data: FetchDataType;
        loading: boolean;
        error: Error | null;
        online: boolean;
        code: number;
        reFetch: () => Promise<void>;
        mutate: (update: FetchDataType | ((prev: FetchDataType) => FetchDataType), callback?: ((data: FetchDataType, fetcher: ImperativeFetcher) => void) | undefined) => FetchDataType;
        fetcher: ImperativeFetcher;
        abort: () => void;
        config: {
            baseUrl?: string | undefined;
            method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | undefined;
            headers?: object | Headers | undefined;
            query?: any;
            params?: any;
            body?: BodyType | undefined;
            formatBody?: boolean | ((b: BodyType) => any) | undefined;
        } & {
            baseUrl: string;
            url: string;
            rawUrl: string;
        };
        response: CustomResponse<FetchDataType>;
        id: any;
        key: string;
    };
    get: import("../types").RequestWithBody;
    delete: import("../types").RequestWithBody;
    head: import("../types").RequestWithBody;
    options: import("../types").RequestWithBody;
    post: import("../types").RequestWithBody;
    put: import("../types").RequestWithBody;
    patch: import("../types").RequestWithBody;
    purge: import("../types").RequestWithBody;
    link: import("../types").RequestWithBody;
    unlink: import("../types").RequestWithBody;
};
