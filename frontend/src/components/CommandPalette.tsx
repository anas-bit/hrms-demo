import { useEffect, useState } from "react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "./ui/command"
import { useNavigate } from "react-router-dom"
import {
    Calculator,
    CreditCard,
    Settings,
    Smile,
    User,
    LayoutDashboard,
    Factory,
    Package,
    Users,
    UserPlus,
    Search,
    type LucideIcon
} from "lucide-react"
import { isModuleEnabled, type ModuleKey } from "../config/modules"

interface PaletteCommand {
    module: ModuleKey
    title: string
    path: string
    icon: LucideIcon
}

const ALL_MODULE_COMMANDS: PaletteCommand[] = [
    { module: 'dashboard', title: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { module: 'finance', title: 'Finance', path: '/app/finance', icon: CreditCard },
    { module: 'crm', title: 'CRM', path: '/app/crm', icon: Smile },
    { module: 'inventory', title: 'Inventory', path: '/app/inventory', icon: Package },
    { module: 'manufacturing', title: 'Manufacturing', path: '/app/manufacturing', icon: Factory },
    { module: 'hr', title: 'Human Capital', path: '/app/hr', icon: Users },
]

const ALL_ACTION_COMMANDS: PaletteCommand[] = [
    { module: 'finance', title: 'New Invoice', path: '/app/finance/invoices/new', icon: Calculator },
    { module: 'crm', title: 'Add Lead', path: '/app/crm', icon: User },
    { module: 'hr', title: 'Add Employee', path: '/app/hr/add', icon: UserPlus },
    { module: 'settings', title: 'Settings', path: '/app/settings', icon: Settings },
]

const MODULE_COMMANDS = ALL_MODULE_COMMANDS.filter(c => isModuleEnabled(c.module))
const ACTION_COMMANDS = ALL_ACTION_COMMANDS.filter(c => isModuleEnabled(c.module))

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted rounded-md border border-transparent hover:border-border transition-all w-64 justify-between"
            >
                <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search...
                </span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {MODULE_COMMANDS.length > 0 && (
                        <CommandGroup heading="Modules">
                            {MODULE_COMMANDS.map(cmd => (
                                <CommandItem key={cmd.title} onSelect={() => runCommand(() => navigate(cmd.path))}>
                                    <cmd.icon className="mr-2 h-4 w-4" />
                                    <span>{cmd.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />

                    {ACTION_COMMANDS.length > 0 && (
                        <CommandGroup heading="Actions">
                            {ACTION_COMMANDS.map(cmd => (
                                <CommandItem key={cmd.title} onSelect={() => runCommand(() => navigate(cmd.path))}>
                                    <cmd.icon className="mr-2 h-4 w-4" />
                                    <span>{cmd.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
