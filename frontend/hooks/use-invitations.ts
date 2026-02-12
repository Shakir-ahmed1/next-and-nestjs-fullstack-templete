import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "./use-profile";
import { toast } from "sonner";

export const useInvitations = ({
    onAcceptInvitation
}: {
    onAcceptInvitation: () => void
}) => {
    const { data: currentUser } = useUserProfile()
    const queryResult = useQuery({
        queryKey: ["user-invitations", currentUser?.name],
        queryFn: async () => {
            const res = await authClient.organization.listUserInvitations();
            if (res.error) throw new Error(res.error.message);
            return res.data;
        }
    });
    const { refetch: refetchUserInvitations } = queryResult
    const handleAcceptInvite = async (invitationId: string) => {
        try {
            const res = await authClient.organization.acceptInvitation({
                invitationId
            });
            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Invitation accepted");
                onAcceptInvitation();
                refetchUserInvitations();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to accept invitation");
        }
    };

    const handleRejectInvite = async (invitationId: string) => {
        try {
            const res = await authClient.organization.rejectInvitation({
                invitationId
            });
            if (res.error) {
                toast.error(res.error.message);
            } else {
                toast.success("Invitation rejected");
                refetchUserInvitations();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to reject invitation");
        }
    };

    return {
        ...queryResult,
        handleAcceptInvite,
        handleRejectInvite
    }
};