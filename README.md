# Pool Pal

A calm, mobile-friendly swimming pool care tracker for homeowners. Log water chemistry, keep up with maintenance, and jot notes — all in the browser, with no account and no backend.

## Features

- **Water chemistry** — record pH, chlorine or bromine, alkalinity, cyanuric acid, and temperature with a date and time
- **Range status** — each reading is marked OK, High, or Low against typical residential targets
- **Tasks** — due dates, completion, and a few common chore shortcuts
- **Notes** — free-form backyard journal entries
- **Local only** — everything persists in `localStorage` (`pool-pal.v1`)

Typical ranges used for status (not a lab prescription):

| Metric | Typical residential range |
| --- | --- |
| pH | 7.2–7.8 |
| Free chlorine | 1–4 ppm |
| Bromine | 3–5 ppm |
| Total alkalinity | 80–120 ppm |
| Cyanuric acid | 30–50 ppm |
| Temperature | 78–86 °F |

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Stack

Vite, React, and TypeScript. Data never leaves this device.
