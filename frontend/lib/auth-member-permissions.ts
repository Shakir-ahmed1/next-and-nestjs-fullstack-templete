import { createAccessControl } from "better-auth/plugins";
import { adminAc, defaultStatements, ownerAc } from "better-auth/plugins/organization/access";

/**
 * 1. DEFINE CAPABILITIES (Statements)
 * These define specific actions within the Gold Mining ERP modules.
 */
export const customMemberStatements = {
    sales: ["create", "read", "update", "delete"],
    finance: ["read", "approve", "reject", "delete", "view_balance"],
    inventory: ["create", "read", "update", "delete"],
    assets: ["create", "read", "update", "delete", "log_activity"],
    attendance: ["create", "read", "update"],
    production: ["create", "read"],
    requests: ["create", "read", "update"],
    members: ["create", "read", "update", "delete"],
}
const statement = {
    ...customMemberStatements,
    ...defaultStatements,
} as const;

export const customMemberAC = createAccessControl(statement);

/**
 * 2. DEFINE ROLES
 * Assigning the granular permissions from the statement to each role.
 */
export const customRoles1 = {
    owner: customMemberAC.newRole({
        ...customMemberStatements,
        ...ownerAc.statements
    }),
    admin: customMemberAC.newRole({
        members: ["create", "read", "update", "delete"],
        finance: ["read", "view_balance"],
        sales: ["read", "update"],
        assets: ["create", "read", "update", "delete"],
        attendance: ["read", "update"],
        ...adminAc.statements,
    }),
    manager: customMemberAC.newRole({
        members: ["read"],
        attendance: ["read", "update"],
        production: ["read"],
        assets: ["read", "log_activity"],
        finance: ["read"],
    }),
    finance: customMemberAC.newRole({
        finance: ["read", "approve", "reject", "view_balance"],
        requests: ["read"],
        sales: ["read"],
        inventory: ["read"],
    }),
    sells: customMemberAC.newRole({
        sales: ["create", "read", "update"],
        production: ["create", "read"],
    }),
    stoker: customMemberAC.newRole({
        inventory: ["create", "read", "update", "delete"],
    }),
    timekeeper: customMemberAC.newRole({
        attendance: ["create", "read", "update"],
        assets: ["read", "log_activity"],
    }),
    buyer: customMemberAC.newRole({
        requests: ["read", "update"],
        inventory: ["read"],
    }),
    requester: customMemberAC.newRole({
        requests: ["create", "read"],
    }),
};

export const customMemberRoles = {
    owner: customMemberAC.newRole({
        ...customMemberStatements,
        ...ownerAc.statements
    }),
    admin: customMemberAC.newRole({
        members: ["create", "read", "update", "delete"],
        finance: ["read", "view_balance"],
        sales: ["read", "update"],
        assets: ["create", "read", "update", "delete"],
        attendance: ["read", "update"],
        ...adminAc.statements,
    }),
    guest: customMemberAC.newRole({
        members: ["read"],
    })
};

/**
 * 3. GET BETTER-AUTH CONFIG
 */
