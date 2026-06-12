# 🎨 UI/UX Design Guide — Nexus E-commerce

## 1. Design Philosophy

Nexus E-commerce combines a modern shopping experience with a technical IT Hub. The design must be clean, intuitive, and highly responsive. 

- **Clarity:** Products and services should be easy to find.
- **Performance:** Fast loading images and smooth transitions.
- **Trust:** Clear security indicators during checkout and professional presentation of IT Hub experts.

## 2. Color Palette (Tailwind Configuration)

The primary styling tool is Tailwind CSS. The color scheme focuses on trust (blues) and clean spaces (whites/grays).

- **Primary Brand:** Deep Blue (`bg-blue-600`, `text-blue-600`) - Used for primary actions, buttons, and links.
- **Secondary / Accent:** Teal or Cyan - Used for the IT Hub and tech-related sections.
- **Backgrounds:** White (`bg-white`) and light gray (`bg-gray-50`) for contrast.
- **Text:** Dark Gray (`text-gray-900`) for headers, Medium Gray (`text-gray-600`) for body text.
- **Alerts/Status:**
  - Success: Green (`text-green-600`, `bg-green-100`)
  - Warning: Yellow/Orange (`text-yellow-600`, `bg-yellow-100`)
  - Error: Red (`text-red-600`, `bg-red-100`)

## 3. Typography

- **Headings:** Bold, clear sans-serif.
- **Body:** Legible sans-serif for descriptions and general content.
- Use Tailwind classes like `text-2xl font-bold`, `text-sm text-gray-500` to maintain consistency.

## 4. Component Guidelines

### Buttons
- **Primary:** Solid background (e.g., `bg-blue-600 hover:bg-blue-700 text-white rounded-md`).
- **Secondary:** Outlined (e.g., `border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md`).

### Cards (Products & Services)
- Should have a subtle shadow (`shadow-md`), white background, and rounded corners (`rounded-lg`).
- Product images should be consistent in aspect ratio.

### Navigation
- Sticky top header with Logo, Search Bar, Cart Icon, and User Profile.
- Clear dropdowns for Categories and IT Hub Services.
