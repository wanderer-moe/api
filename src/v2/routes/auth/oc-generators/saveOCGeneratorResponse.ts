import { auth } from "@/v2/lib/auth/lucia"
import { listBucket } from "@/v2/lib/listBucket"
import { savedOcGenerators } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { z } from "zod"
import type { OCGeneratorResponse as OCGeneratorRequestResponse } from "@/v2/lib/types/oc-generator"

// matches data from oc generator and random entries from oc generator to prevent mismatched data from being saved
function isValidOCGeneratorResponse(
    content: string,
    response: OCGeneratorRequestResponse
) {
    try {
        const parsedContent = JSON.parse(content)

        if (typeof parsedContent !== "object") return false

        for (const key of Object.keys(parsedContent)) {
            const foundOption = response.options.find(
                (option) => option.name === key
            )

            if (!foundOption || !Array.isArray(parsedContent[key])) return false

            if (
                !parsedContent[key].every((entry) =>
                    foundOption.entries.includes(entry)
                )
            )
                return false
        }

        return true
    } catch (error) {
        return false
    }
}

const SaveOCGeneratorResponseSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    game: z.string({
        required_error: "Game is required",
        invalid_type_error: "Game must be a string",
    }),
    isPublic: z.string({
        required_error: "isPublic is required",
        invalid_type_error: "isPublic must be a string",
    }),
    content: z.string({
        required_error: "Content is required",
        invalid_type_error: "Content must be a string",
    }),
})

export async function saveOCGeneratorResponse(
    c: APIContext
): Promise<Response> {
    const formData = SaveOCGeneratorResponseSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 401)
    }

    const { drizzle } = getConnection(c.env)

    // TODO: make sure data is actually valid before inserting it into the database
    const ocGeneratorResponse = {
        id: crypto.randomUUID(),
        userId: session.user.userId,
        name: formData.data.name,
        game: formData.data.game,
        dateCreated: new Date().toISOString(),
        isPublic: parseInt(formData.data.isPublic), // 1 = yes, 0 = no, default = 0
        content: formData.data.content, // this is stored as json, which can then be parsed
    }

    const files = await listBucket(c.env.FILES_BUCKET, {
        prefix: `oc-generators/${ocGeneratorResponse.game}/list.json`,
    })

    if (files.objects.length === 0)
        return c.json(
            { success: false, state: "no oc generators with name found" },
            200
        )

    const ResponseData = await fetch(
        `https://files.wanderer.moe/${files.objects[0].key}`
    ).then((res) => res.json() as Promise<OCGeneratorRequestResponse>)

    if (!isValidOCGeneratorResponse(ocGeneratorResponse.content, ResponseData))
        return c.json(
            { success: false, state: "invalid data attempted to be saved" },
            200
        )

    await drizzle.insert(savedOcGenerators).values(ocGeneratorResponse)

    return c.json({ success: true, state: "saved", ocGeneratorResponse }, 200)
}
