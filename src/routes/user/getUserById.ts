import { responseHeaders } from "@/lib/responseHeaders";
import type { User } from "@/lib/types/user";
import type { Asset } from "@/lib/types/asset";

export const getUserById = async (
    request: Request,
    env: Env
): Promise<Response> => {
    const url = new URL(request.url);
    const id = url.pathname.split("/")[2];
    console.log(id);

    if (!id) {
        return new Response(
            JSON.stringify({
                success: false,
                status: "error",
                error: "400 Bad Request",
            }),
            {
                headers: responseHeaders,
            }
        );
    }

    const row: D1Result<User> = await env.database
        .prepare(`SELECT * FROM users WHERE id = ?`)
        .bind(id)
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

    const assets: D1Result<Asset> = await env.database
        .prepare(
            `SELECT * FROM assets WHERE uploadedBy = ? ORDER BY uid DESC LIMIT 20`
        )
        .bind(id)
        .run();

    const assetsUploaded = assets.results.map((asset) => ({
        uid: asset.uid,
        name: asset.name,
        tags: asset.tags,
        verified: asset.verified,
        uploadedDate: asset.uploadedDate,
    }));

    const results = row.results.map((result) => ({
        id: result.id,
        displayName: result.displayName,
        name: result.name,
        avatarUrl: result.avatarUrl,
        discordId: result.discordId,
        bio: result.bio,
        assetsUploaded: result.assetsUploaded,
        roles: result.roles,
        recentAssets: assetsUploaded || [],
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
