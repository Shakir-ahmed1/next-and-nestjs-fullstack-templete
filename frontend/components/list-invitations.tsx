import { useInvitations } from "@/hooks/use-invitations"
import { Mail } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card"
import { Avatar, AvatarFallback } from "./ui/avatar"


export const ListInvitations = ({
    onAcceptInvitation
}: {
    onAcceptInvitation: () => void
}) => {
    const { data: invitations, handleAcceptInvite, handleRejectInvite } = useInvitations({ onAcceptInvitation })

    return (
        <>
        { invitations && invitations.length > 0 && (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Pending Invitations ({invitations.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {invitations.map((invite) => (
                        <Card key={invite.id} className="border-primary/20 bg-primary/5">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/20 text-primary">
                                            {invite.organizationName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{invite.organizationName}</CardTitle>
                                        <CardDescription>Invited you as <span className="capitalize font-semibold">{invite.role}</span></CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex gap-2 pt-0">
                                <Button size="sm" className="flex-1" onClick={() => handleAcceptInvite(invite.id)}>
                                    Accept
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleRejectInvite(invite.id)}>
                                    Reject
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        )}  
        </>          
        )

}