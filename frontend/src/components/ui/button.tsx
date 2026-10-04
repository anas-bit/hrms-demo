import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Spinner } from "./spinner"

const buttonVariants = cva(
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,transform,opacity] duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                secondary: "bg-sunken text-foreground hover:bg-foreground/[0.08]",
                outline: "bg-surface text-foreground ring-1 ring-inset ring-border hover:bg-sunken",
                ghost: "text-foreground/80 hover:bg-foreground/[0.06] hover:text-foreground",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                "destructive-ghost": "text-danger hover:bg-danger-soft",
                link: "text-primary underline-offset-4 hover:underline active:scale-100",
            },
            size: {
                default: "h-9 px-3.5",
                sm: "h-8 px-2.5 text-[13px]",
                xs: "h-7 px-2 text-xs [&_svg]:size-3.5",
                lg: "h-10 px-5",
                icon: "h-9 w-9",
                "icon-sm": "h-8 w-8",
                "icon-xs": "h-7 w-7 [&_svg]:size-3.5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
        if (asChild) {
            return <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>{children}</Slot>
        }
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                aria-busy={loading || undefined}
                {...props}
            >
                {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <Spinner />
                    </span>
                )}
                <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>{children}</span>
            </button>
        )
    }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
