# Kevish Sewliya Portfolio - Next.js

A modern portfolio website built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- ⚡ Built with Next.js 14 App Router
- 🎨 Styled with Tailwind CSS
- 📱 Fully responsive design
- 🌙 Modern hero section with GitHub contributions graph
- 💼 Experience, Skills, Projects, and Education sections
- 🔗 Social media links with interactive hover effects

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd nextjs-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy your assets from the parent `Assests` folder to `public/`:
   ```bash
   cp -r ../Assests/* public/
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nextjs-portfolio/
├── public/               # Static assets (images, favicon, resume)
├── src/
│   ├── app/
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   └── components/
│       ├── Header.tsx
│       ├── Hero.tsx
│       ├── GitHubContributions.tsx
│       ├── Experience.tsx
│       ├── Skills.tsx
│       ├── Work.tsx
│       ├── Education.tsx
│       └── Footer.tsx
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Build for Production

```bash
npm run build
npm start
```

## Deploy

This project can be easily deployed on [Vercel](https://vercel.com/), [Netlify](https://netlify.com/), or any other hosting platform that supports Next.js.

## License

MIT

## Admin, contact form and analytics (Supabase)

The site stores contact messages, resume uploads and anonymous page views in Supabase.
Everything runs server-side with the secret key; nothing Supabase-related is shipped to the browser.

1. Create a Supabase project, open **SQL → New query**, paste [`supabase/schema.sql`](supabase/schema.sql) and run it.
   It creates the tables (with row level security on), the public `resume` storage bucket and the analytics functions.
2. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`
   and `ADMIN_SESSION_SECRET` (`openssl rand -base64 48`). Optionally add `GITHUB_TOKEN` (a read-only token) for the GitHub widget.
3. Add the same variables in **Vercel → Project → Settings → Environment Variables** and redeploy.

Routes:

- `/contact`: public contact form (honeypot, timing check and 5 messages per hour per visitor).
- `/admin`: password-protected dashboard (analytics), `/admin/messages` (inbox), `/admin/resume` (upload a new PDF; `/resume` updates immediately).
- `/api/track`: records an anonymous page view (no cookies, no stored IPs; bots and the signed-in admin are skipped).
- `/api/views`: public total visit count shown in the footer.

Without the environment variables the site still builds and runs: the contact form shows an email fallback,
the visit counter is hidden and `/resume` serves `public/Kevish_Resume.pdf`.
