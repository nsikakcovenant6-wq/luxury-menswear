# Luxury Menswear — Project Foundation

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · GSAP · React Three Fiber / Three.js · react-icons · next-themes · shadcn/ui primitives

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's here

This is foundation only — no pages have been built yet (by design). It includes:

- Global design tokens (color, type, motion) in `tailwind.config.ts` + `styles/globals.css`
- Root layout wiring fonts, theme provider, Navbar, Footer, floating actions
- Reusable components: Navbar, Footer, Button, Loader, SearchBar, ThemeToggle, LanguageToggle, AIChatButton, WhatsAppButton
- Hooks: `use-scroll-direction`, `use-lock-body-scroll`, `use-media-query`
- `lib/gsap.ts` — GSAP + ScrollTrigger singleton, ready to import in any client component

## Design language

- **Palette**: Obsidian `#0B0B0C`, Ivory `#F7F3EA`, Brushed Gold `#B08D57`, Burgundy `#3D1220`
- **Type**: Fraunces (display, italic-forward) · Inter (body) · JetBrains Mono (labels/prices)
- **Signature motif**: the "gold thread" — a 1px brushed-gold line that draws itself under nav items, links, and dividers on hover, echoing tailoring stitch-work
