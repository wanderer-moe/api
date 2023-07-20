import { responseHeaders } from "@/lib/responseHeaders";
import type { User } from "@/lib/types/user";
import type { Asset } from "@/lib/types/asset";
import { getConnection } from "@/lib/planetscale";
import { createNotFoundResponse } from "@/lib/helpers/responses/notFoundResponse";

export const getUserByUsername = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const name = url.pathname.split("/")[2];

    if (!name) throw new Error("No username provided");

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) return response;

    const db = await getConnection(env);

    const row = await db
        .execute("SELECT * FROM User WHERE username = ?", [name])
        .then((row) => row.rows[0] as User | undefined);

    const user = {
        id: row.id,
        username: row.username,
        avatar_url: row.avatar_url || null,
        banner_url: row.banner_url || null,
        bio: row.bio || null,
        pronouns: row.pronouns || null,
        verified: row.verified,
        date_joined: row.date_joined,
        roles: row.role,
    };

    const uploadedAssets = await db
        .execute(
            "SELECT * FROM assets WHERE uploaded_by = ? ORDER BY uploaded_date DESC LIMIT 5",
            [user.id]
        )
        .then((row) => row.rows as Asset[] | undefined)
        .then(
            (row) =>
                row?.map((asset) => {
                    return {
                        id: asset.id,
                        name: asset.name,
                        game: asset.game,
                        assetCategory: asset.asset_category,
                        url: asset.url,
                        tags: asset.tags,
                        status: asset.status,
                        uploadedBy: asset.uploaded_by,
                        uploadedDate: asset.uploaded_date,
                        fileSize: asset.file_size,
                    };
                })
        );

    if (!row) return createNotFoundResponse("User not found", responseHeaders);

    response = new Response(
        JSON.stringify({
            success: true,
            status: "ok",
            user,
            uploadedAssets,
        }),
        {
            headers: responseHeaders,
        }
    );

    response.headers.set("Cache-Control", "s-maxage=300");
    await cache.put(cacheKey, response.clone());

    return response;
};
