import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { fieldClass } from "./input"

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options?: { value: string; label: string }[]
    placeholder?: string
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
    ({ className, options, placeholder, children, ...props }, ref) => (
        <div className={cn("relative", className)}>
            <select
                ref={ref}
                className={cn(fieldClass, "h-9 cursor-pointer appearance-none pr-8")}
                {...props}
            >
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options?.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
    )
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
