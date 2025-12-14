"use client"

import { MessageSquare, Pencil, Check, X, Copy, Trash2, type LucideIcon, MoreVertical, Download } from "lucide-react"
import { useState } from "react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { SavedChat } from "@/lib/settingsDB"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next";

export function NavChats({
    chats,
    chatsBySource,
    sourceIcons,
    handleLoadChat,
    editingChatId,
    editingChatName,
    setEditingChatName,
    handleStartEditChat,
    handleSaveEditChat,
    handleCancelEditChat,
    handleDeleteChat,
    handleDuplicateChat,
    formatDate,
    error,
}: {
    chats: SavedChat[]
    chatsBySource: Record<string, SavedChat[]>
    sourceIcons: Record<string, string>
    handleLoadChat: (chat: SavedChat) => void
    editingChatId: number | null
    editingChatName: string
    setEditingChatName: (name: string) => void
    handleStartEditChat: (chat: SavedChat, e: React.MouseEvent) => void
    handleSaveEditChat: (id: number, e: React.MouseEvent) => void
    handleCancelEditChat: (e: React.MouseEvent) => void
    handleDeleteChat: (id: number, e: React.MouseEvent) => void
    handleDuplicateChat: (chat: SavedChat, e: React.MouseEvent) => void
    formatDate: (date: Date) => string
    error: string
}) {
    const { isMobile } = useSidebar()
    const { t } = useTranslation();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.chats')}</SidebarGroupLabel>
            <SidebarMenu>
                {Object.entries(chatsBySource).map(([source, sourceChats]) => (
                    <Collapsible
                        key={source}
                        asChild
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={source}>
                                    {sourceIcons[source] && (
                                        <img
                                            src={sourceIcons[source]}
                                            alt={source}
                                            className="size-4 mr-2"
                                        />
                                    )}
                                    <span className="capitalize">{source}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {sourceChats.length === 0 ? (
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton>
                                                <span className="text-muted-foreground text-sm">
                                                    {t('sidebar.noChatsFound')}
                                                </span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ) : (
                                        sourceChats.map((chat) => (
                                            <SidebarMenuSubItem key={chat.id}>
                                                {editingChatId === chat.id ? (
                                                    <div className="flex flex-col gap-2 p-2">
                                                        <div className="flex items-center gap-1">
                                                            <Input
                                                                value={editingChatName}
                                                                onChange={(e) =>
                                                                    setEditingChatName(e.target.value)
                                                                }
                                                                placeholder="Chat name"
                                                                className="h-8"
                                                                autoFocus
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-9 !px-1"
                                                                    onClick={(e) =>
                                                                        handleSaveEditChat(chat.id!, e)
                                                                    }
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-9 !px-1"
                                                                    onClick={handleCancelEditChat}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {error && (
                                                            <p className="text-xs text-destructive">
                                                                {error}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            className="group/chat h-[auto] py-1 hover:bg-card"
                                                        >
                                                            <div
                                                                className="flex flex-col items-start cursor-pointer"
                                                                onClick={() => handleLoadChat(chat)}
                                                            >

                                                                <p className='font-medium text-sm line-clamp-1'>
                                                                    {chat.name}
                                                                </p>
                                                                <p className='text-[10px] mt-[-2px] text-muted-foreground'>
                                                                    {formatDate(chat.updatedAt)}
                                                                </p>
                                                            </div>
                                                        </SidebarMenuSubButton>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild className="mt-[7px]">
                                                                <SidebarMenuAction showOnHover>
                                                                    <MoreVertical />
                                                                    <span className="sr-only">More</span>
                                                                </SidebarMenuAction>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                className="rounded-lg flex flex-col gap-1 items-start w-fit text-base"
                                                                side={isMobile ? "bottom" : "right"}
                                                                align={isMobile ? "end" : "start"}
                                                            >
                                                                <div
                                                                    className="flex items-center gap-1 w-full px-2 py-1 rounded-sm hover:bg-accent hover:shadow-sm cursor-pointer"
                                                                    onClick={(e) => handleStartEditChat(chat, e)}
                                                                    title={t('sidebar.rename')}
                                                                >
                                                                    <Pencil size={16} />
                                                                    <span className='ml-2'>{t('sidebar.rename')}</span>
                                                                </div>
                                                                <div
                                                                    className="flex items-center gap-1 w-full px-2 py-1 rounded-sm hover:bg-accent hover:shadow-sm cursor-pointer"
                                                                    onClick={(e) => handleDuplicateChat(chat, e)}
                                                                    title={t('sidebar.duplicate')}
                                                                >
                                                                    <Copy size={16} />
                                                                    <span className='ml-2'>{t('sidebar.duplicate')}</span>
                                                                </div>
                                                                <div
                                                                    className="flex items-center gap-1 w-full px-2 py-1 rounded-sm hover:bg-red-500/20 hover:shadow-sm cursor-pointer text-destructive hover:text-destructive"
                                                                    onClick={(e) => handleDeleteChat(chat.id!, e)}
                                                                    title={t('sidebar.delete')}
                                                                >
                                                                    <Trash2 size={18} />
                                                                    <span className='ml-2'>{t('sidebar.delete')}</span>
                                                                </div>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </>
                                                )}
                                            </SidebarMenuSubItem>
                                        ))
                                    )}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
