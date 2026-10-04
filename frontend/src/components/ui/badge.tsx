import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
    {
        variants: {
            variant: {
                default: "bg-primary-soft text-primary",
                secondary: "bg-sunken text-foreground/75",
                outline: "bg-transparent text-foreground/75 ring-1 ring-inset ring-border",
                destructive: "bg-danger-soft text-danger",
                success: "bg-success-soft text-success",
                warning: "bg-warning-soft text-warning",
                info: "bg-info-soft text-info",
            },
            dot: {
                true: "before:size-1.5 before:rounded-full before:bg-current before:content-['']",
                false: "",
            },
        },
        defaultVariants: {
            variant: "secondary",
            dot: false,
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, dot, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant, dot }), className)} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
