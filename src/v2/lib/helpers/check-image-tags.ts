type ModerationResponse = {
    moderationLabels: {
        labels: {
            name: string
            confidence: number
        }[]
    }[]
}

export async function CheckLabels(
    ctx: APIContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: any // yolo
): Promise<boolean> {
    if (ctx.env.ENVIRONMENT === "DEV") return

    try {
        const res = await fetch(
            "https://aws-moderation.dromzeh.workers.dev/labels",
            {
                method: "POST",
                body: image,
                headers: {
                    Authorization: `Bearer ${ctx.env.REKOGNITION_LABEL_API_KEY}`,
                },
            }
        )

        if (res.status !== 200) {
            throw new Error("Failed to check image labels")
        }

        const data = (await res.json()) as ModerationResponse

        return data.moderationLabels.length > 0
    } catch (error) {
        throw new Error("Failed to check image labels")
    }
}
