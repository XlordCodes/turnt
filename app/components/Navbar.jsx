'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import MyEventsSidebar from './MyEventsSidebar'
import { motion } from 'framer-motion'

const links = [
    { label: 'Home', href: '#home' },
    { label: 'Events', href: '#upcoming' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        let cancelled = false

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (cancelled) return
            setUser(session?.user ?? null)
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()
                if (!cancelled) setIsAdmin(profile?.role === 'admin')
            } else {
                setIsAdmin(false)
            }
        })

        return () => {
            cancelled = true
            subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const close = useCallback(() => setOpen(false), [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        close()
        router.push('/')
    }

    return (
        <>
            {/* ─── Floating Pill Navbar ─── */}
            <header className="fixed top-0 left-0 w-full z-[100] transition-all duration-300">
                <nav
                    className="flex items-center justify-between gap-3 px-5 py-3 mx-auto transition-all duration-300"
                    style={{
                        maxWidth: 'min(96vw, 1100px)',
                        marginTop: '16px',
                        background: scrolled ? 'rgba(5,5,5,0.92)' : 'rgba(5,5,5,0.75)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: `1px solid ${scrolled ? 'rgba(242,106,10,0.15)' : 'rgba(255,196,107,0.06)'}`,
                        borderRadius: '9999px',
                        boxShadow: scrolled
                            ? '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(242,106,10,0.08)'
                            : '0 4px 24px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 whitespace-nowrap" onClick={close}>
                        <span
                            className="text-xl font-bold tracking-tight"
                            style={{
                                fontFamily: "'Jorgey', sans-serif",
                                background: 'linear-gradient(135deg, #F26A0A, #FFC46B)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            TURNT
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <ul className="hidden md:flex items-center gap-1">
                        {links.map(({ label, href }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    className="block px-3 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    style={{ color: 'rgba(255,244,230,0.5)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#FFF7ED'
                                        e.currentTarget.style.background = 'rgba(242,106,10,0.1)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255,244,230,0.5)'
                                        e.currentTarget.style.background = 'transparent'
                                    }}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Right side: Auth buttons + Hamburger */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <button
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    style={{
                                        border: '1px solid rgba(242,106,10,0.3)',
                                        color: '#F26A0A',
                                        background: 'transparent',
                                    }}
                                    onClick={() => setIsSidebarOpen(true)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(242,106,10,0.08)'
                                        e.currentTarget.style.borderColor = 'rgba(242,106,10,0.5)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.borderColor = 'rgba(242,106,10,0.3)'
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    My RSVPs
                                </button>
                                <Link
                                    href="/profile"
                                    className="hidden sm:flex items-center px-3 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    style={{
                                        border: '1px solid rgba(242,106,10,0.3)',
                                        color: '#F26A0A',
                                        background: 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(242,106,10,0.08)'
                                        e.currentTarget.style.borderColor = 'rgba(242,106,10,0.5)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.borderColor = 'rgba(242,106,10,0.3)'
                                    }}
                                >
                                    Profile
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="hidden sm:flex items-center px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
                                        style={{
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            color: '#EF4444',
                                            background: 'transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
                                        }}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    className="hidden sm:flex items-center px-3 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    style={{
                                        background: 'linear-gradient(135deg, #F26A0A, #FF8B14)',
                                        color: '#fff',
                                        boxShadow: '0 4px 16px rgba(242,106,10,0.3)',
                                    }}
                                    onClick={handleLogout}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)'
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(242,106,10,0.45)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none'
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(242,106,10,0.3)'
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
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
                                Login
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        )}

                        {/* Mobile hamburger - FRAMER MOTION FLUID MORPH */}
                        <button
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors z-50 relative"
                            onClick={() => setOpen((p) => !p)}
                            aria-label="Toggle menu"
                            aria-expanded={open}
                        >
                            <motion.svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#FFF7ED"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <motion.path
                                    animate={open ? "open" : "closed"}
                                    variants={{
                                        closed: { d: "M 4 6 L 20 6" },
                                        open: { d: "M 5 5 L 19 19" }
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                                <motion.path
                                    animate={open ? "open" : "closed"}
                                    variants={{
                                        closed: { opacity: 1 },
                                        open: { opacity: 0 }
                                    }}
                                    d="M 4 12 L 20 12"
                                    transition={{ duration: 0.3 }}
                                />
                                <motion.path
                                    animate={open ? "open" : "closed"}
                                    variants={{
                                        closed: { d: "M 4 18 L 20 18" },
                                        open: { d: "M 5 19 L 19 5" }
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.svg>
                        </button>
                    </div>
                </nav>

                {/* Mobile dropdown */}
                <div
                    className="md:hidden overflow-hidden transition-all duration-300"
                    style={{ maxHeight: open ? '500px' : '0', opacity: open ? 1 : 0, marginTop: open ? '8px' : '0' }}
                >
                    <div
                        className="rounded-2xl border p-2 flex flex-col gap-1 mx-5"
                        style={{
                            background: 'rgba(5,5,5,0.95)',
                            borderColor: 'rgba(255,196,107,0.08)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                        }}
                    >
                        {links.map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                onClick={close}
                                className="block px-4 py-3 text-sm font-semibold tracking-widest uppercase rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                                style={{ color: 'rgba(255,244,230,0.6)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(242,106,10,0.1)'
                                    e.currentTarget.style.color = '#FFF7ED'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'rgba(255,244,230,0.6)'
                                }}
                            >
                                {label}
                            </a>
                        ))}

                        <div className="border-t my-1 mx-2" style={{ borderColor: 'rgba(255,196,107,0.08)' }} />

                        {user ? (
                            <>
                                <button
                                    onClick={() => { close(); setIsSidebarOpen(true) }}
                                    className="block w-full text-left px-4 py-3 text-sm font-bold tracking-widest uppercase rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    style={{ color: 'rgba(255,244,230,0.6)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(242,106,10,0.1)'
                                        e.currentTarget.style.color = '#F26A0A'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = 'rgba(255,244,230,0.6)'
                                    }}
                                >
                                    My RSVPs
                                </button>
                                <Link
                                    href="/profile"
                                    onClick={close}
                                    className="block w-full text-left px-4 py-3 text-sm font-bold tracking-widest uppercase rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    style={{ color: 'rgba(255,244,230,0.6)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(242,106,10,0.1)'
                                        e.currentTarget.style.color = '#F26A0A'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = 'rgba(255,244,230,0.6)'
                                    }}
                                >
                                    Profile
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={close}
                                        className="block w-full text-left px-4 py-3 text-sm font-black tracking-widest uppercase rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                                        style={{ color: '#EF4444' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent'
                                        }}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-3 text-sm font-bold tracking-widest uppercase rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    style={{ color: 'rgba(255,244,230,0.8)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                        e.currentTarget.style.color = '#FFF'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = 'rgba(255,244,230,0.8)'
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={close}
                                className="block w-full text-left px-4 py-3 text-sm font-bold tracking-widest uppercase rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                                style={{ color: 'rgba(255,244,230,0.6)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(242,106,10,0.1)'
                                    e.currentTarget.style.color = '#F26A0A'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'rgba(255,244,230,0.6)'
                                }}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Spacer */}
            <div className="h-20" />

            {/* Sidebar */}
            <MyEventsSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    )
}