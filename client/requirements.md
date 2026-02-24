## Packages
zustand | Lightweight global state management for the shopping cart
framer-motion | Page transitions, cart drawer animations, and micro-interactions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes without style conflicts

## Notes
- Using Zustand for client-side cart state to persist items across page navigations without backend dependencies.
- Images provided by user are used as static assets via Vite alias (@assets/).
- Custom brutalist/streetwear design system implemented via CSS variables and Tailwind utility classes.
- Expecting backend to seed products; frontend handles empty states gracefully.
- Prices assumed to be in Moroccan Dirham (MAD), calculated from cents (price / 100).
