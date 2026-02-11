import React from "react";


interface ActiveOrganizationContextValue {
    handleSetActiveOrg: (orgSlug: string) => Promise<void>;
    activeOrg: any;
}

const ActiveOrganizationContext = React.createContext<ActiveOrganizationContextValue>({
    handleSetActiveOrg: () => Promise.resolve(),
    activeOrg: null,
});
export default ActiveOrganizationContext