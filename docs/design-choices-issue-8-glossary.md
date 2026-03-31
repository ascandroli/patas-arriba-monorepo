# Design Choices — Issue #8: Glossary Page

## Summary

Replaced the "page under construction" placeholder with a fully functional, internationalized glossary page where volunteers can look up foundation terminology and abbreviations.

## Key Design Decisions

### 1. Static YAML files instead of a database/API

**Choice:** Glossary content lives in `client/src/data/glossary.{lang}.yaml` files, imported at build time via a Vite plugin.

**Why:**
- Contributors (including non-developers) can edit glossary entries directly on GitHub without touching code
- No server endpoint needed — zero maintenance overhead
- AI tools can easily propose changes via pull requests
- Content is versioned alongside the code in git

**Trade-off:** Adding or editing entries requires a redeploy. This is acceptable given the glossary changes infrequently.

**Alternative considered:** Server-side admin-editable glossary (mentioned in issue #8). Deferred — the YAML approach covers the immediate need and can be migrated later if dynamic editing becomes a requirement.

### 2. Client-side internationalization (no i18n framework)

**Choice:** A simple language toggle on the glossary page itself, loading from separate YAML files per language. No global i18n library (react-i18next, react-intl, etc.).

**Why:**
- The glossary is the only page that currently needs translation
- Adding a full i18n framework for one page would be over-engineering
- The YAML structure is self-contained — each file has both UI labels and content, making it easy for translators

**Trade-off:** If many more pages need i18n in the future, we'd want to adopt a framework and migrate. The YAML content structure is compatible with that migration.

### 3. Flag icons for language toggle (🇪🇸 / 🇬🇧)

**Choice:** Unicode flag emoji (Spain, UK) instead of text labels (ES/EN) or a dropdown.

**Why:** Stakeholder feedback — flags are more immediately recognizable as a language switcher, especially for users who may not be tech-savvy.

**Note:** Unicode flags render natively on all modern browsers and mobile devices. No image assets needed.

### 4. Original Spanish terms preserved in English translation

**Choice:** The English version keeps the original Spanish terms (SO, ASS, CES, Evento, etc.) and adds English translations in parentheses.

**Why:** These abbreviations are what volunteers encounter in real conversations and on the platform UI (which remains in Spanish). The English glossary helps non-Spanish-speaking volunteers understand the terms they'll actually see and hear.

### 5. Accordion + search + category filters

**Choice:** MUI Accordion components with a search bar and clickable category chips (Programa, Organización, Plataforma, Rol, Evento).

**Why:**
- Expandable format was specifically requested in issue #8
- Search helps as the glossary grows
- Category chips provide quick visual filtering and help users discover related terms
- All built with existing MUI components — no new dependencies beyond the YAML plugin

### 6. Navbar icon update

**Choice:** Changed the glossary menu icon from `CalendarMonthIcon` to `MenuBookIcon`.

**Why:** The calendar icon was a placeholder copy from the Events menu item. A book icon correctly signals "glossary/reference" to users.

## Files Changed

| File | Change |
|------|--------|
| `client/src/data/glossary.es.yaml` | New — Spanish glossary content (12 entries + UI labels) |
| `client/src/data/glossary.en.yaml` | New — English glossary content |
| `client/src/pages/Glossary.jsx` | Rewritten — YAML-driven, i18n, search, categories, accordions |
| `client/src/components/navigation/Navbar.jsx` | Icon change + MenuBookIcon import |
| `client/vite.config.js` | Added `@modyfi/vite-plugin-yaml` plugin |
| `client/package.json` | New dev dependency: `@modyfi/vite-plugin-yaml` |

## Adding a New Language

1. Copy `glossary.es.yaml` to `glossary.{lang}.yaml`
2. Translate the `label`, `categories`, and `entries` sections
3. In `Glossary.jsx`, import the new file and add it to the `glossaries` map
4. Add a new `ToggleButton` with the appropriate flag emoji

## Open Questions for Stakeholders

- **Are the 12 initial entries sufficient?** Or are there other terms volunteers frequently ask about?
- **Are there other languages needed** beyond Spanish and English (e.g., Catalan)?
- **Should the glossary be visible to anonymous users?** Currently it requires login (`OnlyPrivate` route). Making it public could help prospective volunteers.
- **Is the current category scheme useful?** (Programa, Organización, Plataforma, Rol, Evento)
