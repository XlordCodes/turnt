import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
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

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, whatsapp_number, instagram_handle')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#050505] pt-32 px-6 pb-16">
      <div className="max-w-xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #F26A0A, transparent)' }} />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#FF8B14', fontFamily: "'Space Mono', monospace" }}>
              Account
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
            style={{
              fontFamily: "'Jorgey', sans-serif",
              color: '#FFF7ED',
            }}
          >
            Your <span style={{
              background: 'linear-gradient(135deg, #F26A0A, #FFC46B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Profile</span>
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,244,230,0.35)' }}>
            Manage your personal details.
          </p>
        </div>

        <ProfileForm initialData={profile} />
      </div>
    </div>
  )
}
