/**
* Error codes for the application
*
* Format: CD[Category][Code]
*
* Categories:
* - AUTH    : Authentication errors (1xxx)
* - DB      : Database errors (2xxx)
* - API     : API errors (3xxx)
* - VAL     : Validation errors (4xxx)
* - SYS     : System errors (5xxx)
* - EXT     : External service errors (6xxx)
*/
export declare enum ErrorCodeEnum {
    AUTH_REQUIRED = "CD1001",
    AUTH_INVALID_TOKEN = "CD1002",
    AUTH_EXPIRED_TOKEN = "CD1003",
    AUTH_INSUFFICIENT_PERMISSIONS = "CD1004",
    AUTH_USER_NOT_FOUND = "CD1005",
    AUTH_IDENTITY_LINK_REQUIRED = "CD1006",
    DB_CONNECTION_ERROR = "CD2001",
    DB_QUERY_ERROR = "CD2002",
    DB_RECORD_NOT_FOUND = "CD2003",
    DB_DUPLICATE_ENTRY = "CD2004",
    DB_TRANSACTION_ERROR = "CD2005",
    API_BAD_REQUEST = "CD3001",
    API_NOT_FOUND = "CD3002",
    API_METHOD_NOT_ALLOWED = "CD3003",
    API_RATE_LIMIT_EXCEEDED = "CD3004",
    API_INTERNAL_ERROR = "CD3005",
    API_SERVICE_UNAVAILABLE = "CD3006",
    VAL_INVALID_INPUT = "CD4001",
    VAL_REQUIRED_FIELD_MISSING = "CD4002",
    VAL_INVALID_FORMAT = "CD4003",
    VAL_CONSTRAINT_VIOLATION = "CD4004",
    SYS_INTERNAL_ERROR = "CD5001",
    SYS_CONFIGURATION_ERROR = "CD5002",
    SYS_DEPENDENCY_ERROR = "CD5003",
    SYS_FILE_SYSTEM_ERROR = "CD5004",
    EXT_SERVICE_UNAVAILABLE = "CD6001",
    EXT_REQUEST_FAILED = "CD6002",
    EXT_RESPONSE_ERROR = "CD6003",
    EXT_TIMEOUT = "CD6004",
    EXT_RATE_LIMIT = "CD6005"
}
/**
* Maps error codes to HTTP status codes
*/
export declare const errorCodeToStatusCode: Record<ErrorCodeEnum, number>;
/**
* Maps error codes to human-readable messages
*/
export declare const errorCodeToMessage: Record<ErrorCodeEnum, string>;
//# sourceMappingURL=errorCodes.d.ts.map