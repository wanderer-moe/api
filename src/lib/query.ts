import type { Asset } from "@/lib/types/asset";
import { getConnection } from "@/lib/planetscale";

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

    sqlQuery += ` ORDER BY uploaded_date DESC`;

    sqlQuery = limitResults(sqlQuery);

    if (!query && !game.length && !asset.length && !tags.length) {
        sqlQuery = `SELECT * FROM assets ORDER BY uploaded_date DESC LIMIT 30`;
    }

    const db = await getConnection(env);

    return await db
        .execute(sqlQuery, parameters)
        .then((row) => row.rows as Asset[]);
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
        sqlQuery += ` AND asset_category IN (${asset
            .map(() => "?")
            .join(",")})`;
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
        sqlQuery += ` AND tags IN (${tags
            .map(() => "?")
            .join(",")
            .toUpperCase()})`;
        parameters.push(...tags);
    }
    return sqlQuery;
};

const limitResults = (sqlQuery: string): string => {
    return (sqlQuery += ` LIMIT 1500`);
};
