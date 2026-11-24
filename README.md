# ZILENIX Technologies website

## Local preview
Run `npm ci` and `npm run dev`. If the site-content API is unavailable, the Vite development build displays clearly labeled sample content so the pages can be reviewed without a database. The local contact form does not send or save enquiries, the chat uses sample replies, and the admin dashboard is disabled in this preview.

To run the real API locally, configure the environment below and use Vercel's development server (`vercel dev`) so `/api/*` functions are served. Keep the service-role key server-side; never expose it with a `VITE_` variable.

## Environment
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — browser-side Supabase authentication.
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — server-side API functions.

Do not commit local environment files or secrets.

## Launch details
Public phone, WhatsApp, email, and address values are intentionally blank until confirmed. Add approved public details to `contactDetails` in `src/App.tsx`; unset details are omitted rather than shown as placeholders. Update `public/sitemap.xml` with the production domain before launch.

## Updating content
Sign into `/admin` using a Supabase email/password account when running against a configured backend. Enquiries are visible in the dashboard. The API exposes editable resources for services, industries, FAQs, counters, testimonials, projects, and the ZILENIX knowledge base through `/api/admin-content?table=...`; connect the same authenticated pattern to additional CMS forms as the admin team expands.

## ZILENIX
ZILENIX intentionally handles only company questions, avoids prices, and captures enquiries through `/api/zilenix`. Update grounded question/answer content in the `knowledge_base` table. To connect a model later, call it only server-side in `api/zilenix.js`, with a server environment key; never expose it in Vite.
