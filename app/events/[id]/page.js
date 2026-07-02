import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import EventBookingPage from '@/app/components/EventBookingPage'

export const metadata = {
  title: 'Event Booking — Turnt',
}

export default async function EventPage({ params }) {
  const { id } = await params

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: event, error } = await supabase
    .from('events')
    .select('id, name, description, date_time, venue, ticket_price, registration_type, reg_link')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  if (event.registration_type === 'gform' && event.reg_link) {
    const dt = new Date(event.date_time)
    const dateStr = dt.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const timeStr = dt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase mb-6"
              style={{
                background: 'rgba(242,106,10,0.12)',
                color: '#F26A0A',
                border: '1px solid rgba(242,106,10,0.2)',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Register via Google Form
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            style={{
              fontFamily: "'Jorgey', sans-serif",
              color: '#FFF7ED',
            }}
          >
            {event.name}
          </h1>

          <p className="text-sm mb-6" style={{ color: 'rgba(255,244,230,0.35)' }}>
            {event.description}
          </p>

          <div className="flex items-center justify-center gap-3 text-xs mb-10" style={{ color: 'rgba(255,244,230,0.4)' }}>
            <span>{dateStr}</span>
            <span style={{ color: 'rgba(255,196,107,0.2)' }}>·</span>
            <span>{timeStr}</span>
            <span style={{ color: 'rgba(255,196,107,0.2)' }}>·</span>
            <span>{event.venue}</span>
          </div>

          <a
            href={event.reg_link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold tracking-widest uppercase transition-all duration-300 no-underline"
            style={{
              background: 'linear-gradient(135deg, #FF6B00, #FF6B00cc)',
              color: '#fff',
              boxShadow: '0 8px 32px #FF6B0033',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 16px 48px #FF6B0055'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 8px 32px #FF6B0033'
            }}
          >
            Register Now
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>

          <p className="mt-6 text-xs" style={{ color: 'rgba(255,244,230,0.2)' }}>
            You will be redirected to a Google Form to complete registration.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <EventBookingPage event={event} />
    </div>
  )
}
