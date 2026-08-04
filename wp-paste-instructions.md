# Homepage Labs Update: WordPress Paste Instructions

Companion to `homepage-final.html`. Two publish paths are supported:

- **Path 1 (primary):** paste `homepage-final.html` into WordPress as a new draft page, the same way the Jul 30 version was published. Skip to "Path 1" below.
- **Path 2 (fallback):** patch the existing live page in place. Per-block find-and-replace pairs are in "Path 2" below.

Either way, resolve the flags first.

---

## Flags to resolve before publish

1. ~~Analytics duplication risk.~~ **Resolved by the body-only variant.** Primary route now pastes `homepage-final-body.html` (no GTM, no GA4, no `<head>`) into the standard WordPress page template, so the theme is the only place GTM (`GTM-59943GQP`) and GA4 (`G-MD8RBFSZVZ`) load. If you fall back to pasting the full `homepage-final.html`, the duplication risk returns; see the Path 1 alternative section for the tradeoff.
2. **Automation wording.** Copy uses "automated logistics and tracking" as the safe interim phrasing. Theban and Mackenzie need to sign off before we can switch to "fully automated."
3. **Results-demo link (Theban, tomorrow).** Lab tile in edit B is intentionally unlinked tonight. Theban to decide whether to link it to the results demo (`reputable-results-prototype.vercel.app/results_redesign/results.html`) once he confirms the URL resolves publicly and points at the labs-focused view. If yes, wire the anchor onto the tile 2 `<article>` in edit B before publishing.
4. **Pankaj placement sanity-check.** Back Tue Aug 4. Walk him through: hero triad, proof band, "Multi-Instrument Protocols" rename, lab biomarkers card. Confirm placement before publish.
5. **Peptides bullet on the live page.** The Ingredient Developers tile in "Research sponsors and Ingredient Developers" still lists "Peptides and bioactives" as its first bullet. Guardrail #5 says no peptide content this quarter. Held out of this pass on your instruction. Question for Pankaj and Theban: remove the bullet, keep it, or swap in different capability language?
6. ~~Pre-existing em dashes on the live page.~~ **Resolved:** approved as edit F. All 13 em dashes (6 in visible content, 7 in developer comments) replaced with commas or periods. See "Edit F" in Path 2 for the full list.
7. ~~Scientific identifiers with digits.~~ **Resolved:** approved as-is. Remaining tokens (`IL-6`, `VO2max`) are biomarker and fitness-measurement names, not counts or stat claims. (`HbA1c` was removed in a separate cleanup, see flag 8.)
8. **Provenance gaps for Mackenzie.** Two names in the first draft of edits B and E did not trace to the brief's deck extract or the live page and were removed:
   - `HbA1c` in the Metabolism row of the labs card (edit E). Deck's Metabolism row lists cortisol, glucose, insulin, leptin, ghrelin. HbA1c is a standard metabolism biomarker but is not in the extract. Replaced the slot with `cortisol` (deck-sourced for that row).
   - `CGMs` in the wearables tile of the labs proof band (edit B). Live has a specific CGM device (`Dexcom G7`) in the walkthrough participant panel, but not the term `CGMs`. Deck lists `glucose` as an outcome but does not name CGM devices. Removed the phrase entirely; tile now reads "Oura, Apple Watch, and Whoop." Mackenzie question: is naming `Dexcom` or `CGMs` explicitly on the homepage OK, and if so which term?
9. **Dropped adherence figure for Mackenzie.** Live walkthrough step 3 body ended with the sentence: "Adherence nudges keep engagement above 90%." Edit C's rewrite dropped this sentence entirely (the figure is on the brief's verify-before-use list, guardrail #3). Not restored in this pass. Mackenzie to verify the 90% figure, then decide restore or retire. If restore: it goes back into the walkthrough step 3 body, either as a separate sentence or as part of a step tagline.

---

## Path 1: Paste body-only variant into the default WordPress template (primary)

Uses `homepage-final-body.html`, which is `homepage-final.html` with the doctype, html/head/body wrappers, site header, footer, GTM, GA4, and all WordPress plugin scripts stripped. The default WordPress page template supplies the chrome (header, nav, footer), the analytics loaders (GTM + GA4 fire from the theme, no duplication risk), and the SEO metadata (via Rank Math). This avoids the analytics duplication risk in flag 1 and is the recommended route.

1. In WordPress, create a new draft page using the standard page template (the one the theme wraps in header, nav, footer, and the standard `<head>` chrome). Do not pick a "blank" or "full-width HTML" template.
2. Copy the entire contents of `homepage-final-body.html` into the page body. Depending on the editor:
   - Gutenberg: add a **Custom HTML** block and paste the contents in.
   - Classic editor: switch to the **Text** (HTML) tab and paste.
   - Elementor: add an **HTML** widget and paste the contents into its HTML field.
3. **Set the Rank Math SEO fields on the new draft page** so the theme emits the correct meta description, Open Graph description, and Twitter card description (the body-only file no longer carries them):
   - Open the Rank Math panel on the draft.
   - **Meta description:** paste the string below verbatim. Rank Math mirrors the same string to `og:description` and `twitter:description` automatically, so a single paste covers all three.
     ```
     Continuous wearable biometrics, at-home lab biomarkers, and validated surveys. Real-world evidence, gathered outside the clinic.
     ```
     (162 characters. Rank Math will show a green length indicator.)
   - Focus keyword and social image can stay at their current values or be reused from the existing homepage.
4. Save as draft. Preview.
5. Sanity-check in preview:
   - Site header, nav, footer, cookie banner, newsletter signup all render from the theme (they are not in the body-only file).
   - Reading order of content sections: hero, then the labs proof band (eyebrow "One platform, three instruments"), then "Who we work with", then "Two ways to start" (pathways), then "How it works" (walkthrough), then capabilities, then evidence, then contact.
   - Hero subhead reads "Continuous wearable biometrics, at-home lab biomarkers, and validated surveys. Real-world evidence, gathered outside the clinic."
   - Walkthrough step 3 title reads "Stream continuous wearable, lab, and survey data." and mentions at-home lab draws.
   - In "Built for Real-World Studies," the "Multi-Instrument Protocols" tile has replaced "Wearable-Native Protocols."
   - In "We measure what actually matters," a "Beyond wearables: At-home lab biomarkers, by focus area" card sits between the metric tabs panel and the KPI stat grid.
   - Open the browser devtools Network tab and confirm GTM (`GTM-59943GQP`) and GA4 (`G-MD8RBFSZVZ`) each fire exactly once, not twice. This resolves flag 1.
6. If preview looks right, route to the review chain (Katie, Pankaj on placement, Kyle and Mackenzie on any claim copy) before promoting the draft to the live page.

### Path 1 alternative: full HTML document

If for some reason the default page template does not render the body-only variant correctly (rare, only if the theme's page template does not open a `<main>` container the styles can render into), fall back to pasting the full `homepage-final.html` into a template that renders raw HTML (the same technique used for the Jul 30 draft). If you do this: the file carries its own GTM + GA4 head block, so before publishing, either (a) strip the GTM + GA4 head block from `homepage-final.html` first, or (b) confirm the raw-HTML template does not inject the theme's `<head>` (which would double-fire analytics). This is flag 1's tradeoff.

---

## Path 2: Patch the live page in place (fallback)

Five edits, one per WordPress block that renders the corresponding section. For each edit, open the block in the WP editor, switch to HTML/source view, find the "before" string, and replace with the "after" string. `homepage-final.html` shows the edits in context if you want to eyeball them together.

### Edit A: Hero subhead plus all four description mirrors

**In the hero block:**

Find:
```
Real participants. Real wearables. Real-world data, gathered outside the clinic.
```
Replace with:
```
Continuous wearable biometrics, at-home lab biomarkers, and validated surveys. Real-world evidence, gathered outside the clinic.
```

**Also update the page's SEO metadata** (WordPress SEO plugin fields, likely Rank Math based on the JSON-LD schema in the page). Four fields carry the old subhead as their description:
- Meta description (`<meta name="description">`)
- Open Graph description (`og:description`)
- Twitter card description (`twitter:description`)
- Rank Math JSON-LD Article description

Set all four to the same new sentence:
```
Continuous wearable biometrics, at-home lab biomarkers, and validated surveys. Real-world evidence, gathered outside the clinic.
```

### Edit B: Insert new labs proof band directly under the hero

Add a new Elementor section (or HTML block) directly between the hero section and the "Who we work with" audience section (H2: "Research sponsors and ingredient developers."). The final reading order is: hero, labs proof band, audience, pathways, walkthrough, capabilities, evidence, contact. Paste this HTML into the block source:

```html
<section id="measurement-triad" class="relative px-6 py-14 sm:px-10 sm:py-20 lg:py-24">
  <div class="mx-auto max-w-6xl">
    <div class="reveal mx-auto mb-10 max-w-3xl text-center sm:mb-12">
      <span class="eyebrow text-lime">One platform, three instruments</span>
      <h2 class="font-clinical mt-6 text-3xl leading-[1.05] tracking-[-0.035em] sm:text-5xl">Wearables, labs, and validated surveys, in one study.</h2>
      <div class="rule-in mx-auto mt-6 h-px w-16 bg-lime"></div>
    </div>
    <div class="grid gap-6 lg:grid-cols-3">
      <article class="reveal clinical-card tilt-glow scan cap-card p-8 sm:p-10"><span class="cap-rule"></span><h3 class="font-clinical mt-6 text-2xl leading-[1.1] tracking-[-0.03em] text-cream sm:text-[1.65rem]">Continuous wearable biometrics</h3><p class="mt-5 text-base leading-relaxed text-cream/60">Sleep, HRV, activity, and glucose from Oura, Apple Watch, and Whoop. Streaming in nightly.</p></article>
      <article class="reveal clinical-card tilt-glow scan cap-card p-8 sm:p-10"><span class="cap-rule"></span><h3 class="font-clinical mt-6 text-2xl leading-[1.1] tracking-[-0.03em] text-cream sm:text-[1.65rem]">Full at-home lab biomarker testing</h3><p class="mt-5 text-base leading-relaxed text-cream/60">Blood and saliva collection with automated logistics and tracking. Processed through CLIA labs.</p></article>
      <article class="reveal clinical-card tilt-glow scan cap-card p-8 sm:p-10"><span class="cap-rule"></span><h3 class="font-clinical mt-6 text-2xl leading-[1.1] tracking-[-0.03em] text-cream sm:text-[1.65rem]">Validated surveys</h3><p class="mt-5 text-base leading-relaxed text-cream/60">PSQI, PSS, PROMIS, and other validated instruments captured alongside every biometric.</p></article>
    </div>
  </div>
</section>
```

Uses only existing classes (`clinical-card`, `tilt-glow`, `scan`, `cap-card`, `cap-rule`, `eyebrow text-lime`, `rule-in`, `font-clinical`). Zero new CSS.

### Edit C: Walkthrough step 3 title and body

**In the walkthrough section block, step 3 (the "/ 03" step tag currently reading "Capture"):**

Find:
```
Stream continuous wearable + survey data.
```
Replace with:
```
Stream continuous wearable, lab, and survey data.
```

Find:
```
HRV, sleep architecture, activity, glucose, and PROs flow in nightly. Adherence nudges keep engagement above 90%.
```
Replace with:
```
HRV, sleep architecture, activity, and glucose flow in nightly. At-home lab draws (blood and saliva) run on protocol cadence with automated logistics. Validated PROs on schedule.
```

Note: this drops the "engagement above 90%" claim (on the brief's verify-before-use list). If Mackenzie later signs off on the number, it can be added back into any step tagline.

### Edit D: rename "Wearable-Native Protocols" to "Multi-Instrument Protocols"

**In the "Built for Real-World Studies" section, the second pillar tile:**

Find:
```
Wearable-Native Protocols
```
Replace with:
```
Multi-Instrument Protocols
```

Find:
```
Continuous biometric capture from Oura, Apple Watch, Whoop, and others. Paired with validated PROs (PSQI, PROMIS, etc.) for a full picture of outcomes.
```
Replace with:
```
Continuous wearable capture (Oura, Apple Watch, Whoop). At-home lab biomarkers (blood and saliva) with automated logistics. Validated PROs (PSQI, PROMIS). One dataset per participant, across instruments.
```

### Edit E: "We measure what actually matters" intro plus new lab biomarkers card

**Two changes in this section.**

**E1. Update the intro paragraph** so it names the triad:

Find:
```
Continuous biometric capture plus validated patient-reported outcomes across sleep, activity, and wellbeing.
```
Replace with:
```
Continuous wearable biometrics, at-home lab biomarkers, and validated patient-reported outcomes, across sleep, activity, biology, and wellbeing.
```

**E2. Insert a new static "Lab biomarkers by focus area" card** between the tabbed metrics panel and the 4-KPI stat grid. Design note: I did not add a 4th tab (Sleep / Activity / Sentiment / Labs) because the tab panel is a JavaScript-driven demo with illustrative numeric values, and adding a 4th tab would require introducing new demo numbers (fails the "no new numbers" check). A static below-the-tabs card names the biomarker categories without values. Paste this HTML immediately before the KPI grid (`<div class="reveal mt-12 grid grid-cols-2 gap-4 ...">`):

```html
<div class="reveal mt-10 clinical-card tilt-glow p-6 sm:p-8">
  <div class="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <span class="mono text-[10px] uppercase tracking-[0.32em] text-cream/50">Beyond wearables</span>
      <h3 class="font-clinical mt-3 text-2xl leading-[1.1] tracking-[-0.03em] text-cream sm:text-3xl">At-home lab biomarkers, by focus area.</h3>
      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-cream/60 sm:text-base">Blood and saliva draws with automated logistics. Processed through CLIA labs, paired with the wearable and survey streams above.</p>
    </div>
    <span class="mono text-[10px] uppercase tracking-[0.32em] text-cream/40"><span class="mr-2 inline-block size-1.5 -translate-y-0.5 rounded-full align-middle bg-lime heartbeat"></span>CLIA · processed</span>
  </div>
  <ul class="mt-4 text-sm text-cream/80">
    <li class="grid gap-1 border-t border-border py-3 sm:grid-cols-3 sm:gap-6"><span class="mono text-[10px] uppercase tracking-[0.28em] text-cream/50">Sleep, Stress</span><span class="sm:col-span-2">Cortisol AM/PM, melatonin, IL-6, CRP</span></li>
    <li class="grid gap-1 border-t border-border py-3 sm:grid-cols-3 sm:gap-6"><span class="mono text-[10px] uppercase tracking-[0.28em] text-cream/50">Metabolism</span><span class="sm:col-span-2">Insulin, leptin, ghrelin, glucose, cortisol</span></li>
    <li class="grid gap-1 border-t border-border py-3 sm:grid-cols-3 sm:gap-6"><span class="mono text-[10px] uppercase tracking-[0.28em] text-cream/50">Energy, Fitness</span><span class="sm:col-span-2">VO2max, creatine kinase, DEXA (lean mass, fat)</span></li>
    <li class="grid gap-1 border-t border-border py-3 sm:grid-cols-3 sm:gap-6"><span class="mono text-[10px] uppercase tracking-[0.28em] text-cream/50">Cognitive</span><span class="sm:col-span-2">CRP, IL-6, amyloid-beta, tau</span></li>
    <li class="grid gap-1 border-t border-border py-3 sm:grid-cols-3 sm:gap-6"><span class="mono text-[10px] uppercase tracking-[0.28em] text-cream/50">Longevity</span><span class="sm:col-span-2">DNA methylation biological age, NAD, oxidative stress markers</span></li>
  </ul>
</div>
```

Uses only existing classes. Zero new CSS.

### Edit F: replace every em dash inherited from live

Guardrail #1 says no em dashes anywhere in copy. Live had 13 em dashes, all pre-existing. Every one is replaced with a comma or a period, chosen to fit the sentence. 6 changes are in visible content, 7 are in developer comments (HTML, JavaScript, CSS) that don't render to users but violate the same guardrail. Zero en dashes existed either way.

**F1. Walkthrough step tags (visible, 5 changes).** In the "From cohort to evidence" block, in each of the 5 step tags:

| Find | Replace with |
|---|---|
| `/ 01 (em dash) Recruit` | `/ 01, Recruit` |
| `/ 02 (em dash) Protocol` | `/ 02, Protocol` |
| `/ 03 (em dash) Capture` | `/ 03, Capture` |
| `/ 04 (em dash) Analyze` | `/ 04, Analyze` |
| `/ 05 (em dash) Publish` | `/ 05, Publish` |

**F2. Activity metrics tab tagline (visible, 1 change).** In the JavaScript that populates the "Activity & Movement" tab of "We measure what actually matters":

| Find | Replace with |
|---|---|
| `Real-world exertion (em dash) not lab treadmills.` | `Real-world exertion, not lab treadmills.` |

**F3. Developer comments (not visible in rendered page, 7 changes).** These live in HTML comments, inline JS comments, and one CSS comment. Not user-facing but still em dashes. Fixed for cleanliness:

| Find | Replace with |
|---|---|
| `<!-- Phosphor Icons (em dash) loaded after wp_head to avoid script-loading conflicts -->` | `<!-- Phosphor Icons, loaded after wp_head to avoid script-loading conflicts -->` |
| `Do NOT use a bare .grid selector here (em dash) the card contains nested stat grids` | `Do NOT use a bare .grid selector here. The card contains nested stat grids` |
| `line (em dash) running off the page on mobile and clipping under the card on desktop.` | `line, running off the page on mobile and clipping under the card on desktop.` |
| `<!-- Reputable embed (em dash) build rh-2026-07-23k ... -->` | `<!-- Reputable embed, build rh-2026-07-23k ... -->` |
| `// a click just set the active step (em dash) don't fight it` | `// a click just set the active step, don't fight it` |
| `// on mobile the card is what's visible (em dash) switch the panel in place, don't jump up to the step` | `// on mobile the card is what's visible, switch the panel in place, don't jump up to the step` |
| `/* Fluent Forms styling inside footer (em dash) overrides default form styling */` | `/* Fluent Forms styling inside footer, overrides default form styling */` |

Path 2 patchers can skip F3 if the WordPress editor doesn't expose the developer-comment sections. Only F1 and F2 need to be applied to reach the "zero visible em dashes" state.

### Edit G: remove every "stool" reference from public-facing copy

New guardrail (Aug 3): no stool or gut references in public-facing copy. The copy blocks quoted in edits B, C, D, and E above already reflect this. If you are patching the live page in place instead of using the quoted blocks, apply these four straight find-and-replace pairs in the same section blocks:

| Find (edit) | Replace with |
|---|---|
| `Blood, saliva, and stool collection with automated logistics and tracking. Processed through CLIA labs.` (edit B, labs proof band tile 2) | `Blood and saliva collection with automated logistics and tracking. Processed through CLIA labs.` |
| `At-home lab draws (blood, saliva, stool) run on protocol cadence with automated logistics.` (edit C, walkthrough step 3 body) | `At-home lab draws (blood and saliva) run on protocol cadence with automated logistics.` |
| `At-home lab biomarkers (blood, saliva, stool) with automated logistics.` (edit D, Multi-Instrument Protocols tile body) | `At-home lab biomarkers (blood and saliva) with automated logistics.` |
| `Blood, saliva, and stool draws with automated logistics. Processed through CLIA labs, paired with the wearable and survey streams above.` (edit E, lab card intro) | `Blood and saliva draws with automated logistics. Processed through CLIA labs, paired with the wearable and survey streams above.` |

### Edit H: reorder sections so the labs proof band sits first and walkthrough sits last

Pure relocation, no copy changes. Two blocks move relative to live:

- The labs proof band from edit B sits directly under the hero (not later in the page).
- The walkthrough section (comment "WALKTHROUGH", eyebrow "How it works", H2 "From cohort to evidence, in five steps.") moves from its live position (between hero and audience) down to sit between the pathways section (H2: "Two research pathways.") and the capabilities section (H2: "Built for real-world studies.").

Target reading order: hero, labs proof band, audience, pathways, walkthrough, capabilities, evidence, contact.

If a Path-2 patcher is working from the live page in place: (1) apply edit B as documented above, inserting the proof band directly under the hero, and (2) move the entire walkthrough Elementor section as a unit from its live position down to sit immediately after pathways and immediately before capabilities. No find-and-replace pairs apply here since the exact copy inside both blocks is unchanged from edits B and C.

---

## What was intentionally not touched

- Site header nav, footer, newsletter signup, Heartbeats callout, cookie banner. All preserved from live.
- All four hero visual cards (HRV chart, Sleep Score, Sarah L. testimonial with before/after stats). Preserved.
- KPI stat grid at the bottom of "We measure what actually matters" (10,000+ / 4 wk / 256 hz / 93%). Preserved.
- Analytics head (GTM + GA4). Preserved verbatim from live. See flag 1.
- Peptides bullet in the Ingredient Developers tile. Preserved. See flag 5.
