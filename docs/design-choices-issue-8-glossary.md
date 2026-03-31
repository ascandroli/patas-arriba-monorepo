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

## Glossary Entry Format

Each glossary entry is defined in a YAML file — one file per language. Here is a snippet from the English version to illustrate the format:

```yaml
entries:
  - term: SO
    fullName: Segundas Oportunidades (Second Chances)
    category: Programa
    definition: >
      Program dedicated to giving a second chance to animals that have been
      abandoned or mistreated. Volunteers participate in socialization
      activities, walks, and care for these animals.

  - term: Activación
    fullName: Activation
    category: Plataforma
    definition: >
      The process by which an organizer or admin approves a new volunteer's
      account. Until activated, the user cannot view or join events.

  - term: CES
    fullName: Captura, Esterilización, Suelta (Trap, Neuter, Return / TNR)
    category: Programa
    definition: >
      An ethical method for controlling stray cat populations. The animal is
      captured, neutered at a veterinary clinic, and returned to its original
      colony.
```

Each entry has four fields:

| Field | Required | Description |
|-------|----------|-------------|
| `term` | Yes | The abbreviation or term as used in the foundation (always in Spanish, since that's what volunteers see on the platform) |
| `fullName` | No | The expanded name. In the English file this includes the English translation in parentheses |
| `category` | Yes | Groups the entry under a filter chip on the page (e.g., Programa, Plataforma, Rol) |
| `definition` | Yes | A short paragraph explaining the term in context |

On the page, each entry appears as a collapsible accordion — the term and category are always visible, and clicking expands it to show the full definition. Users can search across all fields and filter by category.

## Open Questions for Stakeholders

- **What terms and abbreviations should be in the glossary?** The current entries are placeholders to demonstrate the format. We need the real list of terms that volunteers ask about.
- **What categories should we use to group the entries?** The current ones (Programa, Organización, Plataforma, Rol, Evento) are suggestions — stakeholders should define the groupings that make sense for the foundation.
- **Are there other languages needed** beyond Spanish and English (e.g., Catalan)?
