# Reset Music — Unified Design System

> A simple, concise design reference for the MusicReset platform. Always use these exact tokens when building or updating components to ensure a consistent, premium dark-mode experience.

## 1. Primary Colors

### Backgrounds (Dark Theme)
- `bg-[#020216]` - **Deepest Background**: Use for the Landing page, Hero sections, and main wrappers.
- `bg-[#0A0A23]` - **Dark Background**: Use for inner cards, modals, and form containers.
- `bg-[#0E1525]` - **Sidebar Background**: Use for the User/Artist sidebars and mobile navbars.
*Rule: Never use light backgrounds. Stick to these deep navy/black tones.*

### Brand Blue (Core Identity)
- `text-[#4DB3FF]` / `border-[#4DB3FF]` - **Accent Blue (Highly Used)**: Use for all highlighted text, icons, active navigation links, outline borders, hero tags, and info labels.
- `bg-[#3380FF]` - **Solid Blue (Highly Used)**: Use for standard solid buttons, active dots, hover backgrounds, and progress bars.
- `text-[#88B2EF]` - **Light Blue**: Use for footer section headings and subtle glowing borders.

---

## 2. Gradients

### Primary Action Button Gradient
`background: linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)`
- **Where to use**: Main CTAs like "Start Streaming", "Listen Now" (Hero Section), "Request Payout" (Artist Dashboard), and "Subscribe Now" (Modals).

### Active Navigation Sidebar Gradient
`bg-gradient-to-r from-[#0950D7] via-[#4197C8] to-[#0950D7]` (or fading to transparent)
- **Where to use**: Active menu items in the User Sidebar and Artist Dashboard Sidebar.

### Album Card Image Overlay Gradient
`background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(15, 20, 61, 0.65) 60%, rgba(15, 66, 201, 0.95) 100%)`
- **Where to use**: Placed over album covers and music artwork cards to ensure text readability at the bottom.

### Gradient Border Wrapper (Secondary Buttons)
`background: linear-gradient(131.43deg, #ffffff 10.34%, #88b2ef 20.21%, #88b2ef 72.19%, #033caa 94.16%)`
- **Where to use**: Used as a 1px padding wrapper around dark buttons (like Header "Sign In" or Login submit) to create a glowing border effect.

---

## 3. Typography

- **Font Family**: Only use **Jura**. (`font-family: 'Jura', sans-serif;`)
- **Primary Text**: `text-white` (`#FFFFFF`) - Use for main headings, song titles, and important data.
- **Secondary Text**: `text-gray-300` or `text-gray-400` - Use for body text, descriptions, subtitles, and inactive links.
- **Accent Text**: `text-[#4DB3FF]` - Use for anything that needs to stand out or indicate an active state.

---

## 4. Components & UI Elements

### Glassmorphism (Cards & Modals)
```css
background: rgba(2, 2, 22, 0.15);
backdrop-filter: blur(44px);
-webkit-backdrop-filter: blur(44px);
border: 1px solid rgba(135, 135, 135, 0.565); /* or border-[#4DB3FF]/20 */
```
- **Where to use**: Subscription cards, Player UI background, and floating modals.

### Borders & Outlines
- Use `border-[#4DB3FF]` or `rgba(59,130,246,0.25)` for subtle outlines around feature cards or active elements (like the Featured Artist ring).

### Border Radius
- Use `rounded-lg` (8px) or `rounded-xl` (12px) for most buttons, inputs, and standard cards.

---

## 5. Quick Rules (Do's and Don'ts)

- ✅ **DO** use `#4DB3FF` for all text highlights, borders, and icons.
- ✅ **DO** use `#3380FF` for solid blue interactive elements.
- ✅ **DO** use the `45deg` gradient (`#0F3272` to `#3380FF`) for prominent action buttons.
- ✅ **DO** use the `Jura` font everywhere.
- ❌ **DON'T** use default Tailwind blues like `text-blue-500` or `bg-blue-400` randomly. Always stick to the specific hex codes above to prevent fragmentation.
- ❌ **DON'T** use light backgrounds anywhere in the app.
- ❌ **DON'T** introduce new font families.

*Last updated: May 2026 | Project: Reset Music Streaming Platform*
