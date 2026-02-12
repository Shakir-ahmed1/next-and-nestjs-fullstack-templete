import { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, createAuthMiddleware, APIError } from "better-auth/api";

export const softDeletePlugin = (): BetterAuthPlugin => ({
    id: "soft-delete-plugin",
    schema: {
        user: {
            fields: {
                deletedAt: { type: "date", required: false }
            }
        },
        organization: {
            fields: {
                deletedAt: { type: "date", required: false }
            }
        },
        member: {
            fields: {
                deletedAt: { type: "date", required: false }
            }
        }
    },
    hooks: {
        before: [
            // Intercept deleting an organization
            {
                matcher: ctx => ctx.path === "/organization/delete",
                handler: createAuthMiddleware(async (ctx) => {

                    const { organizationId } = ctx.body || {};
                    if (!organizationId) throw new APIError("BAD_REQUEST", { message: "Missing organizationId" });
                    await ctx.context.adapter.update({
                        model: "organization",
                        where: [
                            {
                                field: "id",
                                operator: "eq",
                                value: organizationId
                            }
                        ],
                        update: { deletedAt: new Date() }
                    });
                    return ctx.json({ success: true });
                })
            },
            // Intercept removing/leaving member
            {
                matcher: ctx => ctx.path === "/organization/remove-member" || ctx.path === "/organization/leave",
                handler: createAuthMiddleware(async (ctx) => {
                    const { memberId } = ctx.body || {};
                    if (!memberId) throw new APIError("BAD_REQUEST", { message: "Missing memberId" });
                    await ctx.context.adapter.update({
                        model: "member",
                        where: [
                            {
                                field: "id",
                                operator: "eq",
                                value: memberId
                            }
                        ],
                        update: { deletedAt: new Date() }
                    });
                    return ctx.json({ success: true });
                })
            },
            // Intercept admin removing a user
            {
                matcher: ctx => ctx.path === "/admin/remove-user",
                handler: createAuthMiddleware(async (ctx) => {
                    const { userId } = ctx.body || {};
                    if (!userId) throw new APIError("BAD_REQUEST", { message: "Missing userId" });
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [
                            {
                                field: "id",
                                operator: "eq",
                                value: userId
                            }
                        ],
                        update: { deletedAt: new Date() }
                    });
                    return ctx.json({ success: true });
                })
            },
            // (Optional) Add filters to listing endpoints to exclude deleted rows.
            {
                matcher: ctx => ctx.path === "/organization/list",
                handler: createAuthMiddleware(async (ctx) => {
                    // If using query filters, enforce deletedAt = null
                    ctx.query = { ...ctx.query, filterField: "deletedAt", filterOperator: "eq", filterValue: null };
                })
            },
            {
                matcher: ctx => ctx.path === "/admin/list-users",
                handler: createAuthMiddleware(async (ctx) => {
                    ctx.query = { ...ctx.query, filterField: "deletedAt", filterOperator: "eq", filterValue: null };
                })
            }
        ]
    },
    endpoints: {
        getDeletedOrganizations: createAuthEndpoint(
            "/soft-delete/get-deleted-organizations",
            { method: "GET" },
            async ctx => {
                // e.g. check admin role
                const deletedOrgs = await ctx.context.adapter.findMany({
                    model: "organization",
                    where: [
                        {
                            field: "deletedAt",
                            operator: "ne",
                            value: null
                        }
                    ]
                });
                return ctx.json(deletedOrgs);
            }
        ),
        getDeletedMembers: createAuthEndpoint(
            "/soft-delete/get-deleted-members",
            { method: "GET" },
            async ctx => {
                const { organizationId } = ctx.query as { organizationId: string };
                if (!organizationId) throw new APIError("BAD_REQUEST", { message: "Missing organizationId" });
                const deletedMembers = await ctx.context.adapter.findMany({
                    model: "member",
                    where: [
                        {
                            field: "organizationId",
                            operator: "eq",
                            value: organizationId
                        },
                        {
                            field: "deletedAt",
                            operator: "ne",
                            value: null
                        }
                    ],

                });
                return ctx.json(deletedMembers);
            }
        ),
        getDeletedUsers: createAuthEndpoint(
            "/soft-delete/get-deleted-users",
            { method: "GET" },
            async ctx => {
                const deletedUsers = await ctx.context.adapter.findMany({
                    model: "user",
                    where: [
                        {
                            field: 'deletedAt',
                            operator: 'ne',
                            value: null
                        }
                    ]
                });
                return ctx.json(deletedUsers);
            }
        )
    }
});
