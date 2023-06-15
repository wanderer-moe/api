import { rename } from "../helpers/rename";

export const getAssetRequests = async (
    db: D1Database,
    gameId: string,
    asset: string
): Promise<number> => {
    const tableName: string = rename(gameId);
    const location: string = rename(asset);

    const requests: { results?: { requests: number }[] } = await db
        .prepare(`SELECT requests FROM ${tableName} WHERE location = ?`)
        .bind(location)
        .all();

    if (requests.results?.length === 0) {
        await db
            .prepare(
                `INSERT INTO ${tableName} (location, requests) VALUES (?, 0)`
            )
            .bind(location)
            .run();
    }

    return requests?.results[0]?.requests ?? 0;
};
