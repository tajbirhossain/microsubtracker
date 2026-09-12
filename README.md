# MicroSubTracker (Expo)

Android-first subscription tracker. Add subs fast, see burn rate, trials, calendar, cancel guides, ghost/unused alerts, currency stuff, local push — basically "stop forgetting what you're paying for every month."

Built with Expo (React Native). Talks to the backend under `../backend`.

## Stack

- Expo ~57 / React Native / Expo Router
- TypeScript
- AsyncStorage + Secure Store
- expo-notifications, netinfo, etc.
- Hits a Node/Express API (Postgres + Redis on the other side)

## Run it

Backend first helps. From `../backend`:

```bash
docker compose up -d
npm install
# copy .env.example → .env, set DATABASE_URL / JWT secrets, then:
npm run migrate
npm run dev
```

App side:

```bash
cp .env.example .env
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in `.env`:

- real phone on same wifi → `http://<your-pc-lan-ip>:5000/api`
- android emulator → `http://10.0.2.2:5000/api`
- simulator / web on this machine → `http://localhost:5000/api`

Then open Expo Go / emulator / whatever the terminal offers. Android is the main target.

```bash
npm run android
```

works too if you've got a device/emulator hooked up.

## Tests

Honestly the app doesn't have a full Jest suite wired up yet. Lint is what we've got:

```bash
npm run lint
```

Backend tests live in `../backend` — `npm test` there. That's where most of the real coverage is (auth, subs, parser, currency, etc.).
