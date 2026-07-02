'use client'
import Image from 'next/image'

const galleryItems = [
  { id: 1, title: 'Beach Hang', sub: 'Vibes', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { id: 2, title: 'Chill Session', sub: 'Relax', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80' },
  { id: 3, title: 'Sunset Vibes', sub: 'Golden', img: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=800&q=80' },
  { id: 4, title: 'Group Vibe', sub: 'Together', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80' },
  { id: 5, title: 'Sand Games', sub: 'Play', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { id: 6, title: 'Golden Hour', sub: 'Chill', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80' },
  { id: 7, title: 'Wave Watch', sub: 'Ocean', img: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=800&q=80' },
  { id: 8, title: 'Connect', sub: 'Friends', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80' },
  { id: 9, title: 'Beach Walk', sub: 'Stroll', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { id: 10, title: 'Night Lights', sub: 'City', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80' },
  { id: 11, title: 'The Crew', sub: 'Squad', img: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=800&q=80' },
  { id: 12, title: 'Good Times', sub: 'Vibes', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80' },
]

const doubled = [...galleryItems, ...galleryItems]

function GalleryCard({ item }) {
  return (
    <div
      className="group relative shrink-0 w-64 h-80 md:w-72 md:h-96 rounded-2xl overflow-hidden cursor-pointer"
      style={{
        border: '1px solid rgba(255,196,107,0.06)',
      }}
    >
      <Image
        src={item.img}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 256px, 288px"
        className="object-cover transition-all duration-500 group-hover:scale-110"
        style={{
          filter: 'grayscale(100%) brightness(0.7)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(5,5,5,0.8) 0%, transparent 50%)',
      }} />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{
          color: '#FF8B14',
          fontFamily: "'Space Mono', monospace",
        }}>
          {item.sub}
        </p>
        <h3 className="text-sm font-bold tracking-widest uppercase" style={{ color: '#FFF7ED' }}>
          {item.title}
        </h3>
      </div>

      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{
        border: '1px solid rgba(242,106,10,0.3)',
        boxShadow: 'inset 0 0 30px rgba(242,106,10,0.1)',
      }} />
    </div>
  )
}

export default function Gallery() {
  return (
    <section id="gallery" className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#050505' }}>

      <div className="px-6 md:px-12 mb-10 md:mb-14 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #F26A0A, transparent)' }} />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#FF8B14' }}>
            Gallery
          </span>
        </div>
        <h2 className="leading-[1.1] tracking-wide" style={{
          fontFamily: "'Jorgey', sans-serif",
          fontSize: 'clamp(40px, 8vw, 80px)',
          color: '#FFF7ED',
        }}>
          THE <span style={{
            background: 'linear-gradient(135deg, #F26A0A, #FFC46B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>VIBES</span>
        </h2>
      </div>

      <div className="relative mb-4">
        <div
          className="flex gap-4"
          style={{
            animation: 'scroll-left 40s linear infinite',
            width: 'max-content',
          }}
        >
          {doubled.map((item, i) => (
            <GalleryCard key={`r1-${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>

      <div className="relative">
        <div
          className="flex gap-4"
          style={{
            animation: 'scroll-right 45s linear infinite',
            width: 'max-content',
            transform: 'translateX(-30%)',
          }}
        >
          {doubled.map((item, i) => (
            <GalleryCard key={`r2-${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-24 z-10" style={{
        background: 'linear-gradient(to right, #050505, transparent)',
      }} />
      <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-24 z-10" style={{
        background: 'linear-gradient(to left, #050505, transparent)',
      }} />
    </section>
  )
}
