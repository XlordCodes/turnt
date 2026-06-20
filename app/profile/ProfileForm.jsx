'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ProfileForm({ initialData }) {
  const router = useRouter()

  const [fullName, setFullName] = useState(initialData?.full_name || '')
  const [whatsappNumber, setWhatsappNumber] = useState(initialData?.whatsapp_number || '')
  const [instagramHandle, setInstagramHandle] = useState(initialData?.instagram_handle || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.rpc('update_own_profile', {
      p_full_name: fullName,
      p_whatsapp_number: whatsappNumber,
      p_instagram_handle: instagramHandle || null,
    })

    setIsSubmitting(false)

    if (error) {
      alert('Failed to update profile: ' + error.message)
      return
    }

    setSuccessMessage('PROFILE UPDATED')
    router.refresh()

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const inputStyle = {
    background: '#050505',
    border: '1px solid rgba(255,196,107,0.1)',
    color: '#FFF7ED',
  }

  const labelStyle = {
    color: 'rgba(255,244,230,0.35)',
    fontFamily: "'Space Mono', monospace",
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {successMessage && (
        <div
          className="px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase text-center"
          style={{
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.25)',
            color: '#4ade80',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label
          className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5"
          style={labelStyle}
        >
          Full Name
        </label>
        <input
          type="text"
          required
          value={fullName || ''}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
        />
      </div>

      {/* WhatsApp Number */}
      <div>
        <label
          className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5"
          style={labelStyle}
        >
          WhatsApp Number
        </label>
        <input
          type="tel"
          required
          value={whatsappNumber || ''}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
        />
      </div>

      {/* Instagram Handle */}
      <div>
        <label
          className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5"
          style={labelStyle}
        >
          Instagram Handle <span style={{ color: 'rgba(255,244,230,0.2)' }}>(optional)</span>
        </label>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'rgba(255,244,230,0.25)' }}
          >
            @
          </span>
          <input
            type="text"
            value={instagramHandle || ''}
            onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
            placeholder="your_username"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(242,106,10,0.4)' }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,196,107,0.1)' }}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
