import { responseHeaders } from "@/lib/responseHeaders";
import { listBucket } from "@/lib/listBucket";

export const getGenerators = async (c) => {
    const cacheKey = new Request(c.req.url.toString(), c.req);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    // listing all files inside of oc-generators subfolder, as they can't be manually inputted
    // by users but instead stored on the oc-generators repo
    const files = await listBucket(c.env.bucket, {
        prefix: "oc-generators/",
        delimiter: "/",
    });

    // console.log(files);

    const results = files.delimitedPrefixes.map((file) => {
        return {
            name: file.replace("oc-generators/", "").replace("/", ""),
            path: `/oc-generators/${file
                .replace("oc-generators/", "")
                .replace("/", "")}`,
        };
    });

    response = c.json(
        {
            status: "ok",
            data: results,
        },
        200,
        responseHeaders
    );

    response.headers.set("Cache-Control", "s-maxage=28800");
    await cache.put(cacheKey, response.clone());

    return response;
};
