# Website Update Brief: Elevate At-Home Lab Testing

For: the Claude Code session in the website project folder (not the Second Brain vault). Date: Aug 3, 2026\. Owner: Katie. Requested by: Theban (Slack DM, Jul 23, 2026).

## How to use this file (instructions to the coding agent)

Read this entire file first. Then inspect the current homepage code and propose a written plan (what changes, where, and why) BEFORE editing any files. Wait for Katie's approval of the plan. After edits, tell Katie the exact command to preview locally. Never deploy, publish, or push to production. Katie handles deployment after review.

## The request

Theban's asks from the Jul 23 Slack thread, near verbatim:

1. Highlight the fact that Reputable does full lab biomarker testing at home, not just wearables.  
2. Place it higher up the page. His read: the site currently comes across as a wearable-based research platform, and the company has grown past that positioning. Labs get more respect with buyers.  
3. Lab logistics are now fully automated, and that is worth saying (see wording guardrail below).  
4. Placement should be sanity-checked with Pankaj on the sales side (he is back Tue, Aug 4).  
5. Constraint: he really likes the current look and feel, called it premium. This is a content and structure change, NOT a redesign. Do not change the visual system, typography, or color palette.

Reference for what lab reporting looks like on the platform (for a possible visual or link, and for tone): the dashboard prototype Theban shared, with the lab-focused option selected in the demo controls: [https://reputable-results-prototype.vercel.app/results\_redesign/results.html](https://reputable-results-prototype.vercel.app/results_redesign/results.html) (Link reconstructed from Slack. Confirm it resolves before referencing it anywhere public.)

Katie's addition: a fuller capabilities section is in progress with Mackenzie. This update is the interim move, not the final capabilities build.

## The positioning goal

From "wearable-based research platform" to: a full-service, decentralized clinical research organization that combines continuous wearable biometrics, full at-home lab biomarker testing, and validated survey instruments in one platform, from RWE pilots to full-scale RCTs. Wearables are one instrument, not the identity.

## Placement hypotheses (propose against the actual code, do not assume)

These are starting points. Read the real homepage first, then propose one, a merge, or something better.

- H1, hero language. Keep the design; adjust the subheadline or supporting line so the measurement triad is named immediately: wearables, at-home lab biomarkers, validated surveys. Note that even the ingredients deck's own running header says "Wearable-Powered Clinical Research," which is the exact framing Theban wants to grow past. If the homepage does the same, the headline area is likely part of the fix.  
- H2, a proof band directly under the hero. Three tiles: Continuous wearable biometrics / Full lab biomarker testing at home (blood, saliva, and more, with automated logistics) / Validated surveys (PSQI, PSS, PROMIS). Optionally link the lab tile to the lab reporting demo or a capabilities anchor.  
- H3, elevate the existing middle capabilities content. Katie already planned a mid-page mention. Theban wants higher. Moving or duplicating a compact version of it above the fold may be the smallest honest change.

## Source material, extracted from the July 2026 ingredients deck

Use this as capability language. It is NOT a license to copy stats onto the site (see guardrails).

### Who Reputable is (deck, About page)

Full-service, decentralized Clinical Research Organization (CRO). Designs and executes regulatory-aligned real-world studies and full-scale RCTs, powered by wearable tech, lab biomarkers, and participant-centered engagement. From pilot studies to 500-participant trials.

### Service offerings (deck p4)

- Study design: AI-powered study modeling, protocol development, power analysis  
- IRB / compliance support: full support for regulatory submission and review  
- Participant recruitment: AI-assisted matching, wearable-based targeting  
- Wearable data integration: sleep, HRV, activity and more  
- Biomarker and lab testing: blood, saliva, stool collection, lab integration  
- Validated surveys: validated questionnaires and participant-reported outcomes  
- Data privacy and ethics: GDPR / HIPAA-compliant data and consent management  
- Live dashboards and insights: real-time compliance tracking, outcome previews, reporting  
- Publications and claims support: white papers, marketing-ready outcomes, journal support  
- Pre-trial and post-market: feasibility and post-market surveillance

### Clinical formats (deck p7)

Wearable-validated real-world studies; randomized controlled trials from pilot (n \= \~70) to full scale (n \= 500+); longitudinal and rolling enrollment; pre-trial feasibility and post-market surveillance.

### The labs story, concrete instruments (deck pp. 14-19, dual-source measurement pages)

This is the strongest "more than wearables" material. Objective lab and physiological instruments by focus area:

| Focus area | Beyond-wearable objective instruments | Validated subjective instruments |
| :---- | :---- | :---- |
| Sleep | Cortisol (AM/PM), melatonin DLMO timing | PSQI, PROMIS sleep scales |
| Stress | Cortisol (saliva/serum), IL-6, CRP | PSS, PROMIS stress scales |
| Energy and fitness | VO2max, creatine kinase, DEXA (lean mass, fat) | PROMIS fatigue and physical function, energy diaries |
| Cognitive | Wearable EEG, Creyos cognitive testing, MoCA (digital), CRP, IL-6, amyloid-beta, tau | PROMIS cognitive function, PDQ-5 / PDQ-20 |
| Metabolism and weight | DEXA and smart scales, RMR via indirect calorimetry, leptin, ghrelin, glucose, insulin, cortisol | PROMIS health survey, appetite and satiety scores |
| Longevity | DNA methylation biological age, NAD+, oxidative stress markers | PROMIS global health scale |

At-home lab proof point (deck p9, Case Study 01): a fully decentralized women's longevity RWE pilot ran at-home methylation labs through a CLIA lab, alongside Oura biometrics and PROMIS-29 at four timepoints, with automated adherence tracking and missed-dose alerts. Use the capability shape freely; confirm the study numbers with Mackenzie before any figure appears on the site.

"At-home phlebotomy" is a real phrase from the deck's clinical infrastructure list and is usable capability language (it appears on the peptides page, but the capability itself is general).

## Guardrails (non-negotiable)

1. No em dashes anywhere in any copy. Use commas, periods, or parentheses.  
2. Look and feel are approved as-is. Content and structure changes only.  
3. Stats policy. The only pre-approved framing figures are "40+ customers" and "70+ studies." Every other number from the deck is verify-before-use and must not ship without sign-off: 12.6 days enrollment, \~87% compliance, 82% returning participants, 60% MoM newsletter growth, 20,000+ data points per day, "more than 50% of consumers" (unsourced), n-size ranges as claims. If a stat is wanted, write the sentence with \[Mackenzie: verify\] in place and flag it.  
4. Blocked outright: the RCT case study numbers (240 enrolled / 208 completed / 86%). Those figures are under active reconciliation and do not go on the site in any form.  
5. No peptide content anywhere on the site this quarter. Two standing decisions apply (Jul 29: peptides removed from the ingredient deck; Aug 3: back away from peptide content for the quarter). Skip deck page 20 and the peptides focus tile entirely. This source PDF predates the Jul 29 removal.  
6. Automation wording. Theban said lab logistics are now fully automated. Before the site says "fully automated," confirm the exact claim wording with Theban or Mackenzie. Safe interim phrasing: "with automated logistics and tracking."  
7. No health outcome or efficacy claims. Capability language only (what Reputable measures and runs), hedged to evidence.  
8. Ingredient-manufacturer ICP is a proposal, not a fact. Do not narrow the homepage to ingredient manufacturers as "who we serve."  
9. Analytics. Do not touch existing tracking. If any new page or route is created, flag it for GA4 tagging (property G-MD8RBFSZVZ) as a follow-up rather than wiring it silently.  
10. Review chain before deploy: Katie reviews the diff and preview, Pankaj confirms placement (back Aug 4), copy with claims goes through Kyle and Mackenzie per the standard gate. The agent's job ends at a previewed local change.
11. No stool or gut references in public-facing copy (Katie, Aug 3).

## Definition of done for this session

A previewed homepage where a first-time visitor learns within one screen that Reputable runs wearables, at-home lab biomarkers, and validated surveys as one platform, with zero new unverified numbers, zero peptide references, and the existing design untouched.  
