import * as React from "react"
import { cn } from "../../lib/utils"

export const fieldClass =
    "w-full rounded-md bg-input px-3 text-sm text-foreground ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] placeholder:text-muted-foreground/80 hover:bg-sunken focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:ring-danger/70"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(fieldClass, "h-9 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium", className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
