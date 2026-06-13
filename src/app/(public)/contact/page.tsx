import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact — Wolfgang Finger',
  description: 'Get in touch with Wolfgang Finger for inquiries about available works or exhibitions.',
}

interface Props {
  searchParams: Promise<{ subject?: string }>
}

export default async function ContactPage({ searchParams }: Props) {
  const { subject } = await searchParams
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-14 py-16 md:py-20">

      {/* Page header */}
      <div className="mb-16">
        <p className="text-[10px] uppercase tracking-[0.2em] text-warm-muted mb-3">
          Wolfgang Finger
        </p>
        <h1 className="font-display italic text-[clamp(36px,7vw,80px)] leading-none text-ink">
          Contact
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-start">

        {/* Left: context */}
        <div className="space-y-10">
          <div className="section-rule">
            <span className="text-[10px] uppercase tracking-[0.2em] text-warm-muted shrink-0">
              01 &nbsp; Enquiries
            </span>
          </div>

          <p className="font-display italic text-[clamp(16px,2vw,22px)] text-ink leading-relaxed">
            For works, acquisitions, and exhibitions.
          </p>

          <div className="space-y-6 text-[12px] text-warm-muted leading-relaxed">
            <p>
              Original works are available directly from the studio.
              Wolfgang responds to all enquiries personally.
            </p>
            <p>
              For press or institutional inquiries, please indicate this in your message.
            </p>
          </div>

          {/* Response note */}
          <div className="border-l-2 border-warm-border pl-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-warm-muted mb-1">Response time</p>
            <p className="text-[12px] text-ink">Within 2–3 business days</p>
          </div>
        </div>

        {/* Right: form */}
        <div>
          <ContactForm initialMessage={subject} />
        </div>
      </div>
    </div>
  )
}
