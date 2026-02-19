import { type FetchAuthConfig, type FetchOptions, type FetchResponse } from '@peeps/types';
export declare class FetchBase {
    private config;
    private logger;
    constructor(config: FetchAuthConfig);
    configure(config: Partial<FetchAuthConfig>): void;
    private resolveUrl;
    private handleResponse;
    private buildHeaders;
    fetch<T = any>(url: string, options?: FetchOptions): Promise<FetchResponse<T>>;
    post<T = any, B = any>(url: string, body: B, options?: FetchOptions): Promise<FetchResponse<T>>;
    patch<T = any, B = any>(url: string, body: B, options?: FetchOptions): Promise<FetchResponse<T>>;
    put<T = any, B = any>(url: string, body: B, options?: FetchOptions): Promise<FetchResponse<T>>;
    delete<T = any, B = any>(url: string, body?: B, options?: FetchOptions): Promise<FetchResponse<T>>;
    postForm<T = any>(url: string, options?: FetchOptions & {
        body?: string;
    }): Promise<FetchResponse<T>>;
}
//# sourceMappingURL=FetchBase.d.ts.map