import { useUserProfile } from "@/hooks/use-profile";
import { ReactNode } from "react";

export default function AdminUsersOnly({ children }: { children: ReactNode }) {
    const { data: currentUser } = useUserProfile()
    if (currentUser?.role === 'admin') {
        return <>
            {children}
        </>

    } else {
        return <></>
    }
}