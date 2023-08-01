import { responseHeaders } from "@/lib/responseHeaders";
import { listBucket } from "@/lib/listBucket";
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse";

export const getGenerator = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const gameId = url.pathname.split("/")[2];

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    const files = await listBucket(env.bucket, {
        prefix: `oc-generators/${gameId}/list.json`,
    });

    if (files.objects.length === 0)
        return createNotFoundResponse("Generator not found", responseHeaders);

    const data = await fetch(
        `https://files.wanderer.moe/${files.objects[0].key}`
    );

    const generatorData = await data.json();

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            uploaded: files.objects[0].uploaded,
            key: files.objects[0].key,
            data: generatorData,
        }),
        {
            status: 200,
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=604800"); // the content of this file is unlikely to change, so caching is fine
    await cache.put(cacheKey, response.clone());

    return response;
};
