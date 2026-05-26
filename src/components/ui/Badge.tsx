import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'sold' | 'featured' | 'success' | 'warning' | 'error' | 'neutral'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium',
        {
          'bg-stone-100 text-stone-700': variant === 'default',
          'bg-stone-900 text-white': variant === 'sold',
          'bg-amber-100 text-amber-800': variant === 'featured',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-700': variant === 'error',
          'bg-stone-100 text-stone-600': variant === 'neutral',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
