import { createAccessControl, organization } from "better-auth/plugins";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

/**
 * 1. DEFINE CAPABILITIES (Statements)
 * These define specific actions within the Gold Mining ERP modules.
 */
const customUserStatements = {
    // sales: ["create", "read", "update", "delete"],
    // finance: ["read", "approve", "reject", "delete", "view_balance"],
    // inventory: ["create", "read", "update", "delete"],
    // assets: ["create", "read", "update", "delete", "log_activity"],
    // attendance: ["create", "read", "update"],
    // production: ["create", "read"],
    // requests: ["create", "read", "update"],
    admin_users: ["create", "update", "delete"],
    owner_users: ["create", "update", "delete"],
    organization: ["create", "update", "delete"],
}

const statement = {
    ...customUserStatements,
    ...defaultStatements,
} as const;

export const customUserAc = createAccessControl(statement);

/**
 * 2. DEFINE ROLES
 * Assigning the granular permissions from the statement to each role.
 */

const userRole = customUserAc.newRole({
    // finance: ["read", "view_balance"],
    // sales: ["read", "update"],
    // assets: ["create", "read", "update", "delete"],
    // attendance: ["read", "update"],
    ...userAc.statements,
})

const adminRole = customUserAc.newRole({
    ...customUserStatements,
    ...adminAc.statements,
    admin_users: ["create"],
    organization: ["create"],
})
const ownerRole = customUserAc.newRole({
    ...customUserStatements,
    ...adminAc.statements,
    admin_users: ["create", "update", "delete"],
    organization: ["create", "update", "delete"],
})
const superOwnerRole = customUserAc.newRole({
    ...customUserStatements,
    ...adminAc.statements,
    admin_users: ["create", "update", "delete"],
    owner_users: ["create", "update", "delete"],
    organization: ["create", "update", "delete"],
})
export const customUserRoles = {
    super_owner: superOwnerRole,
    owner: ownerRole, // owner is the same as admin but owner can edit other admins
    admin: adminRole,
    user: userRole,
};

/**
 * 3. GET BETTER-AUTH CONFIG
 */
