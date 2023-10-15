import { auth } from "@/v2/lib/auth/lucia"
import { z } from "zod"

const CreateAccountSchema = z
    .object({
        username: z
            .string({
                required_error: "Username is required",
                invalid_type_error: "Username must be a string",
            })
            .min(3, "Username must be at least 3 characters long")
            .max(32, "Username must be at most 32 characters long"),
        email: z
            .string({
                required_error: "Email is required",
                invalid_type_error: "Email must be a string",
            })
            .email("Email must be a valid email address"),
        password: z
            .string({
                required_error: "Password is required",
                invalid_type_error: "Password must be a string",
            })
            .regex(
                new RegExp(".*[A-Z].*"),
                "One uppercase character is required"
            )
            .regex(
                new RegExp(".*[a-z].*"),
                "One lowercase character is required"
            )
            .regex(new RegExp(".*\\d.*"), "One number is required")
            .regex(
                new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
                "One special character is required"
            )
            .min(8, "Password must be at least 8 characters long")
            .max(128, "Password must be at most 128 characters long"),
        passwordConfirm: z
            .string({
                required_error: "Password confirmation is required",
                invalid_type_error: "Password confirmation must be a string",
            })
            .regex(
                new RegExp(".*[A-Z].*"),
                "One uppercase character is required"
            )
            .regex(
                new RegExp(".*[a-z].*"),
                "One lowercase character is required"
            )
            .regex(new RegExp(".*\\d.*"), "One number")
            .regex(
                new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
                "One special character is required"
            )
            .min(8, "Password must be at least 8 characters long")
            .max(128, "Password must be at most 128 characters long"),
        secretKey: z
            .string({
                required_error: "Secret key is required",
                invalid_type_error: "Secret key must be a string",
            })
            .min(1, "Secret key must be at least 1 characters long")
            .max(128, "Secret key must be at most 128 characters long"),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "Passwords do not match",
        path: ["passwordConfirm"],
    })

export async function signup(c: APIContext): Promise<Response> {
    const formData = CreateAccountSchema.safeParse(await c.req.formData())

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { username, email, password } = formData.data

    const validSession = await auth(c.env).handleRequest(c).validate()
    if (validSession)
        return c.json({ success: false, state: "already logged in" }, 200)

    console.log("creating user")

    try {
        const user = await auth(c.env).createUser({
            key: {
                providerId: "username",
                providerUserId: username.toLowerCase(),
                password,
            },
            attributes: {
                username,
                display_name: username,
                email,
                email_verified: 0,
                date_joined: new Date().toISOString(),
                verified: 0,
                role_flags: 1,
                is_contributor: 0,
                self_assignable_role_flags: null,
                username_colour: null,
                avatar_url: null,
                banner_url: null,
                pronouns: null, // we can splice this into possesive, subject, and object pronouns by "/", e.g "he/him/his" => {subject: "he", object: "him", possesive: "his"}
                bio: "No bio set",
            },
        })

        const userAgent = c.req.header("user-agent") ?? ""
        const countryCode = c.req.header("cf-ipcountry") ?? ""
        const ipAddress = c.req.header("cf-connecting-ip") ?? ""

        // TODO: encrypt session attributes with sha256
        const newSession = await auth(c.env).createSession({
            userId: user.userId,
            attributes: {
                country_code: countryCode,
                user_agent: userAgent,
                ip_address: ipAddress,
            },
        })

        const authRequest = auth(c.env).handleRequest(c)
        authRequest.setSession(newSession)
        return c.json({ success: true, state: "logged in" }, 200)
    } catch (e) {
        console.log(e)
        return c.json(
            {
                success: false,
                status: "error",
                error: "Error creating user",
            },
            500
        )
    }
}
