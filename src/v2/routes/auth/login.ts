import { auth } from "@/v2/lib/auth/lucia"
import { z } from "zod"

const usernameThrottling = new Map<
    string,
    {
        timeoutUntil: number
        timeoutSeconds: number
    }
>()

const LoginSchema = z.object({
    username: z.string({
        required_error: "Username is required",
        invalid_type_error: "Username must be a string",
    }),
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
    }),
})

export async function login(c: APIContext): Promise<Response> {
    const formData = LoginSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        console.log(formData)
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { username, password } = formData.data

    const validSession = await auth(c.env).handleRequest(c).validate()
    if (validSession)
        return c.json({ success: false, state: "already logged in" }, 200)

    const storedThrottling = usernameThrottling.get(username)
    const timeoutUntil = storedThrottling?.timeoutUntil ?? 0

    if (timeoutUntil > Date.now()) {
        return c.json(
            {
                success: false,
                status: "error",
                error: `Too many login attempts -  wait ${
                    (timeoutUntil - Date.now()) / 1000
                } seconds`,
            },
            400
        )
    }

    const user = await auth(c.env).useKey(
        "username",
        username.toLowerCase(),
        password
    )

    if (!user) {
        const timeoutSeconds = storedThrottling
            ? storedThrottling.timeoutSeconds * 2
            : 1
        usernameThrottling.set(username, {
            timeoutUntil: Date.now() + timeoutSeconds * 1000,
            timeoutSeconds,
        })
        return c.json(
            {
                success: false,
                status: "error",
                error: `Invalid credentials -  wait ${timeoutSeconds} seconds`,
            },
            400
        )
    }

    const userAgent = c.req.header("user-agent") ?? ""
    const countryCode = c.req.header("cf-ipcountry") ?? ""
    const ipAddress = c.req.header("cf-connecting-ip") ?? ""

    const newSession = await auth(c.env).createSession({
        userId: user.userId,
        attributes: {
            country_code: countryCode,
            user_agent: userAgent,
            ip_address: ipAddress,
        },
    })

    console.log("valid session created", countryCode, userAgent)

    const authRequest = await auth(c.env).handleRequest(c)
    authRequest.setSession(newSession)

    return c.json({ success: true, state: "logged in" }, 200)
}
