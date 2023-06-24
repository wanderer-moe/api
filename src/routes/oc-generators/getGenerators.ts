import { responseHeaders } from "@/lib/responseHeaders";
import type { Generator } from "@/lib/types/ocGenerator";

export const getGenerators = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const row: D1Result<Generator> = await env.database
        .prepare(`SELECT * FROM ocGenerators`)
        .run();

    const results = row.results.map((result) => ({
        name: result.name,
        path: `/oc-generator/${result.name}`,
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
