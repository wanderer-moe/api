import { responseHeaders } from "@/v2/lib/responseHeaders"
import { listBucket } from "@/v2/lib/listBucket"
import { createNotFoundResponse } from "@/v2/lib/helpers/responses/notFoundResponse"

export async function getGeneratorFromName(c: APIContext): Promise<Response> {
    const { gameName } = c.req.param()
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const files = await listBucket(c.env.bucket, {
        prefix: `oc-generators/${gameName}/list.json`,
    })

    if (files.objects.length === 0)
        return createNotFoundResponse(c, "Generator not found", responseHeaders)

    const data = await fetch(
        `https://files.wanderer.moe/${files.objects[0].key}`
    )

    const generatorData = await data.json()

    response = c.json(
        {
            status: "ok",
            data: generatorData,
        },
        200,
        responseHeaders
    )

    response.headers.set("Cache-Control", "s-maxage=604800") // the content of this file is unlikely to change, so caching is fine
    await cache.put(cacheKey, response.clone())

    return response
}
