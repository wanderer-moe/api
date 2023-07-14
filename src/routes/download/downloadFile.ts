import { responseHeaders } from "@/lib/responseHeaders";
import type { Asset } from "@/lib/types/asset";
import { getConnection } from "@/lib/planetscale";

export const downloadFile = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const id = url.pathname.split("/")[2];

    if (!id || isNaN(parseInt(id))) {
        throw new Error("No ID provided");
    }

    const db = await getConnection(env);

    const row = await db
        .execute("SELECT * FROM assets WHERE id = ?", [id])
        .then((row) => row.rows[0] as Asset | undefined);

    console.log(row);

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

    const response = await fetch(`https://cdn.wanderer.moe/${row.url}`);
    const headers = new Headers(response.headers);
    headers.set("Content-Disposition", `attachment; filename="${row.name}"`);
    const blob = await response.blob();

    await db.execute(
        "UPDATE assets SET download_count = download_count + 1 WHERE id = ?",
        [id]
    );

    return new Response(blob, {
        headers: headers,
    });
};