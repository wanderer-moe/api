import type { Context } from "hono"

export type EmailData = {
    to: string
    from: string
    subject: string
    html: string
}

export class Resend {
    private context: Context

    constructor(context: Context) {
        this.context = context
    }

    async sendEmail(emailData: EmailData): Promise<Response> {
        const response = await fetch(`https://api.resend.com/emails`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.context.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({ ...emailData }),
        })

        const contentType = response.headers.get("content-type") || ""

        if (contentType.includes("application/json")) {
            const responseBody = JSON.stringify(await response.json())
            return new Response(responseBody, {
                headers: {
                    "content-type": "application/json",
                },
            })
        } else {
            const responseBody = await response.text()
            return new Response(responseBody, {
                headers: {
                    "content-type": contentType,
                },
            })
        }
    }
}
