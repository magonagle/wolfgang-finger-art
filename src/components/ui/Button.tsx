import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-display tracking-[0.1em] transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink',
          'disabled:pointer-events-none disabled:opacity-35',
          {
            // Primary: outline — border ink, transparent bg, fills on hover
            'border border-ink text-ink bg-transparent hover:bg-ink hover:text-parchment active:scale-[0.98]': variant === 'primary',
            // Secondary: warm border, lighter
            'border border-warm-border text-warm-muted bg-transparent hover:border-ink hover:text-ink active:scale-[0.98]': variant === 'secondary',
            // Ghost: text only
            'text-warm-muted hover:text-ink': variant === 'ghost',
            // Danger
            'border border-red-700 text-red-700 hover:bg-red-700 hover:text-white': variant === 'danger',
          },
          {
            'h-8 px-4 text-[10px]': size === 'sm',
            'h-10 px-6 text-[11px]': size === 'md',
            'h-12 px-10 text-[12px]': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
