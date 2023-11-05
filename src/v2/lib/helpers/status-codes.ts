export class StatusCodes {
    static StatusCodes2XX = {
        OK: { code: 200, description: "OK" },
        CREATED: { code: 201, description: "Created" },
        NO_CONTENT: { code: 204, description: "No Content" },
    }

    static StatusCodes4XX = {
        BAD_REQUEST: { code: 400, description: "Bad Request" },
        UNAUTHORIZED: { code: 401, description: "Unauthorized" },
        FORBIDDEN: { code: 403, description: "Forbidden" },
        NOT_FOUND: { code: 404, description: "Not Found" },
        METHOD_NOT_ALLOWED: { code: 405, description: "Method Not Allowed" },
        TOO_MANY_REQUESTS: { code: 429, description: "Too Many Requests" },
    }

    static StatusCodes5XX = {
        INTERNAL_SERVER_ERROR: {
            code: 500,
            description: "Internal Server Error",
        },
        SERVICE_UNAVAILABLE: { code: 503, description: "Service Unavailable" },
        GATEWAY_TIMEOUT: { code: 504, description: "Gateway Timeout" },
    }

    static All = {
        ...StatusCodes.StatusCodes2XX,
        ...StatusCodes.StatusCodes4XX,
        ...StatusCodes.StatusCodes5XX,
    }
}
