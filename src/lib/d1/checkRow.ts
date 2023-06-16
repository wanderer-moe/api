import { rename } from "@/lib/helpers/rename";

export const checkRow = async (
    db: D1Database,
    gameId: string,
    asset: string
): Promise<void> => {
    const tableName: string = rename(gameId);
    const location: string = rename(asset);

    const row: D1Result<{ requests: number }> = await db
        .prepare(`SELECT requests FROM ${tableName} WHERE location = ?`)
        .bind(location)
        .all();

    if (Array.isArray(row) && row.length === 0) {
        await db
            .prepare(
                `INSERT INTO ${tableName} (location, requests) VALUES (?, 0)`
            )
            .bind(location)
            .run();
    }

    await db
        .prepare(
            `UPDATE ${tableName} SET requests = requests + 1 WHERE location = ?`
        )
        .bind(location)
        .run();
};
