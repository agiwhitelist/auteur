# direct.md — the cinematic register

In this register the page is a film: the viewport is the frame, scroll is the timeline, sections are scenes. You are the director, and directors do not start by shooting — they start with a script. Every phase below ends with a gate; do not cross a gate that fails.

## Phase 0a — Intake (one message)

Ask once, compactly: product & what it does · audience · the ONE feeling a visitor should leave with (awe / calm / hunger / trust / momentum...) · brand constraints (colors, fonts, logo — if any) · assets that already exist (photos, video, 3D, none) · where it will be hosted (static vs framework). If working autonomously, derive answers from available materials and write them down as assumptions.

## Phase 0a.5 — Recon (steal like a director)

Before writing the screenplay, spend a short, bounded pass gathering live reference — the reflex table in taste.md tells you what to avoid; recon tells you what's currently *alive*:

- If web tools are available (WebSearch / tavily / crwl): look up 3–5 recent award-level references for this category and mood — awwwards.com, godly.website, curated.design, minimal.gallery, plus "site of the day" write-ups. You are hunting for *mechanics*, not skins: a transition idea, a scene structure, a typographic move.
- Note in the storyboard header: 2–3 named references and the ONE idea taken from each ("k72.ca — section titles pinned while content scrolls through"). Stolen ideas get adapted to this brand, never copied wholesale — a reference is a starting camera position, not a set.
- No web tools → skip without guilt; the reflex table + transition library carry you. Never fake references you didn't actually see.

## Phase 0b — Screenplay

Copy `templates/STORYBOARD.md` into the project (`design/STORYBOARD.md`) and write the film:

**Structure: 5–7 scenes, classic arc.**

| Beat | Role | Typical scenes |
|---|---|---|
| Hook | stop the scroll, set the world | 1 (the hero) |
| Rising | develop the promise | 1–2 |
| **Peak** | the ONE wow moment | exactly 1 |
| Proof | make it credible | 1–2 |
| Door | the CTA, land the feeling | 1 |

**Dramaturgy rules:**
- Score each scene's intensity 1–10. Exactly one scene ≥8 (the peak). The hero hooks at 6–7 — if the hero *is* the peak, the rest of the page must consciously de-escalate (harder to pull off; prefer the peak at 40–70% depth).
- Two adjacent scenes must not share the same layout family or the same motion family. The cut between scenes is part of the film — pick every transition deliberately (library in scroll-cinema.md).
- The feeling from intake is the film's key. Every scene either builds it or contrasts it deliberately; a scene that does neither gets cut. Fewer, better scenes beat more scenes.

**Scene-sheet — fill every field for every scene:**

```
### Scene N — <name>            | beat: hook|rising|peak|proof|door | intensity: 1-10
purpose:      what the viewer must FEEL and LEARN here (one line each)
subject:      the single visual subject (product | image | typography | data | scene)
camera:       POV & framing — eye-level / low-angle (heroic) / high-angle (overview) /
              macro (detail) / orbital (show all sides) / static
lighting:     mood of the frame — hard contrast / golden / dusk / studio / neon / paper-flat
motion:       what moves, in one sentence, incl. what drives it (scroll-scrub | entrance | loop | hover)
transition_in / transition_out:  from the library (cut / wipe-mask / curtain / letterbox /
              shutter / depth-parallax / displacement / view-transition)
scroll_len:   how much scroll this scene owns (100vh–400vh; peak usually 300–400vh pinned)
copy:         the headline + subline that live in this scene (write the actual words)
media:        the director's shot spec for this scene's generated asset (→ the asset plan; route via assets.md §0):
              · type:  still | A→B morph | video | sequence | element/texture | none (type-led)
              · tool:  codex (peak photoreal) | grok-4.5 (color hero + ANYTHING that becomes video) | agy (volume/elements)
              · frame prompt: the literal keyframe prompt = subject + camera + lighting + palette anchor (write it now)
              · motion prompt: (video/morph only) what moves — e.g. "grok image_to_video on frame A: slow push-in + steam, 6s". Controlled A→B state change = WebGL displacement morph (two frames), NOT a video model
              · score:  (peak/ambient scenes only) mood/tempo for MiniMax music, or "none"
fallback:     what this scene is when WebGL/video/motion is unavailable (static frame + one line)
```

`camera` and `lighting` matter even for pure-CSS scenes: they discipline composition (low-angle → oversized subject, viewer looks up; macro → crop tighter than comfortable) and they become literal prompt parameters when the asset is AI-generated.

**GATE 0:** storyboard complete; exactly one peak; adjacent scenes differ in layout & motion family; every scene has a fallback and real copy (not lorem). If the user is present, get the storyboard approved — cheapest possible moment to change the film. Then fill the commit-sheet (SKILL.md) — the storyboard feeds it.

## Phase 0c — Style gate (mockup before the shoot)

Changing the art direction after six scenes are built costs a rebuild; changing it on one static screen costs minutes. Before asset production:

1. Build ONE static hero screen as a throwaway HTML file (`design/mockup-hero.html`): real headline copy, the commit-sheet palette and type, the grid break — **no animations, no assets** (a solid-color placeholder block where the generated keyframe will live). 15–30 minutes of work, not more.
2. Screenshot it at 1440 and 390 (shoot.mjs on the file), look at it, and run the taste.md §8 self-check on the *image*.
3. User present → show the screenshots and get a yes/no on the art direction (offer 2 variants only if genuinely torn — a director proposes, not a menu). Autonomous → self-check against the commit-sheet and record the verdict in the storyboard header.
4. Approved → the mockup's CSS custom properties become the project tokens verbatim. Rejected → cheap redo of phase 0c, not of the film.

## Phase 1 — Asset production

Load `reference/assets.md` and derive the asset plan from the storyboard's `asset:` lines.

Order of operations (cost discipline):
1. List every needed asset with its scene, target resolution, and technique (from the selection table in scroll-cinema.md).
2. Generate ONE keyframe first (the peak scene's frame A). Check it against `lighting`/`camera` of the scene-sheet. Only after it's right, produce its frame B via *edit* and the remaining scenes' assets — this catches a wrong art direction at 1 image of cost, not 12.
3. Optimize everything (recipes in assets.md), verify weights against budget (hero ≤2MB video / ≤300KB poster / ≤150KB per sequence frame at 1440w).

**GATE 1:** every scene's asset exists on disk at final path, weights within budget, frame A/B pairs verified same-scene-same-camera (open both, compare eyes-on), poster/fallback image exists for every heavy asset.

## Phase 2 — Assembly

Load `reference/scroll-cinema.md`. Build order is not negotiable (it prevents the classic "everything jitters" rebuild):

1. **Foundation first:** Lenis + GSAP ScrollTrigger integration skeleton (or CSS `animation-timeline` for simple scenes with the `@supports` fallback). No scene work until smooth scroll runs clean.
2. **Hero scene** — sets the technical pattern for everything after it.
3. **Scenes top-to-bottom**, one at a time; `ScrollTrigger.refresh()` after each. Wire each scene's `transition_in/out` from the library as you go — transitions are scene work, not polish.
4. **Text reveals** on headings/paragraphs per motion.md numbers — this stitches the film together.
5. **Reduced-motion cut**: implement the alternative art direction now (static posters, soft opacity rhythm, no pinning, no scrub), not as an afterthought. It's a *cut of the same film*, and it's also your no-JS/weak-device story.
6. **Mobile pass**: pinned scenes shorten or unpin (`scroll_len` × 0.6), assets swap to 720p/cropped variants, hover-driven moments get touch equivalents or graceful absence.

Performance discipline while assembling: only `transform`/`opacity`; `will-change` only on actively animated layers (and removed after); heavy scenes lazy-init via IntersectionObserver; one `requestAnimationFrame` loop owner (GSAP's ticker) — never parallel rAF loops.

**GATE 2:** every scene works at 390/768/1440; scrolling up replays cleanly (scrub is bidirectional — test it); no console errors; reduced-motion cut watchable end-to-end.

## Phase 3 — Verification

Load `reference/verify.md`, run the full pipeline (slopscan → shoot → rubric), and fill `templates/CINEMA-QA.md`. The film ships when QA is all PASS — and after you have *watched your own film*: one uninterrupted slow scroll top to bottom, then one fast. Jank you can feel beats any metric.

## Phase 4 — Lock the style (DESIGN.md)

A shipped film gets sequels: "add a testimonials scene", "swap the pricing". Without a locked style contract, every later edit — by you, another model, or another session — drifts back toward the mode. After QA passes, fill `templates/DESIGN.md` into `design/DESIGN.md`: the actual tokens, type system, motion vocabulary, section-opening patterns, and this project's own ban additions. Every future edit starts by reading it (the `edit` route in SKILL.md enforces this). This is what makes the style *survive you*.

## Sound (optional scene layer)

Only if the brief asks for atmosphere: one ambient loop, off by default, visible mute/unmute toggle, starts only on user gesture (autoplay policies), volume ≤0.3, `prefers-reduced-motion` implies silent default. Policy details in motion.md §Sound. Sound is seasoning — a silent film that wows silently is complete.
