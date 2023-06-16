import { rename } from "@/lib/helpers/rename";

export const checkTable = async (
    db: D1Database,
    gameId: string
): Promise<void> => {
    const tableName: string = rename(gameId);
    await db
        .prepare(
            `CREATE TABLE IF NOT EXISTS ${tableName} (location TEXT, requests INTEGER)`
        )
        .run();
};
