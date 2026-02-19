import { ZodSchema } from 'zod';
import { PaginationParams } from './paginated.response';
/**
 * Validation source options for validating data from different sources in the request.
 * Used in the {@link ServerResponse.validate} method.
 * @enum
 *
 */
export declare enum ValidationSourceEnum {
    /**
     * #### BODY
     * Validates the request body, used for POST and PUT requests.
     */
    BODY = "body",
    /**
     * #### PARAMS
     * Validates the request parameters where the route is dynamic.
     *
     * *e.g. route: /api/posts/`[id]`*
     */
    PARAMS = "params",
    /**
     * #### QUERY
     * Validates the request query parameters.
     *
     * * *e.g. route: /api/posts`?id=foo`*
     */
    QUERY = "query",
    /**
     * #### FORM
     * Validates the request form data.
     */
    FORM = "form"
}
export type AuthContext = {
    accessToken?: string | null;
    authUserId?: string | null;
    email?: string | null;
};
export type RouteType = 'public' | 'authenticated' | 'unauthenticated' | 'webhook';
/**
 * Webhook verification function type
 * Generic request type - can be NextRequest, Express Request, etc.
 */
export type WebhookVerifier = (req: any) => Promise<void>;
/**
 * Webhook provider configuration
 */
export type WebhookProvider = {
    name: string;
    verify: WebhookVerifier;
};
export type ChainContext = AuthContext & {
    validatedData?: any;
    pagination?: PaginationParams;
    streamToken?: string;
    body?: any;
    routeType?: RouteType;
    authRequired?: boolean;
    webhookProvider?: string;
};
export type ChainHandler<T> = (context: ChainContext) => Promise<T>;
type ValidateParamsBase<T> = {
    schema: ZodSchema<T>;
};
type ValidateParamsWithPattern<T> = ValidateParamsBase<T> & {
    source: ValidationSourceEnum.PARAMS;
    pattern: string;
};
type ValidateParamsWithoutPattern<T> = ValidateParamsBase<T> & {
    source: Exclude<ValidationSourceEnum, ValidationSourceEnum.PARAMS>;
    pattern?: never;
};
export type ValidateParams<T> = ValidateParamsWithPattern<T> | ValidateParamsWithoutPattern<T>;
export type ServiceResult<T = unknown> = {
    error?: unknown;
    result?: T;
    status: number;
};
export {};
//# sourceMappingURL=response.types.d.ts.map