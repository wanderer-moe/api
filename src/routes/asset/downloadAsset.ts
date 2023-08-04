import { responseHeaders } from "@/lib/responseHeaders";
import type { Asset } from "@/lib/types/asset";
import { getConnection } from "@/lib/planetscale";
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse";

export const downloadAsset = async (c) => {
    const { assetId } = c.req.param();

    const db = await getConnection(c.env);

    const row = await db
        .execute("SELECT * FROM assets WHERE id = ?", [assetId])
        .then((row) => row.rows[0] as Asset | undefined);

    if (!row)
        return createNotFoundResponse("Asset ID not found", responseHeaders);

    const response = await fetch(
        `https://files.wanderer.moe/assets/${row.url}`
    );
    const headers = new Headers(response.headers);
    headers.set("Content-Disposition", `attachment; filename="${row.name}"`);
    const blob = await response.blob();

    await db.execute(
        "UPDATE assets SET download_count = download_count + 1 WHERE id = ?",
        [assetId]
    );

    return new Response(blob, {
        headers: headers,
    });
};
