/**
 * An object containing the possible status values for assets, as it's stored as an integer inside the database.
 */
export const AssetStatus = {
    1: "APPROVED",
    2: "PENDING",
    3: "FLAGGED",
}

/**
 * An object containing the possible status values for assets, as it's stored as an integer inside the database.
 */
export type AssetStatusValue = keyof typeof AssetStatus
