# Project Structure

This is the main folder layout for Budget Guard.

```
bunq-budget-guard/
├─ docs/                # Markdown files (about, getting-started…)
├─ public/              # Static files (images, icons, logo)
├─ src/
│  ├─ app/              # Pages, routes, and layouts
│  ├─ actions/          # Server actions (limits, auth, payments)
│  ├─ db/               # Database schema, views, and migrations
│  ├─ lib/              # Helpers (Bunq client, auth)
│  ├─ prompts/          # AI prompt templates
│  ├─ components/       # UI components
│  └─ styles/           # Global and component CSS
├─ next.config.ts       # Next.js configuration
├─ drizzle.config.ts    # Drizzle ORM configuration
├─ tailwind.config.js   # Tailwind CSS configuration
├─ eslint.config.mjs    # ESLint rules
├─ package.json         # Project settings and scripts
└─ README.md            # Quick start guide

```

- **docs/**: All your `.md` files live here.  
- **public/**: Put images and static assets here.  
- **src/app/**: Contains pages and layouts for routing in Next.js.  
- **src/actions/**: Functions that run on the server (create limits, login).  
- **src/db/**: Database tables, views, and migration scripts.  
- **src/lib/**: Code for Bunq API calls and user authentication.  
- **src/prompts/**: Text templates for the AI to read and respond.  
- **src/components/**: Reusable UI pieces like buttons and cards.  
- **Config files**: Settings for Next.js, ORM, CSS, and linting.  
- **package.json**: Lists dependencies and commands (like `npm run dev`).

