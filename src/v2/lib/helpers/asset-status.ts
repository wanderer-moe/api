export const AssetStatus = {
    1: "APPROVED",
    2: "PENDING",
    3: "FLAGGED",
}

export type AssetStatusValue = keyof typeof AssetStatus
