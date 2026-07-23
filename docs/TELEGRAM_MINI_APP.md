# Telegram Mini App

Mira uses the same Next.js application, API routes, PostgreSQL profiles, and health records in the PWA and Telegram. Telegram is an additional authenticated client, not a second data store.

## Security model

- The browser sends Telegram `initData` to `POST /api/auth/telegram`.
- The server validates its HMAC with `TELEGRAM_BOT_TOKEN` and rejects payloads older than 15 minutes.
- Mira creates an opaque, 90-day, HttpOnly, SameSite cookie. The raw Telegram payload and bot token are not stored.
- Health records are sent only to Mira API routes over HTTPS. They are never sent to a bot chat or through `Telegram.WebApp.sendData`.
- Existing PWA accounts are linked through a random, single-use link that expires after 10 minutes.
- An existing Telegram profile containing health data is not merged automatically. This prevents silent overwrites or loss.
- A new Telegram profile is created only after the user accepts the terms, privacy notice, and separate health-data consent. Returning users enter without repeating those confirmations.

## BotFather setup

1. Create a bot with `@BotFather` and keep the token outside the repository.
2. Configure the Mini App URL as `https://mira-cycle.vercel.app/telegram`.
3. Set a menu button that opens the Mini App.
4. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_USERNAME` (without `@`) to the server-side Vercel environment.
5. Apply the Prisma migration before deploying the application.

For local visual work, open `/telegram`. Real authentication can only be tested from a Telegram client because a normal browser does not provide signed `initData`.

## Shared-account flow

From the PWA profile, choose “Подключить Telegram”. Mira generates a one-time deep link. Opening it attaches the Telegram identity to the existing `Profile`, so Today, calendar, periods, symptoms, and settings use the same records on both platforms.
