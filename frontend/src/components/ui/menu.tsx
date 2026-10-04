import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { cn } from "../../lib/utils"

/** Lightweight dropdown menu built on Popover. Items close the menu when clicked. */
interface MenuContextValue { close: () => void }
const MenuContext = React.createContext<MenuContextValue>({ close: () => { } })

export function Menu({ trigger, children, align = "end", className }: {
    trigger: React.ReactNode
    children: React.ReactNode
    align?: "start" | "center" | "end"
    className?: string
}) {
    const [open, setOpen] = React.useState(false)
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent align={align} className={cn("w-48 p-1", className)} onClick={e => e.stopPropagation()}>
                <MenuContext.Provider value={{ close: () => setOpen(false) }}>
                    <div role="menu" className="flex flex-col">{children}</div>
                </MenuContext.Provider>
            </PopoverContent>
        </Popover>
    )
}

export function MenuItem({ icon: Icon, children, onSelect, destructive, disabled }: {
    icon?: React.ComponentType<{ className?: string }>
    children: React.ReactNode
    onSelect?: () => void
    destructive?: boolean
    disabled?: boolean
}) {
    const { close } = React.useContext(MenuContext)
    return (
        <button
            role="menuitem"
            type="button"
            disabled={disabled}
            onClick={() => { close(); onSelect?.() }}
            className={cn(
                "flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-[13px] transition-colors disabled:pointer-events-none disabled:opacity-50",
                destructive ? "text-danger hover:bg-danger-soft" : "text-foreground/90 hover:bg-sunken"
            )}
        >
            {Icon && <Icon className="size-4 shrink-0 opacity-70" />}
            <span className="truncate">{children}</span>
        </button>
    )
}

export function MenuSeparator() {
    return <div className="my-1 h-px bg-border/70" />
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
    return <div className="px-2 pb-1 pt-1.5 text-2xs font-medium uppercase tracking-wide text-muted-foreground">{children}</div>
}
