import { responseHeaders } from "@/lib/responseHeaders";
import type { Asset } from "@/lib/types/asset";

export const downloadFile = async (
    request: Request,
    env: Env
): Promise<Response> => {
    let row: D1Result<Asset>;
    const url = new URL(request.url);
    const id = url.pathname.split("/")[2];
    // console.log(id);

    try {
        row = await env.database
            .prepare(`SELECT * FROM assets WHERE id = ?`)
            .bind(id)
            .run();
    } catch (e) {
        throw new Error(`Error getting asset from id`);
    }

    if (!row.results[0]) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "no_file",
            }),
            {
                status: 404,
                headers: responseHeaders,
            }
        );
    }

    await env.database
        .prepare(
            `UPDATE assets SET downloadCount = downloadCount + 1 WHERE id = ?`
        )
        .bind(id)
        .run();

    const response = await fetch(row.results[0].url);
    const headers = new Headers(response.headers);
    headers.set(
        "Content-Disposition",
        `attachment; filename="${row.results[0].name}"`
    );
    const blob = await response.blob();

    return new Response(blob, {
        headers: headers,
    });
};
