'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import { contactSchema, type ContactFormData } from '@/lib/validations'

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="block text-[10px] uppercase tracking-[0.16em] text-warm-muted mb-2 transition-colors group-focus-within:text-ink"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-[10px] text-red-500 tracking-wide">{error}</p>
      )}
    </div>
  )
}

const inputClass =
  'w-full bg-transparent border-0 border-b border-warm-border pb-2 text-[13px] text-ink ' +
  'placeholder:text-warm-muted/50 focus:outline-none focus:border-ink transition-colors duration-200'

export function ContactForm({ initialMessage }: { initialMessage?: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const turnstileToken = useRef<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { message: initialMessage ?? '' },
  })

  async function onSubmit(data: ContactFormData) {
    setServerError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, turnstileToken: turnstileToken.current }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to send message')
      }
      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="py-16">
        <p className="font-display italic text-[clamp(28px,4vw,48px)] text-ink leading-none mb-6">
          Received.
        </p>
        <div className="h-px w-16 bg-warm-border mb-6" />
        <p className="text-[12px] text-warm-muted leading-relaxed max-w-sm">
          Thank you for your message. Wolfgang will be in touch within a few days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      <div className="grid sm:grid-cols-2 gap-8">
        <Field id="name" label="Name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            className={inputClass}
            {...register('name')}
          />
        </Field>

        <Field id="email" label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            className={inputClass}
            {...register('email')}
          />
        </Field>
      </div>

      <Field id="message" label="Message" error={errors.message?.message}>
        <textarea
          id="message"
          rows={7}
          placeholder="Your message…"
          className={`${inputClass} resize-none`}
          {...register('message')}
        />
      </Field>

      {/* Turnstile captcha — only renders if site key is configured */}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={token => { turnstileToken.current = token }}
          options={{ theme: 'light', size: 'normal' }}
        />
      )}

      {serverError && (
        <p className="text-[11px] text-red-500 tracking-wide">{serverError}</p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            'inline-flex items-center gap-4',
            'text-[11px] uppercase tracking-[0.18em]',
            'h-11 px-8',
            'transition-all duration-200 active:scale-[0.98]',
            isSubmitting
              ? 'border border-warm-border text-warm-muted cursor-not-allowed'
              : 'border border-ink text-ink hover:bg-ink hover:text-parchment',
          ].join(' ')}
        >
          {isSubmitting ? (
            <>Sending…</>
          ) : (
            <>
              <span className="h-px w-4 bg-current opacity-60" />
              Send Message
            </>
          )}
        </button>
      </div>
    </form>
  )
}
