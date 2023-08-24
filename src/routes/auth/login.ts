import { auth } from "@/lib/auth/lucia"
// import * as validate from "@/lib/regex/accountValidation";

const usernameThrottling = new Map<
    string,
    {
        timeoutUntil: number
        timeoutSeconds: number
    }
>()

export async function login(c): Promise<Response> {
    const formData = await c.req.formData()

    const username = formData.get("username") as string
    const password = formData.get("password") as string
    // console.log(username, password);

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

    const userAgent = c.req.headers.get("user-agent") ?? ""
    const countryCode = c.req.headers.get("cf-ipcountry") ?? ""

    const newSession = await auth(c.env).createSession({
        userId: user.userId,
        attributes: {
            country_code: countryCode,
            user_agent: userAgent,
        },
    })

    console.log("valid session created", countryCode, userAgent)

    const authRequest = await auth(c.env).handleRequest(c)
    authRequest.setSession(newSession)

    return c.json({ success: true, state: "logged in" }, 200)
}
