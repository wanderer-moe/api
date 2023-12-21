import { z } from "zod"

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
    500: {
        description: "Internal server error",
        content: {
            "application/json": {
                schema: InternalServerErrorSchema,
            },
        },
    },
}
