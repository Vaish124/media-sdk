# media-sdk

## Overview

media-sdk is a headless media SDK ecosystem built around the Pexels API,
organized as a pnpm + Turborepo monorepo. A framework-agnostic core client
handles auth, caching, and events; thin React (and React Native-shaped)
wrappers expose that client as hooks; and a separate headless UI package
exposes accessible interaction patterns — an infinite-scroll grid, a
lightbox, and a reel/short-form swiper — with zero opinions about styling.
An app in `apps/web` is the only place that wires data hooks and UI hooks
together into a real product.

The packages are split the way they are for a few concrete reasons:
`@media-sdk/media-core` has zero React dependencies, so it is portable to a
CLI, a server, or a React Native app, and it is trivially unit-testable in
isolation from any UI framework. `@media-sdk/media-ui-react` ships zero
styles and zero data-fetching logic, so any consumer can bring their own CSS
approach (CSS Modules here, but Tailwind, vanilla-extract, or inline styles
would work identically) without forking the interaction logic. The
`media-native` / `media-ui-native` stubs exist to demonstrate that the same
hook-based API surface is intended to extend to React Native, even though a
full native implementation was out of scope for this build.

## Architecture

```
┌────────────────────────────────────┐
│             apps/web               │
│  (only file that wires data + UI)  │
└──────────┬──────────────┬──────────┘
           │              │
           ▼              ▼
 ┌──────────────┐  ┌──────────────────┐
 │ media-react  │  │  media-ui-react  │
 │ provider +   │  │  useGrid         │
 │ hooks        │  │  useLightbox     │
 └──────┬───────┘  │  useReelSwiper   │
        │          └──────────────────┘
        ▼        (zero imports from core/wrappers)
 ┌──────────────┐
 │ media-core   │
 │ client       │
 │ emitter      │
 │ cache        │
 │ types        │
 └──────────────┘
```

✅ Allowed: `media-react → media-core`, `media-native → media-core`,
`app → media-react`, `app → media-ui-react`

❌ Forbidden: `media-core → react / react-native`,
`media-ui-react → media-core or media-react`, `media-react → media-ui-react`

These boundaries are enforced by the root `.eslintrc.js`
(`import/no-restricted-paths`) and checked by `pnpm lint`.

## Packages

| Package | Purpose | Key Exports |
|---|---|---|
| @media-sdk/media-core | Framework-agnostic client | MediaSDK, PexelsClient, EventEmitter |
| @media-sdk/media-react | React provider + hooks | MediaProvider, useMediaSearch, useCuratedMedia, useMediaItem, useMediaEvents |
| @media-sdk/media-native | React Native (stub) | Same API as media-react |
| @media-sdk/media-ui-react | Headless UI hooks | useGrid, useLightbox, useReelSwiper |
| @media-sdk/media-ui-native | React Native UI (stub) | Same API as media-ui-react |

## Getting Started

```bash
git clone <repo-url>
cd media-sdk
pnpm install
cp .env.example apps/web/.env
# Add your Pexels API key to apps/web/.env
pnpm dev
```

## Skill Documents

- [skills/wiring-data/SKILL.md](skills/wiring-data/SKILL.md) — MediaProvider setup, hooks, events, pagination rules
- [skills/using-components/SKILL.md](skills/using-components/SKILL.md) — Prop-getter pattern, each component, a11y, styling contract

## AI-Assisted Development

[FILL THESE IN AFTER COMPLETING THE PROJECT — this is part of the submission]
- Parts written entirely by hand:
- Parts AI-generated following the master prompt:
- Parts built using the skill docs to steer the AI:
- What changed in AI output when skill docs were prepended vs not:
- Link to Claude conversation used for planning: [URL of this chat]
- Link to Claude Code sessions: [URLs]

## Scoping Decisions

| Cut | Rationale |
|---|---|
| media-native full impl | 8–12hr window; TypeScript signatures are complete and correct; documented |
| media-ui-native full impl | Same rationale; API surface matches media-ui-react |
| Video playback in Lightbox | Time constraint; thumbnail shown; noted as stretch goal |
| Visual polish | Explicitly not scored per task brief |
| Reels default query | Falls back to 'nature' when no search is active |

## Deployment

- App (Vercel): [FILL IN]
- Storybook (Vercel): [FILL IN]
- TypeDoc / SDK Docs (GitHub Pages): [FILL IN]
- Claude conversation: [FILL IN — save this URL]
