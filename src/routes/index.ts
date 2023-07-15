import { responseHeaders } from "@/lib/responseHeaders";

const routes: string[] = [
    "/search[?query=''&tags=''&game=''&asset='']",
    "/user/[username]",
    "/user/s/[search]",
    "/recent",
    "/asset/[assetId]",
    "/download/[assetId]",
    "/discord/contributors",
    "/games",
    "/oc-generators",
    "/oc-generator/[gameId]",
];

export const index = async (): Promise<Response> => {
    return new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            path: "/",
            description:
                "Please read the API documentation on the site/github repository if you're unsure how to use this API.",
            routes,
        }),
        {
            headers: responseHeaders,
        }
    );
};
