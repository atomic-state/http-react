/**
 * @license http-react-fetcher
 * Copyright (c) Dany Beltran
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FetcherExtendConfig } from "./shared";
/**
 * Fetcher object
 */
export declare const fetcher: {
    (): void;
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
     * Extend the fetcher object
     */
    extend({ baseUrl, headers, body, resolver, }?: FetcherExtendConfig): {
        (): void;
        config: {
            baseUrl: string;
            headers: object | Headers;
            body: any;
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
    };
};
