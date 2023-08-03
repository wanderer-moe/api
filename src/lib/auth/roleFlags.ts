// bitwise for role flags allows for multiple roles to be assigned to a user, and for easy checking of roles

// permission based roles
export const roleFlags = {
    USER: 1 << 0,
    CONTRIBUTOR: 1 << 1,
    TRANSLATOR: 1 << 2,
    STAFF: 1 << 3,
    DEVELOPER: 1 << 4,
    CREATOR: 1 << 5,
};

export const roleFlagsToArray = (roleFlagsInt: number): string[] => {
    const roles: string[] = [];

    for (const [role, flag] of Object.entries(roleFlags)) {
        if (roleFlagsInt & flag) roles.push(role);
    }

    return roles;
};

// self assignable roles
export const SelfAssignableRoleFlags = {
    CONTENT_CREATOR: 1 << 0,
    ARTIST: 1 << 1,
    WRITER: 1 << 2,
    DEVELOPER: 1 << 3,
    DESIGNER: 1 << 4,
};

export const SelfAssignableRoleFlagsToArray = (
    roleFlagsInt: number
): string[] => {
    const roles: string[] = [];

    for (const [role, flag] of Object.entries(SelfAssignableRoleFlags)) {
        if (roleFlagsInt & flag) roles.push(role);
    }

    return roles;
};
