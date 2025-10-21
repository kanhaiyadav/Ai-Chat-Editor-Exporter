"use client"

import { useState } from "react"
import {
    Check,
    Copy,
    Folder,
    Forward,
    MoreHorizontal,
    MoreVertical,
    Palette,
    Pencil,
    Settings2,
    Trash2,
    X,
    type LucideIcon,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { SavedPreset } from "@/lib/settingsDB"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NavPresets({
    presets,
    handleLoadPreset,
    editingPresetId,
    editingPresetName,
    setEditingPresetName,
    handleStartEditPreset,
    handleSaveEditPreset,
    handleCancelEditPreset,
    setError,
    error,
    formatDate,
    handleDeletePreset,
    handleDuplicatePreset
}: {
    presets: SavedPreset[],
    handleLoadPreset: (preset: SavedPreset, e: React.MouseEvent) => void,
    editingPresetId: number | null,
    editingPresetName: string,
    setEditingPresetName: (name: string) => void,
    handleStartEditPreset: (preset: SavedPreset, e: React.MouseEvent) => void,
    handleSaveEditPreset: (presetId: number, e: React.MouseEvent) => void,
    handleCancelEditPreset: (e: React.MouseEvent) => void,
    setError: (error: string) => void,
    error: string,
    formatDate: (date: Date) => string,
    handleDeletePreset: (presetId: number, e: React.MouseEvent) => void,
    handleDuplicatePreset: (preset: SavedPreset, e: React.MouseEvent) => void,
}) {
    const { isMobile } = useSidebar()
    const [more, setMore] = useState(5);

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Setting presets</SidebarGroupLabel>
            <SidebarMenu>
                {presets && presets.length > 0 ? (
                    <>
                        {presets.slice(0, more).map((preset) => (
                            <SidebarMenuItem
                                key={preset.id}
                                onClick={(e) => handleLoadPreset(preset, e)}
                                className="hover:bg-card hover:shadow-sm rounded-sm py-1 flex items-center"
                            >
                                {editingPresetId === preset.id ? (
                                    <div className='space-y-1 p-1' onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-1 items-center">
                                            <Input
                                                value={editingPresetName}
                                                onChange={(e) => {
                                                    setEditingPresetName(e.target.value);
                                                    setError('');
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveEditPreset(preset.id!, e as any);
                                                    } else if (e.key === 'Escape') {
                                                        handleCancelEditPreset(e as any);
                                                    }
                                                }}
                                                className='h-8'
                                                autoFocus
                                            />
                                            <div className='flex gap-2'>
                                                <Button
                                                    onClick={(e) => handleSaveEditPreset(preset.id!, e)}
                                                    variant='outline'
                                                    size='sm'
                                                    className='flex-1 p-0 !px-1 h-9'
                                                >
                                                    <Check className='h-3 w-3' />
                                                </Button>
                                                <Button
                                                    onClick={handleCancelEditPreset}
                                                    variant='outline'
                                                    size='sm'
                                                    className='flex-1 h-9 !px-1'
                                                >
                                                    <X className='h-3 w-3' />
                                                </Button>
                                            </div>
                                        </div>
                                        {error && (
                                            <p className='text-xs text-destructive'>{error}</p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <SidebarMenuButton asChild>
                                            <a href={'#'}>
                                                <Palette />
                                                <div>
                                                    <p className='font-medium text-sm line-clamp-1'>
                                                        {preset.name}
                                                    </p>
                                                    <p className='text-[10px] mt-[-2px] text-muted-foreground'>
                                                        {formatDate(preset.updatedAt)}
                                                    </p>
                                                </div>
                                            </a>
                                        </SidebarMenuButton>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="mt-[4.5px]">
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
                                                    className="flex items-center gap-1 w-full px-2 pt-1 rounded-sm hover:bg-accent hover:shadow-sm cursor-pointer"
                                                    onClick={(e) => handleStartEditPreset(preset, e)}
                                                    title='Rename'
                                                >
                                                    <Pencil size={15} />
                                                    <span className='ml-2'>Rename</span>
                                                </div>
                                                <div
                                                    className="flex items-center gap-1 w-full px-2 pt-1 rounded-sm hover:bg-accent hover:shadow-sm cursor-pointer"
                                                    onClick={(e) => handleDuplicatePreset(preset, e)}
                                                    title='Duplicate'
                                                >
                                                    <Copy size={15} />
                                                    <span className='ml-2'>Duplicate</span>
                                                </div>
                                                <div
                                                    className="flex items-center gap-1 w-full px-2 pt-1 rounded-sm hover:bg-accent hover:shadow-sm cursor-pointer"
                                                    onClick={(e) => handleDeletePreset(preset.id!, e)}
                                                    title='Delete'
                                                >
                                                    <Trash2 size={15} />
                                                    <span className='ml-2'>Delete</span>
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
                            </SidebarMenuItem>
                        ))}
                    </>
                ) : (
                    <div className='text-center py-8 px-4 text-sm text-muted-foreground'>
                        <Settings2 className='h-12 w-12 mx-auto mb-2 opacity-30' />
                        <p className='font-medium'>No saved presets yet</p>
                        <p className='text-xs mt-1'>
                            Save your PDF settings for quick access
                        </p>
                    </div>
                )}
                {
                    presets.length > 5 &&
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-sidebar-foreground/70"
                            onClick={() => setMore(more === 5 ? presets.length : 5)}
                        >
                            <MoreHorizontal className="text-sidebar-foreground/70" />
                            <span>{more !== presets.length ? "More" : "Less"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                }
            </SidebarMenu>
        </SidebarGroup>
    )
}
