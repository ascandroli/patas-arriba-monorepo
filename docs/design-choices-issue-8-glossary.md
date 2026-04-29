# Design Choices — Issue #8: Glossary Page

## Summary

Replaced the "page under construction" placeholder with a fully functional, internationalized glossary page where volunteers can look up foundation terminology and abbreviations.

## Key Design Decisions

### 1. Static YAML file instead of a database/API

**Choice:** Glossary content lives in `client/src/data/glossary.es.yaml`, imported at build time via a Vite plugin.

**Why:**
- Contributors (including non-developers) can edit glossary entries directly on GitHub without touching code
- No server endpoint needed — zero maintenance overhead
- AI tools can easily propose changes via pull requests
- Content is versioned alongside the code in git

**Trade-off:** Adding or editing entries requires a redeploy. This is acceptable given the glossary changes infrequently.

**Alternative considered:** Server-side admin-editable glossary (mentioned in issue #8). Deferred — the YAML approach covers the immediate need and can be migrated later if dynamic editing becomes a requirement.

### 2. Spanish-only (no internationalization)

**Choice:** The glossary is published only in Spanish. No language toggle, no i18n framework.

**Why:** Volunteers and the platform UI all operate in Spanish. An earlier draft included an English version with a flag toggle, but stakeholders confirmed there was no real demand for it — non-Spanish-speaking volunteers are not part of the target audience today. Removing the English variant simplifies maintenance and avoids translation drift.

**Trade-off:** If a second language is needed in the future (Catalan was mentioned), the YAML structure can support it by adding a sibling file and a language switcher. Until then, single-file is the simplest thing that works.

### 3. Accordion + search + category filters

**Choice:** MUI Accordion components with a search bar and clickable category chips (Refugio/Protectora, Plataforma, Rol, Evento).

**Why:**
- Expandable format was specifically requested in issue #8
- Search helps as the glossary grows
- Category chips provide quick visual filtering and help users discover related terms
- All built with existing MUI components — no new dependencies beyond the YAML plugin

**Note on categories:** Earlier drafts included `Programa`, `Organización`, and `Lugar`. `Programa` was unused, and `Organización` and `Lugar` were merged into a single `Refugio/Protectora` category — every entry that previously fit either of those is a shelter or rescue organization, so the split was creating inconsistency rather than clarity (e.g. SO was filed under Lugar, ASS under Organización, despite being the same kind of thing).

### 4. Navbar icon update

**Choice:** Changed the glossary menu icon from `CalendarMonthIcon` to `MenuBookIcon`.

**Why:** The calendar icon was a placeholder copy from the Events menu item. A book icon correctly signals "glossary/reference" to users.

## Files Changed

| File | Change |
|------|--------|
| `client/src/data/glossary.es.yaml` | New — Spanish glossary content (UI labels + entries) |
| `client/src/pages/Glossary.jsx` | Rewritten — YAML-driven, search, categories, accordions |
| `client/src/components/navigation/Navbar.jsx` | Icon change + MenuBookIcon import |
| `client/vite.config.js` | Added `@modyfi/vite-plugin-yaml` plugin |
| `client/package.json` | New dev dependency: `@modyfi/vite-plugin-yaml` |

## Glossary Entry Format

Each glossary entry is defined in `client/src/data/glossary.es.yaml`. Here is a snippet to illustrate the format:

```yaml
entries:
  - term: SO
    fullName: Segundas Oportunidades
    category: Refugio/Protectora
    definition: >
      Refugio de animales ubicado cerca de l'Arboç, Tarragona, que acoge
      tanto perros como animales de granja. Es uno de los refugios donde los
      voluntarios de Fundación Patas Arriba acuden regularmente a ayudar.
      Responsable de las salidas Silvia Speroni

  - term: Jornada de Adopción
    fullName:
    category: Evento
    definition: >
      Evento especial donde se presentan animales disponibles para adopción
      al público. Los voluntarios ayudan con la logística, atención al
      público y cuidado de los animales durante la jornada.
```

Each entry has four fields:

| Field | Required | Description |
|-------|----------|-------------|
| `term` | Yes | The abbreviation or term as used in the foundation |
| `fullName` | No | The expanded name (typically used to spell out an abbreviation) |
| `category` | Yes | Groups the entry under a filter chip on the page (Refugio/Protectora, Plataforma, Rol, Evento) |
| `definition` | Yes | A short paragraph explaining the term in context |

On the page, each entry appears as a collapsible accordion — the term and category are always visible, and clicking expands it to show the full definition. Users can search across all fields and filter by category.

## Open Questions for Stakeholders

- **What terms and abbreviations should be in the glossary?** The list grows as stakeholders surface terms volunteers actually ask about.
- **Are the current categories the right groupings?** Refugio/Protectora, Plataforma, Rol, and Evento cover everything submitted so far, but new entry types may justify adding categories.
