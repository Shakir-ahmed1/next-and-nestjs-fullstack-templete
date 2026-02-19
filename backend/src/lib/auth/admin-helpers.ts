export const UserRoles = {
    user: 'user',
    admin: 'admin',
    owner: 'owner',
    super_owner: 'super_owner',
}

export const UserAdminRoles = [UserRoles.admin, UserRoles.owner, UserRoles.super_owner]

export const UserRoleRanks: Record<string, number> = {
    user: 0,
    admin: 1,
    owner: 2,
    super_owner: 3,
};