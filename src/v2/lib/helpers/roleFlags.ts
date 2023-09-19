/**
 * An object containing the bitwise values for permission-based roles.
 */
export const roleFlags = {
    USER: 1 << 0,
    UPLOADER: 1 << 1,
    CONTRIBUTOR: 1 << 2,
    TRANSLATOR: 1 << 3,
    STAFF: 1 << 4,
    DEVELOPER: 1 << 5,
    CREATOR: 1 << 6,
}

/**
 * Converts a role flags integer to an array of role names.
 * @param roleFlagsInt - The role flags integer to convert.
 * @returns An array of role names.
 */
export const roleFlagsToArray = (roleFlagsInt: number): string[] => {
    const roles: string[] = []

    for (const [role, flag] of Object.entries(roleFlags)) {
        if (roleFlagsInt & flag) roles.push(role)
    }

    return roles
}

/**
 * An object containing the bitwise values for self-assignable roles.
 */
export const SelfAssignableRoleFlags = {
    CONTENT_CREATOR: 1 << 0,
    ARTIST: 1 << 1,
    WRITER: 1 << 2,
    DEVELOPER: 1 << 3,
    DESIGNER: 1 << 4,
}

/**
 * Converts a self-assignable role flags integer to an array of role names.
 * @param roleFlagsInt - The self-assignable role flags integer to convert.
 * @returns An array of role names.
 */
export const SelfAssignableRoleFlagsToArray = (
    roleFlagsInt: number
): string[] => {
    const roles: string[] = []

    for (const [role, flag] of Object.entries(SelfAssignableRoleFlags)) {
        if (roleFlagsInt & flag) roles.push(role)
    }

    return roles
}
