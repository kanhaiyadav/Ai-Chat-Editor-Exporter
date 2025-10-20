"use client"

import { MessageSquare, Pencil, Check, X, Copy, Trash2, type LucideIcon } from "lucide-react"
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
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { SavedChat } from "@/lib/settingsDB"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

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
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarMenu>
                {Object.entries(chatsBySource).map(([source, sourceChats]) => (
                    <Collapsible
                        key={source}
                        asChild
                        defaultOpen={source === "chatgpt"}
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
                                                    No chats yet
                                                </span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ) : (
                                        sourceChats.map((chat) => (
                                            <SidebarMenuSubItem key={chat.id}>
                                                {editingChatId === chat.id ? (
                                                    <div className="flex flex-col gap-2 p-2">
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
                                                        {error && (
                                                            <p className="text-xs text-destructive">
                                                                {error}
                                                            </p>
                                                        )}
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0"
                                                                onClick={(e) =>
                                                                    handleSaveEditChat(chat.id!, e)
                                                                }
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0"
                                                                onClick={handleCancelEditChat}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        className="group/chat"
                                                    >
                                                        <div
                                                            className="flex items-center justify-between cursor-pointer"
                                                            onClick={() => handleLoadChat(chat)}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium truncate">
                                                                    {chat.name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {formatDate(chat.updatedAt)}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1 opacity-0 group-hover/chat:opacity-100 transition-opacity">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={(e) =>
                                                                        handleStartEditChat(chat, e)
                                                                    }
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={(e) =>
                                                                        handleDuplicateChat(chat, e)
                                                                    }
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                                    onClick={(e) =>
                                                                        handleDeleteChat(chat.id!, e)
                                                                    }
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </SidebarMenuSubButton>
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
