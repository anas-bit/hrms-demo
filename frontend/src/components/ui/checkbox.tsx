import * as React from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "../../lib/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    checked?: boolean
    indeterminate?: boolean
    onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({ checked, indeterminate, onCheckedChange, className, ...props }: CheckboxProps) {
    return (
        <span className={cn("relative inline-flex size-4 shrink-0", className)}>
            <input
                type="checkbox"
                checked={!!checked}
                onChange={e => onCheckedChange?.(e.target.checked)}
                onClick={e => e.stopPropagation()}
                className="peer absolute inset-0 cursor-pointer appearance-none rounded-[4px] bg-surface ring-1 ring-inset ring-foreground/25 transition-colors checked:bg-primary checked:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                {...props}
            />
            {(checked || indeterminate) && (
                <span className={cn("pointer-events-none absolute inset-0 flex items-center justify-center", checked ? "text-primary-foreground" : "text-foreground/70")}>
                    {checked ? <Check className="size-3" strokeWidth={3} /> : <Minus className="size-3" strokeWidth={3} />}
                </span>
            )}
        </span>
    )
}
