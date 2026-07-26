# La Trobe Content Distribution Hub

A frontend-only university content publishing and distribution prototype for
Cloud Based Applications — Assessment 1.

## Getting started

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` — start the development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm start` — serve the production build

The application uses Next.js App Router, React, TypeScript, Tailwind CSS and
browser Local Storage. It has no backend, database, live RSS integration,
authentication or LMS connection.

Student details are configured in `src/config/app.ts`.
