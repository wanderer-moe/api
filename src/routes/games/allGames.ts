import { responseHeaders } from "@/lib/responseHeaders";
import { Game } from "@/lib/types/game";
import { listBucket } from "@/lib/listBucket";

export const allGames = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const row: D1Result<Game> = await env.database
        .prepare(`SELECT * FROM games`)
        .run();

    const gameList = await Promise.all(
        row.results.map(async (result) => ({
            name: result.name,
            id: result.id,
            assetCategories: await listBucket(env.bucket, {
                prefix: `${result.name}/`,
                delimiter: "/",
            }).then((data) =>
                data.delimitedPrefixes.map((prefix) =>
                    prefix.replace(`${result.name}/`, "").replace("/", "")
                )
            ),
        }))
    );

    return new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            results: gameList,
        }),
        {
            headers: responseHeaders,
        }
    );
};
