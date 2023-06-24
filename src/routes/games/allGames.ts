import { listBucket } from "@/lib/listBucket";
import { responseHeaders } from "@/lib/responseHeaders";
import { unwantedPrefixes } from "@/middleware/unwantedPrefixes";

export const allGames = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const games = await listBucket(env.bucket, {
        prefix: "",
        delimiter: "/",
    });

    // console.log(games.objects);

    const gameList = games.delimitedPrefixes
        .filter((game) => !unwantedPrefixes.includes(game))
        .map((game) => {
            return {
                name: game.replace("/", ""),
            };
        });
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
