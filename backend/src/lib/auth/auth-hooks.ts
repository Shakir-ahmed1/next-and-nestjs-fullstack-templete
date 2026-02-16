import { APIError, BetterAuthOptions, GenericEndpointContext, User } from "better-auth"; // Adjust import based on your setup

// 1. Define the role hierarchy using a numeric rank
const ROLE_RANKS: Record<string, number> = {
    user: 0,
    admin: 1,
    owner: 2,
    super_owner: 3,
};

// 2. Helper function to check permissions based on your requirements
function isActionAllowed(actorRole: string, targetRole: string, newRole?: string): boolean {
    // super_owner can be acted on by none (even themselves)
    if (targetRole === "super_owner") {
        return false;
    }
    const actorRank = ROLE_RANKS[actorRole] || 0;
    const targetRank = ROLE_RANKS[targetRole] || 0;

    if (newRole) {
        const newRoleRank = ROLE_RANKS[newRole] || 0;
        if (newRoleRank > actorRank) {
            return false;
        }
    }
    // An actor can only act on someone strictly below their rank
    return actorRank > targetRank;
}

export const databaseHooks: BetterAuthOptions["databaseHooks"] = {
    user: {
        delete: {
            before: async (user: User & Record<string, unknown>, ctx: GenericEndpointContext | null) => {
                if (ctx?.path?.includes("admin")) {
                    const { userId: targetUserId } = ctx?.body as { userId: string, role: string };
                    const { id: actorUserId } = ctx?.context?.session?.user as { id: string };
                    if (!targetUserId || !actorUserId) return;
                    // Get the role of the user performing the action (the "actor")
                    // Note: Adjust the path below if your session is stored differently in the ctx
                    if (targetUserId) {
                        const actorUser: any = await ctx?.context.adapter.findOne({
                            model: 'user',
                            where: [{ field: 'id', operator: 'eq', value: actorUserId as string }]
                        });
                        const actorRole = actorUser?.role || "user";

                        // Fetch the target user being deleted
                        const targetUser: any = await ctx?.context.adapter.findOne({
                            model: 'user',
                            where: [{ field: 'id', operator: 'eq', value: targetUserId as string }]
                        });

                        const targetRole = targetUser?.role || "user";

                        // Check if the actor has permission to delete the target
                        if (!isActionAllowed(actorRole, targetRole)) {
                            throw new APIError("BAD_REQUEST", {
                                message: `Permission denied: A '${actorRole}' cannot delete a '${targetRole}'.`,
                            });
                        }

                        return true;
                    }
                }
            },
        },
        update: {
            before: async (user: User & Record<string, unknown>, ctx: GenericEndpointContext | null) => {
                if (ctx?.path?.includes("admin")) {
                    const { userId: targetUserId, role: newRole } = ctx?.body as { userId: string, role: string };
                    const { id: actorUserId } = ctx?.context?.session?.user as { id: string };

                    if (!targetUserId || !actorUserId) return;
                    // Get the role of the user performing the action (the "actor")
                    // Note: Adjust the path below if your session is stored differently in the ctx
                    if (targetUserId) {
                        const actorUser: any = await ctx?.context.adapter.findOne({
                            model: 'user',
                            where: [{ field: 'id', operator: 'eq', value: actorUserId as string }]
                        });
                        const actorRole = actorUser?.role || "user";

                        // Fetch the target user being updated
                        const targetUser: any = await ctx?.context.adapter.findOne({
                            model: 'user',
                            where: [{ field: 'id', operator: 'eq', value: targetUserId as string }]
                        });

                        const targetRole = targetUser?.role || "user";
                        console.log("actorUser", actorUser);
                        console.log("targetUser", targetUser);
                        console.log(actorRole, targetRole, newRole);
                        // Check if the actor has permission to update the target
                        if (!isActionAllowed(actorRole, targetRole, newRole)) {
                            throw new APIError("BAD_REQUEST", {
                                message: `Permission denied: A '${actorRole}' cannot update a '${targetRole}'.`,
                            });
                        }

                        return true;
                    }
                }
            },
        },
    },
};