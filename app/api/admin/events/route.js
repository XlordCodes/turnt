import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function requireAdmin() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return null
  }

  return { supabase, user }
}

export async function POST(req) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 415 })
  }

  const auth = await requireAdmin()

  if (!auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const date_time = typeof body.date_time === 'string' ? body.date_time : ''
    const venue = typeof body.venue === 'string' ? body.venue.trim() : ''
    const ticket_price = Number(body.ticket_price) || 0
    const reg_link = typeof body.reg_link === 'string' ? body.reg_link.trim() : ''

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    if (!description) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }
    if (!date_time) {
      return NextResponse.json({ error: 'date_time is required' }, { status: 400 })
    }
    if (!venue) {
      return NextResponse.json({ error: 'venue is required' }, { status: 400 })
    }
    if (!reg_link) {
      return NextResponse.json({ error: 'reg_link is required' }, { status: 400 })
    }
    if (ticket_price < 0) {
      return NextResponse.json({ error: 'ticket_price must be non-negative' }, { status: 400 })
    }

    const { data, error } = await auth.supabase
      .from('events')
      .insert([{
        name,
        description,
        date_time,
        venue,
        ticket_price,
        reg_link,
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function PATCH(req) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 415 })
  }

  const auth = await requireAdmin()

  if (!auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id, ...rawUpdates } = await req.json()

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Valid event id is required' }, { status: 400 })
    }

    const allowedUpdates = {}
    if (rawUpdates.name !== undefined) allowedUpdates.name = typeof rawUpdates.name === 'string' ? rawUpdates.name.trim() : ''
    if (rawUpdates.description !== undefined) allowedUpdates.description = typeof rawUpdates.description === 'string' ? rawUpdates.description.trim() : ''
    if (rawUpdates.date_time !== undefined) allowedUpdates.date_time = typeof rawUpdates.date_time === 'string' ? rawUpdates.date_time : ''
    if (rawUpdates.venue !== undefined) allowedUpdates.venue = typeof rawUpdates.venue === 'string' ? rawUpdates.venue.trim() : ''
    if (rawUpdates.ticket_price !== undefined) allowedUpdates.ticket_price = Number(rawUpdates.ticket_price) || 0
    if (rawUpdates.reg_link !== undefined) allowedUpdates.reg_link = typeof rawUpdates.reg_link === 'string' ? rawUpdates.reg_link.trim() : ''

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    if (allowedUpdates.ticket_price !== undefined && allowedUpdates.ticket_price < 0) {
      return NextResponse.json({ error: 'ticket_price must be non-negative' }, { status: 400 })
    }

    const { data, error } = await auth.supabase
      .from('events')
      .update(allowedUpdates)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(req) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 415 })
  }

  const auth = await requireAdmin()

  if (!auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await req.json()

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Valid event id is required' }, { status: 400 })
    }

    const { error } = await auth.supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
