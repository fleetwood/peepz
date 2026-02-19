/**
 * Validation source options for validating data from different sources in the request.
 * Used in the {@link ServerResponse.validate} method.
 * @enum
 *
 */
export var ValidationSourceEnum;
(function (ValidationSourceEnum) {
    /**
     * #### BODY
     * Validates the request body, used for POST and PUT requests.
     */
    ValidationSourceEnum["BODY"] = "body";
    /**
     * #### PARAMS
     * Validates the request parameters where the route is dynamic.
     *
     * *e.g. route: /api/posts/`[id]`*
     */
    ValidationSourceEnum["PARAMS"] = "params";
    /**
     * #### QUERY
     * Validates the request query parameters.
     *
     * * *e.g. route: /api/posts`?id=foo`*
     */
    ValidationSourceEnum["QUERY"] = "query";
    /**
     * #### FORM
     * Validates the request form data.
     */
    ValidationSourceEnum["FORM"] = "form";
})(ValidationSourceEnum || (ValidationSourceEnum = {}));
