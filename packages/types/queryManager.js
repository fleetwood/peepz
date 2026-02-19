/**
 * Domain constants for the QueryManager
 *
 * These constants represent the primary domains in the system
 * and should be used instead of string literals when registering
 * query keys with domains.
 */
/**
* Primary domains in the system
*/
export var QueryDomainEnum;
(function (QueryDomainEnum) {
    QueryDomainEnum["ADMIN"] = "ADMIN";
    QueryDomainEnum["APP"] = "APP";
    QueryDomainEnum["USER"] = "USER";
    QueryDomainEnum["CHAT"] = "CHAT";
    QueryDomainEnum["CONTENT"] = "CONTENT";
    QueryDomainEnum["EVENTS"] = "EVENTS";
    QueryDomainEnum["FAMILIES"] = "FAMILIES";
    QueryDomainEnum["MEMBERS"] = "MEMBERS";
    QueryDomainEnum["NOTIFS"] = "NOTIFS";
    QueryDomainEnum["PARTIES"] = "PARTIES";
    QueryDomainEnum["PERSONS"] = "PERSONS";
    QueryDomainEnum["POSTS"] = "POSTS";
    QueryDomainEnum["STRIPE"] = "STRIPE";
})(QueryDomainEnum || (QueryDomainEnum = {}));
/**
* Subdomains representing intersections of primary domains
*/
export var QuerySubdomainEnum;
(function (QuerySubdomainEnum) {
    QuerySubdomainEnum["DETAIL"] = "DETAIL";
    QuerySubdomainEnum["FEED"] = "FEED";
    QuerySubdomainEnum["LIST"] = "LIST";
    QuerySubdomainEnum["MEMBERS_FEED"] = "MEMBERS_FEED";
    QuerySubdomainEnum["MESSAGES"] = "MESSAGES";
    QuerySubdomainEnum["PERMISSIONS"] = "PERMISSIONS";
    QuerySubdomainEnum["POSTS_FEED"] = "POSTS_FEED";
    QuerySubdomainEnum["STATS"] = "STATS";
})(QuerySubdomainEnum || (QuerySubdomainEnum = {}));
