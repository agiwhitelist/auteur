---
name: auteur
description: Design and build complete, distinctive web experiences from scratch — both standard product/marketing pages with award-level craft and cinematic scroll-directed "wow" sites where the page is directed like a film, with AI-generated visual assets (consistent keyframe images, scroll-scrubbed sequences, WebGL displacement transitions between two generated frames, locally generated video via first→last-frame chains, and an optional ambient score). Use whenever the user wants to create or redesign a landing page, website, hero section, portfolio, promo or product page; asks for scroll animations, storytelling pages, or a site that feels like a movie; or says "make it beautiful", "make it wow", "cinematic", "сделай красиво", "вау-сайт", "кинематографичный сайт", "сделай лендинг" — even if they don't name a technique. Includes asset generation via local CLIs, an executable anti-slop linter, and a screenshot verification loop. Not for polishing an existing UI built by someone else (use impeccable for that) and not for backend-only tasks.
version: 1.0.0
user-invocable: true
argument-hint: "[build|direct|edit|audit] <brief or target>"
allowed-tools:
  - Bash(node *)
  - Bash(agy *)
  - Bash(codex *)
  - Bash(grok *)
  - Bash(ffmpeg *)
  - Bash(npx *)
---

Auteur designs and builds web experiences the way a film director makes a film: script first, then assets, then the shoot, then the cut. It has two registers — **build** (an excellent conventional site) and **direct** (a cinematic scroll-directed site) — on one shared core of taste. Nothing ships until the page passes an executable anti-slop gate and the skill has looked at its own output.

## Non-negotiables

These apply to every register, every phase, always — even if no reference file has been loaded. Match-and-refuse: if you are about to produce one of these, stop and restructure the element.

### Banned (rewrite, don't tweak)

| # | Ban | Instead |
|---|-----|---------|
| 1 | `border-left`/`border-right` >1px as a colored accent on cards, callouts, alerts | full border, background tint, leading icon, or nothing |
| 2 | Gradient text (`background-clip: text` + gradient) | one solid color; emphasis via weight or size |
| 3 | Glassmorphism as default (decorative `backdrop-filter` cards) | rare and purposeful, or solid surfaces |
| 4 | The hero-metric template (big number, small label, stat row, gradient accent) | evidence in prose, one committed visual |
| 5 | Identical card grids (same-size icon+heading+text, repeated) | vary size, structure, or drop the cards entirely |
| 6 | Eyebrow kickers (tiny uppercase tracked label) above every section | one deliberate kicker max as a brand system; vary section openings |
| 7 | Numbered section scaffolding (01 / 02 / 03) when order carries no meaning | numbers only for a real sequence |
| 8 | `Inter` or `Space Grotesk` as the *first* font choice | pick from a contrast-axis pair (see taste.md); these two are the AI default of 2024–2026 |
| 9 | Purple→blue gradients (both stops hue 250–290) | committed brand hue, or no gradient |
| 10 | Cream/warm-beige body background as a "warmth" reflex (OKLCH L 0.84–0.97, C <0.06, hue 40–100) | saturated brand surface, true off-white at chroma ~0, or a darker tinted mid-tone; warmth lives in accent + type + imagery |
| 11 | The same fade-in/slide-up entrance on every section | each reveal fits what it reveals; vary easing, distance, direction |
| 12 | `transition: all` | list the animated properties |
| 13 | `window.addEventListener('scroll', ...)` | IntersectionObserver, GSAP ScrollTrigger, or CSS `animation-timeline` |
| 14 | `scale(0)` entrances | start at `scale(0.95)` + opacity |
| 15 | Bento grids of near-identical or empty cells; white-card-on-white bento | bento only with real visual variation per cell, else a different layout |
| 16 | Copy tells: "Revolutionize", "Seamless", "Effortless", "Unleash", "Elevate", em-dash–heavy sentences, decoration strips like "BRAND. MOTION. SPATIAL." | concrete claims in plain words |
| 17 | More than one marquee per page | one, or none |
| 18 | Instrument Serif / Playfair Display as the reflex "elegant serif" | serifs chosen for the brand, not from the AI shortlist |

A ban may be overridden only through a written `auteur-allow` (see Verification) with a real reason — a deliberate, argued choice is voice; a default is slop.

### Critical numbers (memorize; full context in reference files)

- Body text contrast ≥ 4.5:1 (large text ≥ 3:1). Placeholders too. Muted-gray-on-tinted-white is the #1 AI readability failure.
- Body line length 65–75ch. Display heading ceiling: clamp max ≤ 6rem. Display letter-spacing ≥ −0.04em.
- Durations: button 100–160ms · tooltip 125–200ms · dropdown 150–250ms · modal/drawer 200–500ms · any UI >300ms needs a written reason.
- Enter/exit easing = ease-out. `ease-in` is banned on UI.
- Animate only `transform` and `opacity`. Stagger 30–80ms.
- Motion budget: ≤ 3 scroll-triggered pattern families per page; **one** primary wow peak, supporting scenes at lower intensity.
- Scrub smoothing 0.3–0.8. Hero video ≤ 2MB. LCP < 2.5s. CLS < 0.1.
- `prefers-reduced-motion` = an alternative art direction (gentler, not zero), never an afterthought.
- Content must be readable with JS disabled: reveals enhance an already-visible default, never gate visibility.

## Routing

Read the argument / brief and route:

1. **`direct`** or the brief smells cinematic — "wow", "cinematic", "immersive", "storytelling", "launch page", "premium brand", "make people stop scrolling" → load `reference/direct.md` and follow its phases. This is the flagship register.
2. **`build`** or the brief is a conventional surface — product UI, dashboard-adjacent marketing, docs, blog, straightforward landing → load `reference/build.md`.
3. **`edit`** or the request modifies a page this skill built (the project contains `design/DESIGN.md`) — "add a section", "change the pricing", "swap the hero copy" → read `design/DESIGN.md` FIRST and follow its Editing protocol: reuse its tokens, section-opening patterns, and motion families; after the change run slopscan and re-shoot the affected viewports. An edit that ignores DESIGN.md is a regression even if it looks good in isolation.
4. **`audit <path-or-url>`** → load `reference/verify.md` and run the verification pipeline on an auteur-built page. If the target is an existing UI auteur didn't build and the user wants it *polished* rather than *rebuilt*, say that `/impeccable` is the right tool and offer to continue only if they want a rebuild.
5. **Ambiguous** (e.g. plain "сделай лендинг") → ask exactly one question: "Обычный отличный лендинг или кино-режим со scroll-режиссурой и генерацией ассетов?" Then route. Don't ask anything else yet — each register runs its own intake.

Both registers share phase zero: the commit-sheet.

## The commit-sheet (before any code, both registers)

Slop is what happens when defaults make the decisions. The commit-sheet forces six real decisions onto paper before the first line of code. Copy `templates/COMMIT-SHEET.md` into the project (e.g. `design/COMMIT-SHEET.md`) and fill all six fields with non-defaults:

1. **Peak** — the ONE primary wow moment (direct) or signature element (build). One sentence. If you can't name it, you're not ready to build.
2. **Color** — primary as OKLCH + commitment tier (restrained / committed / full-palette / drenched) + one line: *why this is not lavender, not cream, and not the category reflex*.
3. **Type** — display + text pairing on a contrast axis (serif+sans, geometric+humanist, mono+serif...) + one line: *why not Inter*.
4. **Grid break** — the one concrete thing that breaks the symmetric-grid default: an overlap, an asymmetric split, a diagonal flow, a full-bleed interruption. Name it specifically.
5. **Motion budget** — how many scroll-pattern families (≤3) and what they are.
6. **Reflex check** — write down: (a) what a generic AI would do for this category (first-order reflex), (b) what a generic AI avoiding (a) would do (second-order reflex — e.g. fintech → "terminal dark mode" is *also* saturated now), (c) your chosen deviation from both.

Gate: every field filled with a specific, non-default answer. An empty or generic field ("modern, clean look") means stop and decide. This artifact is checked again at verification.

## Phases at a glance

| Phase | build register | direct register | Reference to load |
|---|---|---|---|
| 0 | recon (optional) → commit-sheet → hero mockup gate | recon → screenplay (STORYBOARD.md) → commit-sheet → hero mockup gate | `direct.md` / `build.md` |
| 1 | — | asset production (generate → edit → optimize) | `assets.md` |
| 2 | build the page | assemble the film (smooth scroll first, hero, scenes top-down) | `build.md` + `taste.md` + `motion.md` / `scroll-cinema.md` |
| 3 | verify | verify + CINEMA-QA.md | `verify.md` |
| 4 | lock the style: fill `design/DESIGN.md` | same | `templates/DESIGN.md` |

The hero mockup gate (one static throwaway screen, screenshotted and approved before anything else is built) is the cheapest moment to change art direction — details in each register's reference. `design/DESIGN.md` is the style contract that makes every later edit stay in style (the `edit` route reads it first).

Never skip a gate because the intermediate result "looks done". The gates exist because a page that merely looks done is exactly what every other AI ships.

## Reference files

- `reference/taste.md` — the full anti-slop system: extended bans with replacements, second-order category reflex table, color strategy tiers, typography pairing, copy rules. Load for any visual decision-making.
- `reference/motion.md` — the motion school: when to animate, easing/duration/spring numbers, performance rules, motion budget, sound policy. Load before writing any animation.
- `reference/build.md` — the standard register process. Load when routed to build.
- `reference/direct.md` — the cinematic register: screenplay contract, scene-sheets, dramaturgy, assembly order. Load when routed to direct.
- `reference/assets.md` — the media crew and routing (agy / codex / grok-4.5 for images, grok for video, MiniMax for score, ffmpeg), the consistency trick (edit frame A into frame B), local video via the first→last-frame chain, generated elements/mockups, the ambient score, the degradation ladder, and asset caching. Load during direct phase 1.
- `reference/scroll-cinema.md` — working code recipes: scroll-scrubbed video, canvas sequences, GSAP+Lenis foundation, CSS scroll-driven animations, text reveals, the two-keyframe WebGL displacement transition, view transitions, ambient audio, and the cinematic transition library (wipe, curtain, letterbox, shutter, depth parallax). Load during assembly.
- `reference/scroll-flight.md` — the **video-scrub tier**: a photoreal "fly through the world" hero driven by scroll, using the drop-in `templates/scroll-flight-engine.js`. The canonical recipe for scroll-scrubbed *video* (encode-for-scrubbing `-g 8`, encoded-frame posters, SSIM seam gate, chain architecture A/B, iOS/mobile decode hardening, crossfade-vs-seamless seams). Load when the hero should be photoreal footage/AI-video rather than real-time WebGL.
- `reference/verify.md` — the acceptance pipeline: slopscan → screenshot journey → motion/perf/audio QA (FPS, long-tasks, audio-gate, reduced-motion, for Tier-1 scenes) → numeric rubric → QA sign-off. Load at phase 3.

## Verification is part of the build

The page is not done when the code compiles. It is done when:

1. `node scripts/slopscan.mjs <src-dir>` exits 0 (fails are fixed, not suppressed — `/* auteur-allow: RULE_ID -- reason */` exists for deliberate choices and demands a real reason);
2. `node scripts/shoot.mjs <url>` has produced screenshot journeys at 390 / 768 / 1440 and you have **looked at every frame** — text overflow, blank scenes, broken reveals, layout collapse are found by eyes, not by grep;
3. the numeric rubric in `reference/verify.md` passes (contrast, LCP, CLS, reduced-motion journey, scene variety);
4. for direct register: `CINEMA-QA.md` (from templates) is filled with PASS on every row.

If any gate fails — fix and re-run. Report results honestly: "slopscan clean, 21 screenshots reviewed, LCP 1.9s" beats "looks great".

## Working relationship with other skills

Auteur *builds*; it does not re-polish foreign UI. If the user has an existing interface that needs refinement, recommend `/impeccable`. If auteur's own output needs an outside critique, `/impeccable critique` on the built page is a compatible second opinion — auteur's verify gate and impeccable's critique measure different things and coexist happily.

## Weak-model note

If you are a smaller model executing this skill: follow the tables and numbers literally, fill every template field, run every gate command, and do not improvise beyond the reference recipes — the recipes are verified, your improvisation is not. When a reference file conflicts with your instinct, the reference file wins. Write files using paths relative to the project root; never retype an absolute path from memory (the skill's name "auteur" is one typo away from "author", and misspelled absolute paths scatter your output across the filesystem).
