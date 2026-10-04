import { cn } from "../../lib/utils"

export function Progress({ value, className, tone = 'primary' }: {
    value: number
    className?: string
    tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}) {
    const bar = {
        primary: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-danger',
        info: 'bg-info',
    }[tone]
    return (
        <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-sunken", className)}>
            <div className={cn("h-full rounded-full transition-[width] duration-500", bar)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
    )
}
