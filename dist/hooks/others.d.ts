import { FetcherConfigType, FetcherConfigTypeNoUrl, ImperativeFetcher } from '../types';
/**
 * Get the current fetcher config
 */
export declare function useFetcherConfig(id?: string): any;
/**
 * Get the data state of a request using its id
 */
export declare function useFetcherData<ResponseType = any, VT = any>(id: ResponseType extends {
    value: ResponseType;
    variables: VT;
    errors?: any[];
} ? {
    value: ResponseType;
    variables: VT;
    errors?: any[];
} : string | number | object, onResolve?: (data: typeof id extends {
    variables: any;
} ? {
    data: (Required<typeof id> & {
        value: ResponseType;
        variables: VT;
    })['value'];
    variables: (Required<typeof id> & {
        value: ResponseType;
        variables: VT;
    })['variables'];
} : ResponseType) => void): ResponseType;
export declare function useFetcherCode(id: any): number;
/**
 * Get the loading state of a request using its id
 */
export declare function useFetcherLoading(id: any): boolean;
/**
 * Get the error state of a request using its id
 */
export declare function useFetcherError(id: any, onError?: (err?: any) => void): Error | null;
/**
 * Get the mutate the request data using its id
 */
export declare function useFetcherMutate<T = any>(
/**
 * The id of the `useFetch` call
 */
id: any, 
/**
 * The function to run after mutating
 */
onMutate?: (data: T, 
/**
 * An imperative version of `useFetcher`
 */
fetcher: ImperativeFetcher) => void): (update: T | ((prev: T) => T), callback?: ((data: T, fetcher: ImperativeFetcher) => void) | undefined) => T;
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
    mutate: (update: ResponseType | ((prev: ResponseType) => ResponseType), callback?: ((data: ResponseType, fetcher: ImperativeFetcher) => void) | undefined) => ResponseType;
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
    response: import("../types").CustomResponse<ResponseType>;
    id: any;
    key: string;
};
/**
 * Create an effect for when the request completes
 */
export declare function useResolve<ResponseType = any, VT = any>(id: ResponseType extends {
    variables: any;
} ? string | number | object : {
    value: ResponseType;
    variables: VT;
    errors?: any[];
}, onResolve: (data: typeof id extends {
    variables: any;
} ? {
    data: (Required<typeof id> & {
        value: ResponseType;
    })['value'];
    variables: (Required<typeof id> & {
        variables: VT;
    })['variables'];
    errors: (Required<typeof id> & {
        errors?: any[];
    })['errors'];
} : ResponseType) => void): void;
/**
 * User a `GET` request
 */
export declare function useGET<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use a `DELETE` request
 */
export declare function useDELETE<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use a `HEAD` request
 */
export declare function useHEAD<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use an `OPTIONS` request
 */
export declare function useOPTIONS<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use a `POST` request
 */
export declare function usePOST<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use a `PUT` request
 */
export declare function usePUT<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use a `PATCH` request
 */
export declare function usePATCH<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use a `PURGE` request
 */
export declare function usePURGE<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use a `LINK` request
 */
export declare function useLINK<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Use an `UNLINK` request
 */
export declare function useUNLINK<FetchDataType = any, BodyType = any>(init: FetcherConfigType<FetchDataType, BodyType> | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType>): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Get a blob of the response. You can pass an `objectURL` property that will convet that blob into a string using `URL.createObjectURL`
 */
export declare function useFetcherBlob<FetchDataType = string, BodyType = any>(init: (FetcherConfigType<FetchDataType, BodyType> & {
    objectURL?: boolean;
}) | string, options?: FetcherConfigTypeNoUrl<FetchDataType, BodyType> & {
    objectURL?: boolean;
}): {
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
    response: import("../types").CustomResponse<FetchDataType>;
    id: any;
    key: string;
};
/**
 * Get a text of the response
 */
export declare function useFetcherText<FetchDataType = string, BodyType = any>(init: FetcherConfigType<string, BodyType> | string, options?: FetcherConfigTypeNoUrl<string, BodyType>): {
    data: string;
    loading: boolean;
    error: Error | null;
    online: boolean;
    code: number;
    reFetch: () => Promise<void>;
    mutate: (update: string | ((prev: string) => string), callback?: ((data: string, fetcher: ImperativeFetcher) => void) | undefined) => string;
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
    response: import("../types").CustomResponse<string>;
    id: any;
    key: string;
};
/**
 * Make a graphQL request
 */
export declare function useGql<T = any, VT = {
    [k: string]: any;
}>(arg1: undefined | {
    value: T;
    variables: VT;
}, cfg?: FetcherConfigTypeNoUrl<T, any> & {
    /**
     * GraphQL variables
     */
    variables?: typeof arg1 extends undefined ? VT : (typeof arg1 & {
        value: T;
        variables: VT;
    })['variables'];
    /**
     * Override the GraphQL path
     *
     * (default is `'/graphql'`)
     */
    graphqlPath?: string;
}): Omit<{
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
        data: T;
        errors: any[];
        variables: VT;
    };
};
/**
 * Use an imperative version of the fetcher (similarly to Axios, it returns an object with `get`, `post`, etc)
 */
export declare function useImperative(): ImperativeFetcher;
