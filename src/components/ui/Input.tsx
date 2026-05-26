import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[11px] uppercase tracking-[0.12em] text-warm-muted"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'h-11 w-full border-b border-warm-border bg-transparent px-0 text-sm text-ink',
            'placeholder:text-warm-muted/60',
            'focus:outline-none focus:border-ink transition-colors duration-200',
            'disabled:opacity-40',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-red-600 tracking-wide">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
