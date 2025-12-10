"use client"

import * as React from "react"
import { ChevronsUpDown, Menu, Plus } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { RiMenuUnfold4Line } from "react-icons/ri";
import { RiMenuUnfold3Line } from "react-icons/ri";
import { useTranslation } from "react-i18next";

export function ToggleSidebar({
    teams,
}: {
    teams: {
        name: string
        logo: React.ElementType
        plan: string
    }[]
}) {
    const { open, setOpen } = useSidebar();
    const { t } = useTranslation();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    onClick={() => setOpen(!open)}
                >
                    <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        {
                            open ?
                                <RiMenuUnfold4Line size={20} />
                                :
                                <RiMenuUnfold3Line size={20} />

                        }
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{
                            open ? t('sidebar.closeSidebar') : t('sidebar.openSidebar')
                        }</span>
                        {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
                    </div>
                    {/* <ChevronsUpDown className="ml-auto" /> */}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
