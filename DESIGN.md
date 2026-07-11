# DESIGN — the auteur brand & landing

The landing page is the skill's own dog-food: if a skill that promises
award-tier interactive sites ships a bland landing, it refutes itself. So the
landing is built by the same discipline it sells — a commit-sheet, one
committed direction, and the linter as the gate.

## The idea

auteur = a **director**. The medium a director works in is **light**. So the
brand has no fixed brand-color of its own — it is black, and light. Each of
the four showcase sites carries its own loud palette; the landing stays
monochrome so it can hold all of them without competing. The one accent is a
**record-red dot** — the cinema "REC" signifier.

## Color seed

| Token | Value | Use |
|---|---|---|
| `--ink` | `#08080a` | the void; every section sits on it |
| `--ink2` | `#101014` | raised cards (showcase doors, terminal) |
| `--bone` | `#f4efe6` | primary type — warm white, never pure #fff |
| `--gold` | `#ffcf8a` | italic emphasis, the warm core of the light |
| `--rec` | `#ff3b30` | the single accent — section numbers, the REC dot, CTAs |
| `--dim` / `--faint` | `#9a978f` / `#5c5a55` | body copy, mono metadata |

The hero particle field ramps **ember-red → gold → white-hot** by depth — a
tungsten/projector light, deliberately distinct from SWARM's flat amber. The
showcase doors are the *only* place saturated hue appears, and only as a hint
of each destination (magenta/cyan, chartreuse, amber, cyan-fog).

**Banned:** the 250–290° purple→blue AI gradient, SaaS-cream, pure `#ffffff`
type on pure `#000000`.

## Typography

- **Display:** Fraunces — an optical, slightly wonky editorial serif. Reads
  "film title / masthead," and is emphatically **not** the reflexive
  Inter / Space Grotesk. Weights 600 & 900, roman and italic.
- **Body:** `system-ui` stack — invisible, fast, no webfont tax on reading.
- **Mono:** `ui-monospace` stack — film-slate metadata, section numbers, the
  install terminal.

## Motion budget

- **One** WebGL context (the hero). Everything else is DOM.
- DOM motion on `transform` / `opacity` only. No `transition: all`.
- Scroll reveals via `IntersectionObserver`, never a scroll listener.
- `prefers-reduced-motion` → the canvas is removed and a rich still poster of
  the wordmark remains. Never a blank hero.

## Component vocabulary

- **Section band** — hairline top border, a mono section number in red, a
  Fraunces H2. Film-slate rhythm: `01 / 02 / 03 / 04`.
- **Showcase door** — a raised card with a left color-swatch, a mono label, a
  big Fraunces name, one line of technique, a corner arrow. Hover lifts it and
  blooms its destination's color. It should read as a *doorway*, not a button.
- **Terminal** — a mac-style window showing the two real install commands, the
  prompt string highlighted in gold.

## Anti-references (what the landing refuses to be)

- A centered logo + paragraph.
- A README rendered as a webpage.
- A hero that is "a nice gradient with text."
- A metrics band with invented numbers. The footer says it out loud:
  **"no invented numbers on this page."**
