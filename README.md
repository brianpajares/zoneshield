# ZoneShield

ZoneShield helps people pause before responding to a suspicious message or link. The first usable version includes a private, in-browser risk estimate, plain-language signals, practical next steps, and a shareable alert that omits the original message.

## Run locally

Requirements: Node.js 24.x and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/es`. The English and Portuguese versions are at `/en` and `/pt`.

## Checks

```bash
npm run engine:verify
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:a11y
npm run licenses
```

The end-to-end and accessibility checks use Playwright Chromium. Install its browser once with `npx playwright install chromium` if the environment does not already have it. `npm run licenses` skips only the unused optional Sharp image binaries; this app does not use `next/image` or image processing, and those packages bring LGPL-licensed libvips binaries into the optional install tree.

To exercise the optimized build rather than the development server, stop any server on port 3000 and run:

```bash
npm run build
PLAYWRIGHT_PRODUCTION=1 npm run test:e2e
```

## Deploy to Vercel

The repository includes `vercel.json` for Next.js auto-detection and `.vercelignore` to omit local caches, secrets, and browser artifacts. No runtime secrets are required for the current browser-only checker.

From this directory, authenticate with the official Vercel CLI, link the intended account/team and project, then deploy:

```bash
npx vercel login
npx vercel link
npx vercel deploy --prod
```

Confirm `/es`, `/en`, `/pt`, the root redirect, the checker, and the disabled checkout on the resulting URL. The app remains a preview with indexing disabled. Authentication and project IDs belong in the CLI's local configuration, not in source control. For this cloud workspace, `--global-config /tmp/zoneshield-vercel` provides a writable CLI configuration directory if the default home directory is unavailable. The environment's outbound policy must permit `api.vercel.com` and `vercel.com`; add the exact deployment hostname to verify the public site after deployment.

## Current product boundary

- The deterministic engine runs in the browser. The original text and link are not sent to a server or stored.
- Domain-age and external reputation lookups, accounts, shared family spaces, report saving, and recovery-guide checkout are not connected yet.
- Prices are shown as the intended offer from the product brief. Checkout is deliberately closed in this preview; no payments are accepted.
- Complete legal pages, owner details, an active billing store, product delivery, security controls, and approval are launch requirements. See `docs/launch-checklist.md`.
- Search indexing is disabled while the product is a preview.

The rules and 12 reference cases came from the supplied ZoneShield kit. See `data/ATTRIBUTION.md` for the scope and limits of the local data.
