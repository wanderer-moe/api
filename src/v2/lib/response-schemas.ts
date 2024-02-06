import { z } from "zod"
import type { createRoute } from "@hono/zod-openapi"

// 400
export const BadRequestSchema = z.object({
    success: z.literal(false),
    message: z.string(),
})

// 500
export const InternalServerErrorSchema = z.object({
    success: z.literal(false),
    message: z.string(),
})

// 401
export const UnauthorizedSchema = z.object({
    success: z.literal(false),
    message: z.string(),
})

// 403
export const ForbiddenSchema = z.object({
    success: z.literal(false),
    message: z.string(),
})

// 404
export const NotFoundSchema = z.object({
    success: z.literal(false),
    message: z.string(),
})

type MockRoute =
    ReturnType<typeof createRoute> extends { responses: infer R } ? R : never

export type GenericResponsesType = {
    [K in keyof MockRoute]: MockRoute[K]
}

export const openAPIResponseHeaders = z.object({
    "Access-Control-Allow-Origin": z.string().openapi({
        example: "*",
        description: "The origin of the request",
    }),
    "Access-Control-Allow-Credentials": z.string().openapi({
        example: "true",
        description: "Whether or not the request can include credentials",
    }),
    "X-Ratelimit-Limit": z.string().openapi({
        example: "100",
        description:
            "The maximum number of requests that the consumer is permitted to make",
    }),
    "X-Ratelimit-Remaining": z.string().openapi({
        example: "99",
        description:
            "The number of requests remaining in the current rate limit window",
    }),
    "X-Ratelimit-Reset": z.string().openapi({
        example: "59",
        description: "The time at which the current rate limit window resets",
    }),
    "X-Ratelimit-Policy": z.string().openapi({
        example: "rate-limit-100-60",
        description: "The policy used to rate limit the request",
    }),
})

// while not all routes will utilize every one of these responses - i consolidated them here for comprehensive error handling lol
export const GenericResponses = {
    400: {
        description: "Bad request",
        content: {
            "application/json": {
                schema: BadRequestSchema,
            },
        },
    },
    401: {
        description: "Unauthorized",
        content: {
            "application/json": {
                schema: UnauthorizedSchema,
            },
        },
    },
    403: {
        description: "Forbidden",
        content: {
            "application/json": {
                schema: ForbiddenSchema,
            },
        },
    },
    429: {
        description: "Rate limited",
        content: {
            "application/json": {
                schema: BadRequestSchema,
            },
        },
    },
    500: {
        description: "Internal server error",
        content: {
            "application/json": {
                schema: InternalServerErrorSchema,
            },
        },
    },
}
