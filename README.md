This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

Run the provided script to install dependencies and configure git hooks:

```bash
./setup.sh
```

## Getting Started

After the initial setup, start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

The application requires the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

PERPLEXITY_API_URL
PERPLEXITY_API_KEY
TRANSLATION_API_URL
TRANSLATION_API_KEY
CRON_SECRET (optional)

RESEND_API_KEY (optional)
DISCORD_WEBHOOK_URL (optional)
```

`PERPLEXITY_API_URL` and `PERPLEXITY_API_KEY` configure the Perplexity API used to generate article summaries. `TRANSLATION_API_URL` and `TRANSLATION_API_KEY` configure the translation service for converting summaries into Japanese when necessary.

`CRON_SECRET` secures the `/api/news/cron` endpoint. When set, you must supply this value as a Bearer token, query parameter, or rely on the `x-vercel-source: cron` header added by Vercel Cron jobs.

`RESEND_API_KEY` and `DISCORD_WEBHOOK_URL` allow the contact form to send email
and Discord notifications. If you do not need the contact form, these variables
can be omitted.
