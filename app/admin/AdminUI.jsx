'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const INITIAL_FORM = {
  name: '',
  description: '',
  date_time: '',
  venue: '',
  ticket_price: '',
  registration_type: 'native',
  reg_link: '',
}

export default function AdminUI({ eventsData = [] }) {
  const router = useRouter()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)

  const openModal = (mode, event = null) => {
    setModalMode(mode)
    setSelectedEvent(event)
    if (mode === 'edit' && event) {
      const dt = new Date(event.date_time)
      const local = dt.toISOString().slice(0, 16)
      setFormData({
        name: event.name || '',
        description: event.description || '',
        date_time: local,
        venue: event.venue || '',
        ticket_price: event.ticket_price ?? '',
        registration_type: event.registration_type || 'native',
        reg_link: event.reg_link || '',
      })
    } else {
      setFormData(INITIAL_FORM)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    setFormData(INITIAL_FORM)
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?')
    if (!confirmed) return

    try {
      const res = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const result = await res.json()

      if (!res.ok) {
        alert('Failed to delete event: ' + (result.error || 'Unknown error'))
        return
      }
    } catch {
      alert('Failed to delete event. Please try again.')
      return
    }

    router.refresh()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      name: formData.name,
      description: formData.description,
      date_time: new Date(formData.date_time).toISOString(),
      venue: formData.venue,
      ticket_price: Number(formData.ticket_price) || 0,
      registration_type: formData.registration_type,
      reg_link: formData.registration_type === 'gform' ? formData.reg_link : '',
    }

    try {
      let res

      if (modalMode === 'create') {
        res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/events', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEvent.id, ...payload }),
        })
      }

      const result = await res.json()

      if (!res.ok) {
        alert(`Failed to ${modalMode} event: ` + (result.error || 'Unknown error'))
        setIsSubmitting(false)
        return
      }
    } catch {
      alert(`Failed to ${modalMode} event. Please try again.`)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    closeModal()
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">

        {/* ── Back Button ── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer"
          style={{ color: 'rgba(255,244,230,0.5)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#F26A0A' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,244,230,0.5)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #F26A0A, transparent)' }} />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#FF8B14', fontFamily: "'Space Mono', monospace" }}>
              Admin
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
                style={{
                  fontFamily: "'Jorgey', sans-serif",
                  color: '#FFF7ED',
                }}
              >
                Event <span style={{
                  background: 'linear-gradient(135deg, #F26A0A, #FFC46B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>RSVPs</span>
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,244,230,0.35)' }}>
                View registrations and interested users across all events.
              </p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="shrink-0 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #F26A0A, #FF8B14)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(242,106,10,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(242,106,10,0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(242,106,10,0.3)'
              }}
            >
              + Create New Event
            </button>
          </div>
        </div>

        {/* ── Stats Summary ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Events', value: eventsData.length },
            { label: 'Total RSVPs', value: eventsData.reduce((sum, e) => sum + (e.event_interests?.length || 0), 0) },
            { label: 'Upcoming', value: eventsData.filter(e => new Date(e.date_time) > new Date()).length },
            { label: 'Past Events', value: eventsData.filter(e => new Date(e.date_time) <= new Date()).length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(255,196,107,0.06)',
              }}
            >
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,244,230,0.3)', fontFamily: "'Space Mono', monospace" }}>
                {stat.label}
              </p>
              <p className="text-2xl md:text-3xl font-bold" style={{
                fontFamily: "'Jorgey', sans-serif",
                background: 'linear-gradient(135deg, #F26A0A, #FFC46B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Events List ── */}
        <div className="space-y-6">
          {eventsData.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: '#0A0A0A', border: '1px solid rgba(255,196,107,0.06)' }}>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,244,230,0.35)' }}>No events found.</p>
              <button
                onClick={() => openModal('create')}
                className="px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #F26A0A, #FF8B14)',
                  color: '#fff',
                }}
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            eventsData.map((event) => {
              const interests = event.event_interests || []
              const isPast = new Date(event.date_time) <= new Date()
              const dt = new Date(event.date_time)
              const dateStr = dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
              const timeStr = dt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

              return (
                <div
                  key={event.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#0A0A0A',
                    border: '1px solid rgba(255,196,107,0.06)',
                    opacity: isPast ? 0.6 : 1,
                  }}
                >
                  {/* Event Header */}
                  <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderBottom: '1px solid rgba(255,196,107,0.04)' }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg md:text-xl font-bold" style={{ fontFamily: "'Jorgey', sans-serif", color: '#FFF7ED' }}>
                          {event.name}
                        </h2>
                        {isPast && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,244,230,0.3)' }}>
                            Past
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,244,230,0.4)' }}>
                        <span>{dateStr}</span>
                        <span style={{ color: 'rgba(255,196,107,0.2)' }}>·</span>
                        <span>{timeStr}</span>
                        <span style={{ color: 'rgba(255,196,107,0.2)' }}>·</span>
                        <span>{event.venue}</span>
                        {event.ticket_price > 0 && (
                          <>
                            <span style={{ color: 'rgba(255,196,107,0.2)' }}>·</span>
                            <span style={{ color: '#F26A0A' }}>₹{event.ticket_price}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="px-4 py-2 rounded-full text-xs font-bold tracking-wider"
                        style={{
                          background: interests.length > 0 ? 'rgba(242,106,10,0.12)' : 'rgba(255,255,255,0.04)',
                          color: interests.length > 0 ? '#F26A0A' : 'rgba(255,244,230,0.3)',
                          border: `1px solid ${interests.length > 0 ? 'rgba(242,106,10,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        {interests.length} {interests.length === 1 ? 'RSVP' : 'RSVPs'}
                      </div>
                      <button
                        onClick={() => openModal('edit', event)}
                        className="px-3 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer"
                        style={{
                          border: '1px solid rgba(242,106,10,0.25)',
                          color: '#F26A0A',
                          background: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(242,106,10,0.1)'
                          e.currentTarget.style.borderColor = 'rgba(242,106,10,0.5)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = 'rgba(242,106,10,0.25)'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer"
                        style={{
                          border: '1px solid rgba(239,68,68,0.25)',
                          color: '#EF4444',
                          background: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="p-5 md:p-6">
                    {interests.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: 'rgba(255,244,230,0.2)' }}>
                        No registrations yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,196,107,0.06)' }}>
                              <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(255,244,230,0.3)', fontFamily: "'Space Mono', monospace" }}>
                                #
                              </th>
                              <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(255,244,230,0.3)', fontFamily: "'Space Mono', monospace" }}>
                                Name
                              </th>
                              <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(255,244,230,0.3)', fontFamily: "'Space Mono', monospace" }}>
                                Username
                              </th>
                              <th className="pb-3 text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(255,244,230,0.3)', fontFamily: "'Space Mono', monospace" }}>
                                WhatsApp
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {interests.map((interest, idx) => {
                              const profile = interest.profiles
                              return (
                                <tr
                                  key={idx}
                                  className="transition-colors duration-150"
                                  style={{ borderBottom: '1px solid rgba(255,196,107,0.03)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(242,106,10,0.03)' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                >
                                  <td className="py-3 text-xs tabular-nums" style={{ color: 'rgba(255,244,230,0.2)' }}>
                                    {String(idx + 1).padStart(2, '0')}
                                  </td>
                                  <td className="py-3 text-sm font-semibold" style={{ color: '#FFF7ED' }}>
                                    {profile?.full_name || '—'}
                                  </td>
                                  <td className="py-3 text-sm" style={{ color: 'rgba(255,244,230,0.5)' }}>
                                    @{profile?.username || '—'}
                                  </td>
                                  <td className="py-3 text-sm" style={{ color: 'rgba(255,244,230,0.5)' }}>
                                    {profile?.whatsapp_number || '—'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Modal Overlay ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: '#0A0A0A',
              border: '1px solid rgba(255,196,107,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(242,106,10,0.05)',
            }}
          >
            {/* Modal Header */}
            <div className="p-6 pb-0" style={{ borderBottom: '1px solid rgba(255,196,107,0.06)' }}>
              <div className="flex items-center justify-between mb-1">
                <h2
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Jorgey', sans-serif",
                    color: '#FFF7ED',
                  }}
                >
                  {modalMode === 'create' ? 'Create Event' : 'Edit Event'}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
                  style={{ color: 'rgba(255,244,230,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#FFF7ED' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,244,230,0.3)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,244,230,0.3)' }}>
                {modalMode === 'create' ? 'Fill in the details to add a new event.' : 'Update the event details below.'}
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'rgba(255,244,230,0.35)', fontFamily: "'Space Mono', monospace" }}>
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. SunBurn Meet-up"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: '#050505',
                    border: '1px solid rgba(255,196,107,0.1)',
                    color: '#FFF7ED',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'rgba(255,244,230,0.35)', fontFamily: "'Space Mono', monospace" }}>
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's this event about?"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 resize-none"
                  style={{
                    background: '#050505',
                    border: '1px solid rgba(255,196,107,0.1)',
                    color: '#FFF7ED',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
                />
              </div>

              {/* Date & Time + Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'rgba(255,244,230,0.35)', fontFamily: "'Space Mono', monospace" }}>
                    Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date_time}
                    onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: '#050505',
                      border: '1px solid rgba(255,196,107,0.1)',
                      color: '#FFF7ED',
                      colorScheme: 'dark',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'rgba(255,244,230,0.35)', fontFamily: "'Space Mono', monospace" }}>
                    Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Besant Nagar Beach"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: '#050505',
                      border: '1px solid rgba(255,196,107,0.1)',
                      color: '#FFF7ED',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
                  />
                </div>
              </div>

              {/* Ticket Price */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'rgba(255,244,230,0.35)', fontFamily: "'Space Mono', monospace" }}>
                  Ticket Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                  placeholder="0 for free"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: '#050505',
                    border: '1px solid rgba(255,196,107,0.1)',
                    color: '#FFF7ED',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
                />
              </div>

              {/* Registration Method */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(255,244,230,0.35)', fontFamily: "'Space Mono', monospace" }}>
                  Registration Method
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, registration_type: 'native' })}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-center"
                    style={{
                      background: formData.registration_type === 'native' ? 'rgba(242,106,10,0.15)' : '#050505',
                      border: `1px solid ${formData.registration_type === 'native' ? 'rgba(242,106,10,0.4)' : 'rgba(255,196,107,0.1)'}`,
                      color: formData.registration_type === 'native' ? '#F26A0A' : 'rgba(255,244,230,0.35)',
                    }}
                  >
                    Native Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, registration_type: 'gform' })}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-center"
                    style={{
                      background: formData.registration_type === 'gform' ? 'rgba(242,106,10,0.15)' : '#050505',
                      border: `1px solid ${formData.registration_type === 'gform' ? 'rgba(242,106,10,0.4)' : 'rgba(255,196,107,0.1)'}`,
                      color: formData.registration_type === 'gform' ? '#F26A0A' : 'rgba(255,244,230,0.35)',
                    }}
                  >
                    Google Form
                  </button>
                </div>
              </div>

              {/* Google Form URL — conditional */}
              {formData.registration_type === 'gform' && (
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'rgba(255,244,230,0.35)', fontFamily: "'Space Mono', monospace" }}>
                    Google Form URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.reg_link}
                    onChange={(e) => setFormData({ ...formData, reg_link: e.target.value })}
                    placeholder="https://forms.gle/..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: '#050505',
                      border: '1px solid rgba(255,196,107,0.1)',
                      color: '#FFF7ED',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer"
                  style={{
                    border: '1px solid rgba(255,196,107,0.12)',
                    color: 'rgba(255,244,230,0.5)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,196,107,0.3)'
                    e.currentTarget.style.color = '#FFF7ED'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,196,107,0.12)'
                    e.currentTarget.style.color = 'rgba(255,244,230,0.5)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting ? 'rgba(242,106,10,0.35)' : 'linear-gradient(135deg, #F26A0A, #FF8B14)',
                    color: '#fff',
                    boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(242,106,10,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(242,106,10,0.45)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(242,106,10,0.3)'
                    }
                  }}
                >
                  {isSubmitting ? 'Saving…' : modalMode === 'create' ? 'Create Event' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
