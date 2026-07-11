#!/usr/bin/env node
/**
 * motionqa.mjs — motion/perf/audio gate for Tier-1 scenes
 * (scroll state-machine, audio-reactive, 2.5D composite, scrubbed video).
 * Screenshots (shoot.mjs) are blind to time; this scrolls the page under CPU throttle and asserts
 * FPS, long-tasks, audio gating, and WebGL console health.
 * Usage: node motionqa.mjs <url> [--throttle 4] [--min-fps 50] [--max-longtask 50] [--json]
 * ponytail: reuses the playwright install shoot.mjs already needs; no new deps.
 */
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const url = argv.find(a => !a.startsWith('-'));
const opt = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 && argv[i + 1] ? +argv[i + 1] : def; };
const jsonMode = argv.includes('--json');
if (!url) {
  process.stderr.write('Usage: node motionqa.mjs <url> [--throttle 4] [--min-fps 50] [--max-longtask 50] [--json]\n');
  process.exit(2);
}
const THROTTLE = opt('throttle', 4), MIN_FPS = opt('min-fps', 50), MAX_LT = opt('max-longtask', 50);
const headed = argv.includes('--headed');   // headless chromium has NO GPU (software swiftshader) — WebGL FPS there is a floor, not the real number

const browser = await chromium.launch({ headless: !headed });
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push(String(e)));

await page.goto(url, { waitUntil: 'load' });

// audio/video must be silent on load — sound starts on a user gesture, never before
const audioAutoplaying = await page.evaluate(() =>
  [...document.querySelectorAll('audio,video')].some(a => !a.paused && !a.muted && a.volume > 0));
const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));

// warm up: let CDN modules load, shaders compile, first textures upload — we measure STEADY STATE,
// not the cold-start frame. (Headless chromium renders WebGL via software swiftshader, so for WebGL
// scenes also prefer a headed/GPU run or a lower --throttle; software raster is not representative.)
await page.evaluate(() => new Promise(r => {
  scrollTo(0, document.body.scrollHeight);
  setTimeout(() => { scrollTo(0, 0); setTimeout(r, 500); }, 900);
}));

const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });

await page.evaluate(() => {
  window.__lt = 0;
  try {
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt = Math.max(window.__lt, e.duration); })
      .observe({ type: 'longtask', buffered: true });
  } catch { /* longtask unsupported */ }
});

// slow full-page scroll over ~4s, sampling rAF deltas for the worst (min) FPS
const minFps = await page.evaluate(() => new Promise(res => {
  let last = performance.now(), min = 999, end = last + 4000, seen = 0;
  (function tick(t) {
    const d = t - last; last = t;
    if (d > 0) { min = Math.min(min, 1000 / d); seen++; }
    scrollBy(0, innerHeight / 60);
    t < end ? requestAnimationFrame(tick) : res(seen > 10 ? min : 60);
  })(performance.now());
}));
const maxLongTask = await page.evaluate(() => window.__lt || 0);
await browser.close();

const fails = [], advisories = [];
// headless chromium has no GPU → software swiftshader inflates WebGL FPS + raster long-tasks.
// Under headless+canvas those two are ADVISORIES (run --headed / on-device for a real number); the
// rest (audio gating, console/WebGL errors) are GPU-independent and stay hard fails.
const softWebgl = hasCanvas && !headed;
const perf = (cond, msg) => { if (cond) (softWebgl ? advisories : fails).push(msg + (softWebgl ? ' [headless software-WebGL — run --headed for a real number]' : '')); };
perf(minFps < MIN_FPS, `minFps ${minFps.toFixed(0)} < ${MIN_FPS} @${THROTTLE}x throttle`);
perf(maxLongTask > MAX_LT, `long task ${maxLongTask.toFixed(0)}ms > ${MAX_LT}ms`);
if (audioAutoplaying) fails.push('audio/video playing with sound on load (must be gesture-gated)');
const ctxErr = consoleErrors.filter(e => /WebGL|Context Lost|Too many active/i.test(e));
if (ctxErr.length) fails.push(`WebGL context error in console: ${ctxErr[0].slice(0, 80)}`);

const summary = {
  minFps: +minFps.toFixed(0), maxLongTask: +maxLongTask.toFixed(0),
  audioAutoplaying, consoleErrors: consoleErrors.length, headed, softWebgl, fails, advisories,
};
if (jsonMode) {
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
} else {
  process.stdout.write(`motionqa: minFps ${summary.minFps} @${THROTTLE}x - max long-task ${summary.maxLongTask}ms - audio ${audioAutoplaying ? 'AUTOPLAYING(!)' : 'gesture-gated'} - console errors ${consoleErrors.length}${softWebgl ? ' [headless/software-WebGL]' : ''}\n`);
  for (const a of advisories) process.stdout.write(`ADVISORY ${a}\n`);
  for (const f of fails) process.stdout.write(`FAIL ${f}\n`);
  if (!fails.length) process.stdout.write(advisories.length ? 'PASS (perf advisories — verify headed)\n' : 'PASS\n');
}
process.exit(fails.length ? 1 : 0);
