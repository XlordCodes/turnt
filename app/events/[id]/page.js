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
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <EventBookingPage event={event} />
    </div>
  )
}
