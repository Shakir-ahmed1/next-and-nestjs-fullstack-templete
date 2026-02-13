export const adminRole = ["admin", "owner", "super_owner"]

export const canAccessAdminPage = (role: string) => {
    return adminRole.includes(role)
}