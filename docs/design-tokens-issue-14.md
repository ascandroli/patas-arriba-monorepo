# Design Tokens — Issue #14 (extracted from the foundation's branding)

> **What this is.** The single source of truth for the MUI theme's named tokens,
> extracted by hand from **https://www.fundacionpatasarriba.com/** on 2026-07-07
> (Claude-in-Chrome eyedrop of the live Elementor CSS variables + computed
> styles), then curated per the brief in
> [`design-choices-issue-14-theme.md`](design-choices-issue-14-theme.md).
> The theme block in `docs/mockup/v6-mui-light.html` implements exactly these
> tokens; `client/src/main.jsx` is the eventual port target.

## How the palette was extracted

Read directly off the live site (not WebFetch — that strips CSS). The site is a
WordPress/Elementor build; its **global** tokens are the closest thing to a brand
system it exposes:

| Elementor global | Value | Where it shows on the site |
|---|---|---|
| `--e-global-color-primary` | `#EA5347` | "Reserva una jornada" buttons; the brand's warm red |
| `--e-global-color-accent` | `#EFB666` | "Hazte socio" buttons + the big amber section band |
| `--e-global-color-secondary` | `#FFB3B9` | hero heading, soft-pink section backgrounds |
| `--e-global-color-text` | `#98D2CD` | the mint-teal header nav bar + accent headings |
| `--border-color` | `#E23125` | a punchier red used for rules/borders |
| body text | `#333` / `#303030` | paragraph copy, near-black |
| "DONA" button | `#000000` | the donate CTA + the wordmark |

Fonts actually loaded and in use:

| Role | Family | Notes |
|---|---|---|
| Display / wordmark / buttons | **Staatliches** | condensed all-caps; this **is** the "PATAS ARRIBA" logotype face |
| Body / subheads | **Instrument Serif** | a display serif |
| Accent | **Roboto** 500 | |

## Curation decisions (these reverse two brief assumptions — confirmed with the user)

1. **Primary = coral `#EA5347`, secondary = amber `#EFB666`.** The brief's "known
   anchor" guessed amber as primary, but the site's own `--e-global-color-primary`
   is the coral red, with amber as the *accent*. We follow the site's token names.
   (The approved v5 mockup used amber-primary; v6 supersedes it on this point.)
2. **Navy `#173A5E` is deleted.** It appears **nowhere** on the site — it was an
   incidental value invented by earlier mockups (the brief flagged exactly this).
   Text is now a warm near-black; there is no navy secondary.
3. **Type: Staatliches for display headings + the wordmark; Roboto for body/UI.**
   Full brand fidelity would put Instrument Serif in the body, but a display serif
   at 14–16px in dense forms/lists hurts legibility on a phone. Brand identity
   lives in the headings; the body stays a clean sans.

## Color tokens

### Brand core (MUI semantic slots)

| Token | Hex | contrastText | Contrast of text on fill |
|---|---|---|---|
| `primary.main` | `#EA5347` | `#FFFFFF` | **3.6:1** — see note below |
| `primary.light` | `#F4837A` | — | |
| `primary.dark` | `#C13A2E` | `#FFFFFF` | ~5.1:1 (accessible fallback for body-size labels) |
| `secondary.main` | `#EFB666` | `#212121` | **9.4:1** (AAA) |
| `secondary.light` | `#F4CC95` | `#212121` | |
| `secondary.dark` | `#D99946` | `#212121` | |

**contrastText note (the documented WCAG check the brief asked for).** White on the
brand coral `#EA5347` is **3.6:1** — it meets WCAG AA for *large* text and the SC
1.4.11 non-text/UI-component threshold (3:1), and it mirrors the foundation's own
site (which uses white on this exact red). It does **not** reach 4.5:1 for
body-size text. Where a contained primary button must carry body-size (16px) label
text to strict AA, use `primary.dark` (`#C13A2E`, ~5.1:1 with white) as the fill.
This is an explicit, accepted brand-fidelity tradeoff — not an oversight.

### Semantic (functional; kept distinct from the brand reds/ambers)

| Token | Hex | contrastText | Why this value |
|---|---|---|---|
| `error.main` | `#C62828` | `#FFFFFF` (~5.7:1) | a **deep** crimson so destructive actions never read as the coral *primary* |
| `warning.main` | `#E8850C` | `#212121` (~6.6:1) | a clearly **orange** tone, separated from the yellow-amber *secondary* |
| `success.main` | `#2E7D46` | `#FFFFFF` (~5.0:1) | deep green (the mockup's `#2ECC71` failed white-text contrast) |
| `info.main` | `#147A70` | `#FFFFFF` (~4.6:1) | a deep teal — brand-adjacent nod to the site's mint, still functional |

### Surfaces (every previously-inline near-white now has a name)

| Token | Hex | Replaces inline |
|---|---|---|
| `background.default` | `#FAFAF8` | warm off-white app canvas |
| `background.paper` | `#FFFFFF` | cards, sheets, nav |
| `surface.subtle` | `#F5F5F2` | the `#F5F5F2` panels scattered through v4/v5 |
| `surface.muted` | `#F0F0EC` | the `#F0F0EC` chat/secondary-button fills |
| `surface.line` | `#E8E8E4` | hairline fills |
| `divider` | `#E8E8E4` | |
| `text.primary` | `#2E2E2E` | was navy `#173A5E`; now the site's near-black |
| `text.secondary` | `#6B7078` | 4.8:1 on default — accessible muted text |

### Brand accent tokens (`palette.brand.*`) — the full playful palette, named

| Token | Hex | Source |
|---|---|---|
| `brand.coral` / `brand.coralDeep` | `#EA5347` / `#E23125` | primary + border red |
| `brand.amber` / `brand.amberDeep` | `#EFB666` / `#D99946` | accent + its shade |
| `brand.teal` / `brand.tealDeep` | `#98D2CD` / `#3E9B95` | mint nav bar + a usable darker teal |
| `brand.pink` / `brand.pinkDeep` | `#FFB3B9` / `#E06B8D` | soft pink + a deeper rose |
| `brand.black` | `#1A1A1A` | the wordmark / DONA button |

### Category taxonomy — the two systems unified (`palette.category.*`)

The old `CAT_COLORS` (events) and `GLOSSARY_CAT_COLORS` (info glossary) are merged
into **one** slug-keyed map; the glossary's Spanish labels normalise to these slugs.
Every swatch is drawn from one harmonised vocabulary and carries its own
`contrastText`.

| Slug | Fill | contrastText | Used by |
|---|---|---|---|
| `protectora` | `#3E9B95` | `#FFFFFF` | events + glossary "Refugio/Protectora" shares the rose below |
| `mercadillo` | `#E8850C` | `#212121` | events |
| `recogida` | `#8E7CC3` | `#FFFFFF` | events |
| `otro` | `#7A8691` | `#FFFFFF` | events |
| `plataforma` | `#5B8DEF` | `#FFFFFF` | glossary |
| `rol` | `#95A5A6` | `#212121` | glossary |
| `evento` | `#EA5347` | `#FFFFFF` | glossary (brand coral) |
| `refugio` | `#E06B8D` | `#FFFFFF` | glossary "Refugio/Protectora" |

### Avatar colors (`palette.avatar[]`) — derived, not hand-assigned

Per-user hardcoded `USERS[].color` is gone. Avatars pick deterministically from an
8-swatch brand-harmonised ring via `avatarColorFor(seed)` (a stable hash of the
username → index), so a user's color is reproducible without being stored:

`['#EA5347','#D99946','#3E9B95','#E06B8D','#8E7CC3','#E8850C','#5B8DEF','#98D2CD']`

## Non-color tokens

- **Typography.** `fontFamily` (body/UI) = Roboto; `display` = `'Staatliches'`.
  `h1`/`h2` use Staatliches (display); `h3`–`h6` stay Roboto (they are mixed-case UI
  section labels, not display). Body/subtitle/caption/input sizes inherit MUI
  defaults on purpose (16 / 14 / 12px; 16px inputs avoid iOS focus zoom).
- **Shape / radii.** `shape.borderRadius: 12`; scale `radii = { sm:8, md:12, lg:16, pill:999 }`;
  component radii button 10 · card 16 · chip 20 (kept from v5 — the site's sharp 3–5px
  radii are desktop-marketing; soft radii suit touch UI).
- **Spacing.** MUI 8px rhythm, unchanged.
- **Elevation.** Restrained, **warm** shadows retinted off near-black (the v5 card
  shadow was tinted with the now-deleted navy): card
  `0 1px 3px rgba(26,26,26,.06), 0 1px 2px rgba(26,26,26,.04)`; the events FAB glow
  is coral-tinted `0 8px 24px rgba(234,83,71,.28)`.

## No-reference mistakes fixed (brief §"Known mistakes")

1. **Hardcoded hex in `sx`** → replaced by `surface.*` / `brand.*` / `category.*` tokens.
2. **Two category systems** → one `palette.category` map (above).
3. **Undocumented `contrastText`** → coral contrastText documented with its 3.6:1 check + the `primary.dark` escape hatch.
4. **Unnamed surfaces + two blues** → surfaces named; the navy is deleted and the info blue is a single documented functional teal.
5. **Per-user avatar colors** → derived from `palette.avatar` via `avatarColorFor()`.
6. **`App.css !important` overrides** → superseded by `theme.components` (Button 48px, IconButton 44px, Card, Chip, TextField, BottomNavigationAction); to be deleted when the theme lands in `main.jsx`.
