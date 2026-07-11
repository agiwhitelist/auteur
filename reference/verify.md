# verify.md — the acceptance pipeline

A page that "looks done" in the editor is exactly what every AI ships. Auteur's output is done when it survives three independent checks: a deterministic linter (catches slop defaults in code), a screenshot journey (catches what only eyes catch), and a numeric rubric (catches what eyes forgive). Run them in this order — each is cheaper than the next.

## 1. slopscan (deterministic)

```bash
node <skill-dir>/scripts/slopscan.mjs <src-dir>
```

- Exit 1 → fix every FAIL and re-run. Fix means *redesign the element*, not rename the class.
- **Paste the linter's final `Summary:` line verbatim into your report and QA sheet** — after your LAST edit, not from an earlier run. A remembered result is not a result; re-run the command.
- A FAIL that is a genuinely deliberate, argued choice → suppress in-file with
  `/* auteur-allow: RULE_ID -- <real reason, min 10 chars> */` — the reason must reference the commit-sheet ("committed glass nav over video hero, see COMMIT-SHEET §2"). Suppressions without real reasons are themselves reported.
- WARNs: read each one; fix or consciously accept. >3 accepted warns on one page usually means the design is drifting toward the mode — reread taste.md §8.

## 2. Screenshot journey (eyes-on, mandatory)

```bash
node <skill-dir>/scripts/shoot.mjs <url> --stops 7 --breakpoints 390,768,1440 --reduced-motion
```

Then **open and look at every frame**. You are looking for what linters cannot see:

- text overflowing/wrapping ugly at any breakpoint (the viewport is part of the design)
- blank or half-fired scenes (reveal gated on an animation that never ran)
- scenes where the scroll-stop caught the page mid-jank
- contrast that "passes" numerically but reads muddy on the actual background
- two adjacent frames that look like the same layout family (storyboard said they must differ)
- the reduced-motion journey: is it a *watchable cut*, or a broken silent ruin?

Console errors and "possibly blank" warnings printed by shoot.mjs are FAILs until explained.

**Interaction smoke-test** (when the page has interactive elements — nav, forms, tabs, mute toggle): drive the real page with playwright (`playwright-cli` skill, or a short script on the same playwright install shoot.mjs uses): click every nav link (lands on the right anchor, header doesn't cover the target), open/close the mobile menu, submit the form empty (inline error appears, nothing explodes), toggle sound if present, tab through the page once (focus visible and in order, ESC closes overlays). Any interaction that throws or dead-ends is a FAIL. Static pages skip this.

## 2.5 Motion / perf / audio QA (direct register — screenshots are blind to time)

The screenshot journey (§2) proves the page looks right FROZEN; it says nothing about jank, dropped frames,
audio drift, or a WebGL context leaking on route change. For any Tier-1 scene (scroll state-machine,
audio-reactive, 2.5D composite, scrubbed video) run a MOTION pass with playwright and assert real numbers:

```js
// scripts/motionqa.mjs — record while scrolling the whole page, at a mid-laptop CPU tier
const cdp = await page.context().newCDPSession(page)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })   // jank hides at full speed
await page.evaluate(() => { window.__lt = 0; new PerformanceObserver(l => {
  for (const e of l.getEntries()) window.__lt = Math.max(window.__lt, e.duration)
}).observe({ type:'longtask', buffered:true }) })
const minFps = await page.evaluate(() => new Promise(res => {
  let last = performance.now(), min = 999, end = last + 4000
  ;(function tick(t){ const d = t - last; last = t; if (d>0) min = Math.min(min, 1000/d)
    scrollBy(0, innerHeight/60); t < end ? requestAnimationFrame(tick) : res(min) })(performance.now())
}))
const longTask = await page.evaluate(() => window.__lt)
```

Assert (fail = fix, don't ship):
- **minFps ≥ 50** on the scrub at 4× CPU throttle — below that the scroll reads as a slideshow.
- **No long task > 50ms** during the scroll (one 200ms task IS the jank users feel).
- **WebGL context count flat across route changes** — no `Too many active WebGL contexts` in console (the #1 reported leak); swap textures, never remount.
- **prefers-reduced-motion journey renders a valid static alternative** — the §2 `--reduced-motion` frames must still tell the story (no blank canvas, no missing hero), not just "motion off".
- **Audio (if reactive):** OFF until a user gesture (`audio.paused` true on load), a visible mute control exists, and the visual is complete muted (the scroll pass above already ran silent).
- **Poster / first frame paints within LCP budget** before textures decode — no blank hero.

Console over the whole run: zero errors, zero `THREE.WebGLRenderer: Context Lost`. Report the numbers:
"motionqa: minFps 57 @4× throttle · max long-task 34ms · reduced-motion journey clean · audio gesture-gated".

## 3. Numeric rubric

| Check | Threshold | How |
|---|---|---|
| Body contrast | ≥4.5:1 (large ≥3:1, placeholders ≥4.5:1) | devtools / axe on final colors |
| LCP | <2.5s (throttled Fast 3G / 4× CPU) | Lighthouse |
| CLS | <0.1 | Lighthouse |
| INP | <200ms | Lighthouse / manual scroll+click |
| Hero video | ≤2MB (poster ≤300KB) | file sizes on disk |
| Sequence frames | ≤150KB each @1440w | file sizes |
| Motion budget | ≤3 scroll-pattern families; uniform-reveal check | count them honestly |
| One peak | exactly one scene intensity ≥8 | storyboard vs built page |
| Adjacent-scene variety | no two neighbors share layout family | screenshot journey |
| Reduced-motion | full journey watchable, nothing blank | shoot.mjs --reduced-motion frames |
| Motion (Tier-1 scenes) | minFps ≥50 @4× throttle · long-task ≤50ms · no WebGL leak · audio gesture-gated | scripts/motionqa.mjs (§2.5) |
| Keyboard | tab order sane, focus visible, no traps, ESC closes overlays | manual pass |
| No-JS | content readable, page navigable | disable JS, reload |

## 4. Sign-off

- **direct register:** copy `templates/CINEMA-QA.md` into the project, fill every row with PASS/FAIL + evidence (metric value or screenshot filename). All-PASS ships; any FAIL loops back to its phase.
- **build register:** the rubric table above, inline in your final report.
- Report honestly and concretely: "slopscan 0 fails / 2 accepted warns (reasons logged); 21+6 screenshots reviewed — fixed S4 headline overflow at 390; LCP 1.8s; CLS 0.02; reduced-motion cut verified." If something is unverified (e.g. no local server to measure LCP), say so explicitly rather than implying a pass.
- Optional second opinion: `/impeccable critique <url>` — impeccable measures UX heuristics auteur doesn't; disagreement between the two is signal, not noise.

## When verification keeps failing

Two full loops on the same gate → stop patching symptoms. The failure is upstream: a scene too ambitious for its asset (descend the ladder in assets.md), a palette that never worked (redo commit-sheet §2), a motion budget blown by scope creep (cut a pattern family). Fixing upstream is cheaper than a third loop downstream.
