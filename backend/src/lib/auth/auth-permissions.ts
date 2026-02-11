import { createAccessControl, organization } from "better-auth/plugins";
import { adminAc, defaultStatements, ownerAc } from "better-auth/plugins/organization/access";

/**
 * 1. DEFINE CAPABILITIES (Statements)
 * These define specific actions within the Gold Mining ERP modules.
 */
const customStatements = {
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
    ...customStatements,
    ...defaultStatements,
} as const;

export const customAC = createAccessControl(statement);

/**
 * 2. DEFINE ROLES
 * Assigning the granular permissions from the statement to each role.
 */
export const customRoles1 = {
    owner: customAC.newRole({
        ...customStatements,
        ...ownerAc.statements
    }),
    admin: customAC.newRole({
        members: ["create", "read", "update", "delete"],
        finance: ["read", "view_balance"],
        sales: ["read", "update"],
        assets: ["create", "read", "update", "delete"],
        attendance: ["read", "update"],
        ...adminAc.statements,
    }),
    manager: customAC.newRole({
        members: ["read"],
        attendance: ["read", "update"],
        production: ["read"],
        assets: ["read", "log_activity"],
        finance: ["read"],
    }),
    finance: customAC.newRole({
        finance: ["read", "approve", "reject", "view_balance"],
        requests: ["read"],
        sales: ["read"],
        inventory: ["read"],
    }),
    sells: customAC.newRole({
        sales: ["create", "read", "update"],
        production: ["create", "read"],
    }),
    stoker: customAC.newRole({
        inventory: ["create", "read", "update", "delete"],
    }),
    timekeeper: customAC.newRole({
        attendance: ["create", "read", "update"],
        assets: ["read", "log_activity"],
    }),
    buyer: customAC.newRole({
        requests: ["read", "update"],
        inventory: ["read"],
    }),
    requester: customAC.newRole({
        requests: ["create", "read"],
    }),
};

export const customRoles = {
    owner: customAC.newRole({
        ...customStatements,
        ...ownerAc.statements
    }),
    admin: customAC.newRole({
        members: ["create", "read", "update", "delete"],
        finance: ["read", "view_balance"],
        sales: ["read", "update"],
        assets: ["create", "read", "update", "delete"],
        attendance: ["read", "update"],
        ...adminAc.statements,
    }),
    guest: customAC.newRole({
        members: ["read"],
    })
};

/**
 * 3. GET BETTER-AUTH CONFIG
 */
