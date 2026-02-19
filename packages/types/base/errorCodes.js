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
export var ErrorCodeEnum;
(function (ErrorCodeEnum) {
    // Authentication Errors (1xxx)
    ErrorCodeEnum["AUTH_REQUIRED"] = "CD1001";
    ErrorCodeEnum["AUTH_INVALID_TOKEN"] = "CD1002";
    ErrorCodeEnum["AUTH_EXPIRED_TOKEN"] = "CD1003";
    ErrorCodeEnum["AUTH_INSUFFICIENT_PERMISSIONS"] = "CD1004";
    ErrorCodeEnum["AUTH_USER_NOT_FOUND"] = "CD1005";
    ErrorCodeEnum["AUTH_IDENTITY_LINK_REQUIRED"] = "CD1006";
    // Database Errors (2xxx)
    ErrorCodeEnum["DB_CONNECTION_ERROR"] = "CD2001";
    ErrorCodeEnum["DB_QUERY_ERROR"] = "CD2002";
    ErrorCodeEnum["DB_RECORD_NOT_FOUND"] = "CD2003";
    ErrorCodeEnum["DB_DUPLICATE_ENTRY"] = "CD2004";
    ErrorCodeEnum["DB_TRANSACTION_ERROR"] = "CD2005";
    // API Errors (3xxx)
    ErrorCodeEnum["API_BAD_REQUEST"] = "CD3001";
    ErrorCodeEnum["API_NOT_FOUND"] = "CD3002";
    ErrorCodeEnum["API_METHOD_NOT_ALLOWED"] = "CD3003";
    ErrorCodeEnum["API_RATE_LIMIT_EXCEEDED"] = "CD3004";
    ErrorCodeEnum["API_INTERNAL_ERROR"] = "CD3005";
    ErrorCodeEnum["API_SERVICE_UNAVAILABLE"] = "CD3006";
    // Validation Errors (4xxx)
    ErrorCodeEnum["VAL_INVALID_INPUT"] = "CD4001";
    ErrorCodeEnum["VAL_REQUIRED_FIELD_MISSING"] = "CD4002";
    ErrorCodeEnum["VAL_INVALID_FORMAT"] = "CD4003";
    ErrorCodeEnum["VAL_CONSTRAINT_VIOLATION"] = "CD4004";
    // System Errors (5xxx)
    ErrorCodeEnum["SYS_INTERNAL_ERROR"] = "CD5001";
    ErrorCodeEnum["SYS_CONFIGURATION_ERROR"] = "CD5002";
    ErrorCodeEnum["SYS_DEPENDENCY_ERROR"] = "CD5003";
    ErrorCodeEnum["SYS_FILE_SYSTEM_ERROR"] = "CD5004";
    // External Service Errors (6xxx)
    ErrorCodeEnum["EXT_SERVICE_UNAVAILABLE"] = "CD6001";
    ErrorCodeEnum["EXT_REQUEST_FAILED"] = "CD6002";
    ErrorCodeEnum["EXT_RESPONSE_ERROR"] = "CD6003";
    ErrorCodeEnum["EXT_TIMEOUT"] = "CD6004";
    ErrorCodeEnum["EXT_RATE_LIMIT"] = "CD6005";
})(ErrorCodeEnum || (ErrorCodeEnum = {}));
/**
* Maps error codes to HTTP status codes
*/
export const errorCodeToStatusCode = {
    // Authentication Errors
    [ErrorCodeEnum.AUTH_REQUIRED]: 401,
    [ErrorCodeEnum.AUTH_INVALID_TOKEN]: 401,
    [ErrorCodeEnum.AUTH_EXPIRED_TOKEN]: 401,
    [ErrorCodeEnum.AUTH_INSUFFICIENT_PERMISSIONS]: 403,
    [ErrorCodeEnum.AUTH_USER_NOT_FOUND]: 404,
    [ErrorCodeEnum.AUTH_IDENTITY_LINK_REQUIRED]: 409,
    // Database Errors
    [ErrorCodeEnum.DB_CONNECTION_ERROR]: 503,
    [ErrorCodeEnum.DB_QUERY_ERROR]: 500,
    [ErrorCodeEnum.DB_RECORD_NOT_FOUND]: 404,
    [ErrorCodeEnum.DB_DUPLICATE_ENTRY]: 409,
    [ErrorCodeEnum.DB_TRANSACTION_ERROR]: 500,
    // API Errors
    [ErrorCodeEnum.API_BAD_REQUEST]: 400,
    [ErrorCodeEnum.API_NOT_FOUND]: 404,
    [ErrorCodeEnum.API_METHOD_NOT_ALLOWED]: 405,
    [ErrorCodeEnum.API_RATE_LIMIT_EXCEEDED]: 429,
    [ErrorCodeEnum.API_INTERNAL_ERROR]: 500,
    [ErrorCodeEnum.API_SERVICE_UNAVAILABLE]: 503,
    // Validation Errors
    [ErrorCodeEnum.VAL_INVALID_INPUT]: 400,
    [ErrorCodeEnum.VAL_REQUIRED_FIELD_MISSING]: 400,
    [ErrorCodeEnum.VAL_INVALID_FORMAT]: 400,
    [ErrorCodeEnum.VAL_CONSTRAINT_VIOLATION]: 400,
    // System Errors
    [ErrorCodeEnum.SYS_INTERNAL_ERROR]: 500,
    [ErrorCodeEnum.SYS_CONFIGURATION_ERROR]: 500,
    [ErrorCodeEnum.SYS_DEPENDENCY_ERROR]: 500,
    [ErrorCodeEnum.SYS_FILE_SYSTEM_ERROR]: 500,
    // External Service Errors
    [ErrorCodeEnum.EXT_SERVICE_UNAVAILABLE]: 503,
    [ErrorCodeEnum.EXT_REQUEST_FAILED]: 502,
    [ErrorCodeEnum.EXT_RESPONSE_ERROR]: 502,
    [ErrorCodeEnum.EXT_TIMEOUT]: 504,
    [ErrorCodeEnum.EXT_RATE_LIMIT]: 429
};
/**
* Maps error codes to human-readable messages
*/
export const errorCodeToMessage = {
    // Authentication Errors
    [ErrorCodeEnum.AUTH_REQUIRED]: 'Authentication is required to access this resource',
    [ErrorCodeEnum.AUTH_INVALID_TOKEN]: 'The provided authentication token is invalid',
    [ErrorCodeEnum.AUTH_EXPIRED_TOKEN]: 'The authentication token has expired',
    [ErrorCodeEnum.AUTH_INSUFFICIENT_PERMISSIONS]: 'You do not have permission to access this resource',
    [ErrorCodeEnum.AUTH_USER_NOT_FOUND]: 'User not found',
    [ErrorCodeEnum.AUTH_IDENTITY_LINK_REQUIRED]: 'Account exists; explicit provider linking is required',
    // Database Errors
    [ErrorCodeEnum.DB_CONNECTION_ERROR]: 'Failed to connect to the database',
    [ErrorCodeEnum.DB_QUERY_ERROR]: 'Database query failed',
    [ErrorCodeEnum.DB_RECORD_NOT_FOUND]: 'The requested record was not found',
    [ErrorCodeEnum.DB_DUPLICATE_ENTRY]: 'A record with this information already exists',
    [ErrorCodeEnum.DB_TRANSACTION_ERROR]: 'Database transaction failed',
    // API Errors
    [ErrorCodeEnum.API_BAD_REQUEST]: 'The request was invalid or cannot be served',
    [ErrorCodeEnum.API_NOT_FOUND]: 'The requested resource was not found',
    [ErrorCodeEnum.API_METHOD_NOT_ALLOWED]: 'The HTTP method is not allowed for this resource',
    [ErrorCodeEnum.API_RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded, please try again later',
    [ErrorCodeEnum.API_INTERNAL_ERROR]: 'An internal server error occurred',
    [ErrorCodeEnum.API_SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable',
    // Validation Errors
    [ErrorCodeEnum.VAL_INVALID_INPUT]: 'The provided input is invalid',
    [ErrorCodeEnum.VAL_REQUIRED_FIELD_MISSING]: 'A required field is missing',
    [ErrorCodeEnum.VAL_INVALID_FORMAT]: 'The provided data format is invalid',
    [ErrorCodeEnum.VAL_CONSTRAINT_VIOLATION]: 'The provided data violates a constraint',
    // System Errors
    [ErrorCodeEnum.SYS_INTERNAL_ERROR]: 'An internal system error occurred',
    [ErrorCodeEnum.SYS_CONFIGURATION_ERROR]: 'System configuration error',
    [ErrorCodeEnum.SYS_DEPENDENCY_ERROR]: 'A system dependency is unavailable',
    [ErrorCodeEnum.SYS_FILE_SYSTEM_ERROR]: 'File system operation failed',
    // External Service Errors
    [ErrorCodeEnum.EXT_SERVICE_UNAVAILABLE]: 'An external service is unavailable',
    [ErrorCodeEnum.EXT_REQUEST_FAILED]: 'Request to external service failed',
    [ErrorCodeEnum.EXT_RESPONSE_ERROR]: 'Received an error response from external service',
    [ErrorCodeEnum.EXT_TIMEOUT]: 'Request to external service timed out',
    [ErrorCodeEnum.EXT_RATE_LIMIT]: 'External service rate limit exceeded'
};
