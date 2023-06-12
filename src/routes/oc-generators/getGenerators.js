import { responseHeaders } from "../../lib/responseHeaders.js";
import { listBucket } from "../../lib/listBucket.js";

export const getGenerators = async (request, env) => {
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        return response;
    }

    const files = await listBucket(env.bucket, {
        prefix: "oc-generator/",
        delimiter: "/",
    });

    const locations = files.delimitedPrefixes.map((file) => ({
        name: file.replace("oc-generator/", "").replace("/", ""),
        path: `https://api.wanderer.moe/oc-generator/${file
            .replace("oc-generator/", "")
            .replace("/", "")}`,
    }));

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            path: "/oc-generators",
            locations,
        }),
        {
            headers: responseHeaders,
        }
    );

    await cache.put(cacheKey, response.clone());

    return response;
};
