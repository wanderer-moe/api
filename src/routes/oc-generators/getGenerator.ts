import { responseHeaders } from "@/lib/responseHeaders";
import type { Generator } from "@/lib/types/ocGenerator";

export const getGenerator = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const gameId = url.pathname.split("/")[2];

    const row: D1Result<Generator> = await env.database
        .prepare(`SELECT * FROM ocGenerators WHERE name = ?`)
        .bind(gameId)
        .run();

    if (!row) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "404 Not Found",
            }),
            {
                headers: responseHeaders,
            }
        );
    }

    const results = row.results.map((result) => ({
        name: result.name,
        data: JSON.parse(result.data),
        uploadedBy: result.uploadedBy,
        uploadedDate: result.uploadedDate,
        verified: result.verified,
    }));

    return new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            results: results,
        }),
        {
            headers: responseHeaders,
        }
    );
};
