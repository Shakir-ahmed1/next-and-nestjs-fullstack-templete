import React from "react";
import NavSideContainer from "@/components/nav-side-container"


export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <NavSideContainer> {children}</NavSideContainer>;
}