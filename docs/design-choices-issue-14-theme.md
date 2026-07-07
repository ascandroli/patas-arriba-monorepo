# Design Choices — Issue #14: MUI Theme & Design-System Reference

> **Purpose of this doc.** A handoff brief for the next task: turning the ad-hoc
> styling in the client into a *proper* MUI design system, sourced from the
> foundation's real branding. Written so a fresh session can start from here
> without reconstructing context. Companion to
> [`design-choices-issue-14-mobile-first.md`](design-choices-issue-14-mobile-first.md)
> (the audit) and the `docs/mockup/v5-mui-light.html` reference.

## Goal

One MUI theme that is the single source of truth for color, typography, spacing,
radius, and component styling — so components reference `theme.palette.*` /
`theme.typography.*` and **never a raw hex or magic number**. Extracted from the
foundation's branding, not reverse-engineered from the mockup's guesses.

**Framework is settled: MUI v7 stays.** The audit and an external developer's
proposal video both independently chose MUI; the problem was always *usage*, not
the framework. No Tailwind, no Hero UI.

## Source of truth: the website (with a caveat)

Branding source: **https://www.fundacionpatasarriba.com/** (WordPress site).

**The extraction is not automatic.** `WebFetch` converts pages to markdown and
strips the CSS, so it cannot read hex codes or font stacks. To get real tokens,
one of:

1. **Inspect the site CSS directly** — find the theme stylesheet under
   `wp-content/` and read the CSS custom properties / color declarations. Most
   reliable for exact values.
2. **Visual eyedrop / screenshot** — open the site in the browser (Claude-in-Chrome,
   once the extension is connected) and sample colors + read the computed
   `font-family`. Good for a curated palette.
3. **Ask for the brand assets** — if a logo pack / brand guide PDF or Figma
   exists, that beats scraping a WordPress theme (which may itself be
   inconsistent).

Treat the site as a **reference to curate**, not to copy verbatim — a WP theme
often carries incidental colors that aren't real brand tokens. Known anchor:
brand primary is **`#EFB665`** (amber). The site logo is a **black horizontal
wordmark** ("PATAS ARRIBA"), white variant in the footer; tone is warm, playful,
clean sans-serif.

## Where `/design-sync` fits (important)

`/design-sync` (the `DesignSync` tool) **does not extract anything from a
website.** It syncs a *local component library* to a **claude.ai/design**
design-system project through the user's login. Its correct role is the **last**
step, not the first:

    extract branding (by hand, from CSS/assets)
      → build the MUI theme (theme.js + component overrides)
      → render the components as preview cards
      → /design-sync  ── publish to a claude.ai Design project
                         (browsable, shareable stakeholder reference)

So `/design-sync` is how the finished system becomes a shareable reference — it
is not the extractor.

## Token taxonomy to define

Fill these in the theme, each from a branding decision (not a guess):

- **Color**
  - `primary` (amber `#EFB665` + light/dark/contrastText — **validate contrast**, see below)
  - `secondary` + any real second brand color (today `#173A5E` navy — confirm it's a brand color, not incidental)
  - semantic: `error` / `warning` / `success` / `info` (confirm or replace the current generic values)
  - **surfaces**: name every near-white today hardcoded inline — `background.default`,
    `background.paper`, and the panel grey currently written as `#F5F5F2` / `#F0F0EC`.
    Give them names; delete the inline hex.
  - **category taxonomy**: unify the *two* duplicate systems (`CAT_COLORS` for events,
    `GLOSSARY_CAT_COLORS` for info) into one structured map on the theme.
  - **avatar/user colors**: derive from a palette instead of hand-assigning per user.
- **Typography** — keep the principle already applied in v5: inherit MUI defaults
  for body/subtitle/inputs (16 / 14 / 12px, and 16px inputs avoid iOS focus zoom);
  override only the display headings (MUI's `h1` default is 96px/weight 300 —
  desktop-scale). Set the real brand font if the site uses one other than Roboto.
- **Shape / spacing / elevation** — radius scale (v5 uses 12/16/10/20), the 8px
  spacing rhythm, and a restrained shadow set.
- **Component overrides** (`theme.components`) — Button (48px min touch target),
  IconButton (44px), Card, Chip, TextField, BottomNavigationAction. Move the
  styling that today lives in the production app's `App.css` `!important` block
  **into `theme.components`** and delete the CSS overrides.

## Known "no-reference" mistakes to fix

These are the concrete symptoms of not having a design system today (seen in v4/v5):

1. Hardcoded hex in `sx` instead of tokens (`#F5F5F2`, `#F0F0EC`, `#1A1A1A`, …).
2. Two parallel category-color systems (`CAT_COLORS` vs `GLOSSARY_CAT_COLORS`).
3. `primary.contrastText: '#173A5E'` — dark navy text on the amber primary button.
   Might be intentional, but **needs a documented WCAG contrast check**, not a guess.
4. Multiple unnamed near-white surfaces + two blues (`secondary #173A5E`, `info #3498DB`)
   with no stated roles.
5. Per-user hand-assigned avatar colors (`USERS[].color`).
6. Production `client/src/App.css` overrides MUI classes with `!important` (fonts
   shrunk, button/chip sizes forced) — the anti-pattern the theme should replace.

## Reference artefacts

- **`docs/mockup/v5-mui-light.html`** — current stakeholder-ready mockup (chosen
  light direction). Adopts the video's welcome/login, 3–4 tab nav, Información
  screen with search+filters; keeps v4's profile. Its theme block is the starting
  point to harden.
- **`docs/design-choices-issue-14-mobile-first.md`** — the audit (12 findings,
  10 changes) and **4 still-unanswered open questions** (org/admin nav items, FAB
  placement, GoBack redesign, logout placement) worth closing alongside the theme.
- Target for the real theme: **`client/src/main.jsx`** (currently holds the
  hand-typed `createTheme`).

## Suggested first steps for the theme session

1. Extract the real palette + fonts from the site CSS (option 1 or 2 above).
2. Draft `theme` with named tokens for every color/size in the taxonomy; port v5's
   heading + component overrides onto it.
3. Reconcile the two category systems and the contrastText contrast decision.
4. Rebuild v5 → v6 on the extracted theme to confirm nothing regresses visually.
5. Split v6 into component preview cards and `/design-sync` them to a claude.ai
   Design project for stakeholder review.
6. Only then port the theme into `client/src/main.jsx` and delete the `App.css`
   `!important` overrides — under the repo's spec-first + TDD discipline.
