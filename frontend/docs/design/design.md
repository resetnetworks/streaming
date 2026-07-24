# Reset Music — Unified Design System

> A simple, concise design reference for the MusicReset platform. Always use these exact tokens when building or updating components to ensure a consistent, premium dark-mode experience.

## 1. Primary Colors

### Backgrounds (Dark Theme)
- `bg-[#020216]` - **Deepest Background**: Use for the Landing page, Hero sections, and main page wrappers.
- Solid `#020216` as the background (no blue glowing orb or square grid mesh in background).
- `bg-[#0E1525]` - **Sidebar Background**: Use for the User/Artist sidebars and mobile navbars.
*Rule: Never use light backgrounds. Stick to these deep navy/black tones.*

### Premium Cards & Container Design
Always wrap forms, success summaries, and main panels in a premium gradient card with the following styling:
- **Gradient Background**: `linear-gradient(145deg, #0D1B3F 0%, #0A0A23 100%)`
- **Shadow & Glow Effects**:
  ```css
  box-shadow: 12px 12px 40px rgba(0,0,0,0.7), -8px -8px 30px rgba(59,130,246,0.08), inset 1px 1px 1px rgba(255,255,255,0.05), 0 0 0 1px rgba(59,130,246,0.1)
  ```
- **Border Radius**: `rounded-[24px]` (24px) for premium look and feel.

### Brand Blue (Core Identity)
- `text-[#4DB3FF]` / `border-[#4DB3FF]` - **Accent Blue (Highly Used)**: Use for all highlighted text, links, active navigation links, outline borders, hero tags, and info labels.
- `bg-[#3380FF]` - **Solid Blue (Highly Used)**: Use for active dots, progress bars, and highlights.
- `text-[#88B2EF]` - **Light Blue**: Use for footer section headings and subtle glowing borders.

---

## 2. Gradients & Action Elements

### Primary Action Button Gradient
`background: linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)`
- **Behavior & Hover**:
  - Remove zoom/scale animations on hover.
  - On hover, use: `hover:brightness-110` and `box-shadow: 0 0 15px rgba(51, 128, 255, 0.2)` glow effect.
  - On active click: `active:scale-95` transition.
- **Where to use**: Main CTAs, Sign In, Register, Forgot Password, and "Submit Application" buttons.

### Underlines & Links
- Remove default underlines on redirection links (`no-underline`).
- Show underlines only on hover (`hover:underline`).

### Input Fields & Placeholders
- Add `input-login` class style with Jura font and matching height/paddings.
- Labels must use uppercase tracking-wider font with mutes like `text-slate-300 text-sm font-medium`.

---

## 3. Custom Features & Loading Indicators

### Password Criteria Validation Colors
- **Initial state**: Slate gray (`text-slate-400`).
- **On type validation**: Turns green (`text-green-500`) if valid.
- **Error state**: Turns red (`text-red-400`) ONLY after a submission fails and criteria is still invalid.

### Unified Loader Component
Use the SVG icon-based `<Loader />` component across all pages:
- Set `bg-[#020216]` for the full-screen loader layout.
- For nested sub-page loaders (e.g. inside cards/dashboard tabs), use:
  ```jsx
  <Loader noBg={true} />
  ```
  to avoid rendering a black overlay wrapper.

---

## 4. Typography

- **Font Family**: Only use **Jura**. (`font-family: 'Jura', sans-serif;`)
- **Main Headings**: `text-4xl font-extrabold uppercase tracking-wider bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent` (premium black-and-white shade effect).
- **Secondary Text**: `text-gray-300` or `text-gray-400` - Use for body text, descriptions, subtitles, and inactive links.

---

## 5. Quick Rules (Do's and Don'ts)

- ✅ **DO** use `#4DB3FF` for all text highlights, links, and borders.
- ✅ **DO** use the premium container gradient (`#0D1B3F` to `#0A0A23`) with custom shadows for all forms/boxes.
- ✅ **DO** use the `45deg` gradient (`#0F3272` to `#3380FF`) with brightness hover-glow (no zoom) for CTA buttons.
- ✅ **DO** use the `Jura` font everywhere.
- ❌ **DON'T** use default Tailwind blues randomly.
- ❌ **DON'T** use light backgrounds or zoom scaling on hover for CTA buttons.

*Last updated: July 2026 | Project: Reset Music Streaming Platform*
