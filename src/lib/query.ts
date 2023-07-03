import type { Asset } from "@/lib/types/asset";

type queryParameter = string | number;

export const getSearchResults = async (
    query: string,
    game: string[],
    asset: string[],
    tags: string[],
    env: Env
): Promise<Asset[]> => {
    let sqlQuery = `SELECT * FROM assets WHERE 1=1`;
    const parameters = [];

    sqlQuery = addQueryToSqlQuery(query, sqlQuery, parameters);
    sqlQuery = addGameToSqlQuery(game, sqlQuery, parameters);
    sqlQuery = addAssetToSqlQuery(asset, sqlQuery, parameters);
    sqlQuery = addTagsToSqlQuery(tags, sqlQuery, parameters);

    sqlQuery += ` ORDER BY uploadedDate DESC`;

    sqlQuery = limitResults(sqlQuery);

    if (!query && !game.length && !asset.length && !tags.length) {
        sqlQuery = `SELECT * FROM assets ORDER BY uploadedDate DESC LIMIT 30`;
    }

    const row: D1Result<Asset> = await env.database
        .prepare(sqlQuery)
        .bind(...parameters)
        .run();

    return row.results.map((result) => ({
        id: result.id,
        name: result.name,
        game: result.game,
        asset: result.asset,
        tags: result.tags,
        url: result.url,
        verified: result.verified,
        uploadedBy: result.uploadedBy,
        uploadedDate: result.uploadedDate,
        fileSize: result.fileSize,
    }));
};

const addQueryToSqlQuery = (
    query: string,
    sqlQuery: string,
    parameters: queryParameter[]
): string => {
    if (query) {
        sqlQuery += ` AND name LIKE ?`;
        parameters.push(`%${query}%`);
    }
    return sqlQuery;
};

const addGameToSqlQuery = (
    game: string[],
    sqlQuery: string,
    parameters: queryParameter[]
): string => {
    if (game.length) {
        sqlQuery += ` AND game IN (${game.map(() => "?").join(",")})`;
        parameters.push(...game);
    }
    return sqlQuery;
};

const addAssetToSqlQuery = (
    asset: string[],
    sqlQuery: string,
    parameters: queryParameter[]
): string => {
    if (asset.length) {
        sqlQuery += ` AND asset IN (${asset.map(() => "?").join(",")})`;
        parameters.push(...asset);
    }
    return sqlQuery;
};

const addTagsToSqlQuery = (
    tags: string[],
    sqlQuery: string,
    parameters: queryParameter[]
): string => {
    if (tags.length) {
        sqlQuery += ` AND tags IN (${tags.map(() => "?").join(",")})`;
        parameters.push(...tags);
    }
    return sqlQuery;
};

const limitResults = (sqlQuery: string): string => {
    // if (game.length > 1 || asset.length > 1 || tags.length > 1) {
    //     sqlQuery += ` LIMIT 2500`;
    // }
    return (sqlQuery += ` LIMIT 2500`);
};
