# Reputable Health — Brand Guidelines for Claude Code

These guidelines ensure every asset produced by the team is unmistakably **Reputable**. Follow them when creating study designs, reports, social posts, email templates, dashboards, case studies, or any other branded material.

---

## 1. Brand Identity

**Company:** Reputable Health (reputable.health)
**What we do:** Connect research sponsors with health-conscious participants to run evidence-based wellness studies.
**Core promise:** Credible evidence, built transparently.

---

## 2. Color System

### Primary palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-lime` | `#C8E64A` | Primary accent — CTAs, badges, highlights, icon dots |
| `--brand-lime-light` | `#D9FF85` | Lighter variant for glows, transparent overlays |
| `--brand-lime-dim` | `#A3C232` | Subdued accent for secondary elements |
| `--brand-charcoal` | `#222220` | Text on lime backgrounds |
| `--bg-body` | `#0A0A0A` | Primary dark-mode background |
| `--bg-surface` | `#1A1A1A` | Cards, raised surfaces |
| `--bg-raised` | `#141414` | Intermediate surface level |
| `--text-main` | `#FFFFFF` | Primary text on dark backgrounds |
| `--text-muted` | `#999999` | Secondary/body text |
| `--border-dark` | `rgba(255,255,255,0.08)` | Subtle card borders |

### Secondary / data-viz accents

| Color | Hex | Context |
|-------|-----|---------|
| Teal | `#00B39F` | Positive metrics, health data |
| Indigo | `#6C5CE7` | Categories, chart segments |
| Sky blue | `#74B9FF` / `#60A5FA` | Status indicators, links |
| Rose | `#FB7185` | Alerts, dark-mode email label accents |
| Amber | `#FBBF24` | Warnings, highlight badges |
| Emerald | `#34D399` | Success states |
| Lavender | `#A78BFA` | Poll/option accent |

### Light-mode contexts (emails, print)

| Token | Hex | Usage |
|-------|-----|-------|
| Light background | `#F8F5F2` | Email body background |
| Light beige | `#F5F2ED` | Light-mode page background |
| White card | `#FFFFFF` | Card surfaces in light mode |

### Dark-mode overrides (emails)

Dark-mode email clients swap to these automatically:
- Body → `#000000`
- Cards → `#1C1C1E`
- Headings → `#FFFFFF`
- Body text → `#E5E7EB`
- Muted text → `#9CA3AF`
- Label accent → `#FB7185` (rose)

### Rules

- **Default to dark mode** for web assets, dashboards, and social posts.
- Use **lime on dark** as the signature look — never invert it to dark-on-lime for large surfaces.
- Lime is an **accent**, not a background. Use it for CTAs, badges, dots, borders, and small highlights.
- Always ensure sufficient contrast: lime text/badges need at minimum a `#0A0A0A` or darker background.

---

## 3. Typography

### Font stacks

```css
/* Standard — dashboards, social posts, case studies */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Premium — program overviews, landing pages */
font-family: 'Poppins', sans-serif;  /* weights: 300, 400, 500, 600, 700 */

/* Email — serif headlines */
font-family: Georgia, 'Times New Roman', serif;  /* .serif-head class, headlines only */
```

### Type scale

| Element | Size | Weight | Line height |
|---------|------|--------|-------------|
| h1 | `clamp(2rem, 6vw, 3.5rem)` | 600–800 | 1.2 |
| h2 | `clamp(1.5rem, 4vw, 2.25rem)` | 600 | 1.2 |
| h3 | `clamp(1.1rem, 3vw, 1.4rem)` | 600 | 1.3 |
| Body | `clamp(0.9rem, 2vw, 1rem)` | 400 | 1.6 |
| Label/badge | `0.75rem–0.85rem` | 600–800 | — |
| Fine print | `10px–11px` | 500–700 | — |

### Rules

- Labels and badges are **uppercase** with generous `letter-spacing: 0.12em–0.24em`.
- Headings are **white** (`#FFFFFF`). Body text is **muted** (`#999999`).
- Use `-webkit-font-smoothing: antialiased` on all dark-background assets.
- Prefer system fonts unless the asset is a program overview or landing page (then use Poppins).

---

## 4. Spacing & Layout

### Containers

```
Max width:    1100px (centered)
Padding:      clamp(1rem, 5vw, 2rem) horizontal
```

### Border radius tokens

| Token | Value | Use for |
|-------|-------|---------|
| `--radius-md` | `12px` | Cards, inputs, standard elements |
| `--radius-lg` | `16px` | Large cards, modals |
| `--radius-xl` | `24px` | Hero cards, featured sections |
| `--radius-pill` | `100px` | Buttons, badges, tags |

### Spacing conventions

- Standard card padding: `28px 24px` (vertical × horizontal)
- Large/featured card padding: `32px 36px`
- Section padding: `clamp(3rem, 8vw, 5rem)` vertical
- Grid gap: `1.5rem` between cards
- Element gap: `0.5rem–1rem` within cards
- Heading to body text: `14px` margin-bottom after h1; `22px` after h2
- Card title to description: `5px–8px`

### Social post canvas spacing (1080×1080)

These values are consistent across all square social posts:

| Element | Value | Notes |
|---------|-------|-------|
| Corner frames | `36px` from each edge | Signature brand element |
| Content side margins | `72px` left and right | The de facto content gutter |
| Top bar position | `top: 62px` | Label/dot row |
| Label element gap | `12px` | Gap between dot, text, and line in top bar |
| Footer position | `bottom: 58px–62px` | Brand name + slide number |
| Bottom accent bar | `4px` tall, `bottom: 0` | Lime-colored accent strip |

### Story/carousel canvas spacing (1080×1920)

Taller format shifts a few values outward:

| Element | Value |
|---------|-------|
| Corner frames | `40px` from each edge |
| Content side margins | `72px` left and right (same) |
| Top bar position | `top: 72px` |
| Footer position | `bottom: 72px` |
| Bottom accent bar | `4px` tall, `bottom: 0` |

### Flex gap scale

| Gap | Context |
|-----|---------|
| `8px` | Tight inline elements, poll option margins |
| `12px` | Label dot-to-text, icon-to-label |
| `14px` | List items, recap bullet spacing, reward items |
| `16px` | Card grid gaps, multi-column layouts |
| `24px` | Metric groups within cards |

### Dividers

- Width: `40px–60px` (never full width)
- Height: `1px–2px`
- Centered with `margin: 0 auto`
- Margin below: `18px–24px`

### Email-specific spacing

| Element | Desktop | Mobile |
|---------|---------|--------|
| Outer wrapper padding | `40px 10px` | `20px 8px` |
| Banner inner padding | `35px 20px` | `28px 16px` |
| Card padding | `40px 30px` | `25px 20px` |
| Section-to-section spacer | `20px–30px` | `16px–20px` |
| Poll option padding | `14px 16px` | `12px 12px` |
| Poll option gap | `8px` margin-bottom | same |

### Responsive grid

- 1 column on mobile (< 768px)
- 2 columns at 768px+
- 3 columns at 768px+ for metric/intel cards
- Use CSS Grid (`grid-template-columns`), not flexbox, for card layouts

---

## 5. Visual Design Patterns

### Background treatment (dark assets)

Every dark-mode asset uses this layered background:
1. **Base color:** `#0A0A0A`
2. **Grid overlay:** 50–54px squares, `rgba(255,255,255,0.02)` or `rgba(200,230,74,0.018)` lines
3. **Gradient orbs:** Soft radial gradients (lime, teal, or blue) at `0.3` opacity with `blur(120px)`
4. **Optional noise texture:** SVG fractal noise at very low opacity (0.03)

### Corner frames (social posts & case studies)

```css
.corner { position: absolute; width: 18px; height: 18px; }
.corner.tl { top: 36px; left: 36px;
  border-top: 1px solid rgba(200,230,74,0.18);
  border-left: 1px solid rgba(200,230,74,0.18); }
/* repeat for tr, bl, br */
```

These are a **signature Reputable element** — include them on all 1080×1080 and 1080×1920 social assets.

### Cards

```css
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 12px–24px;
```

Featured cards get a lime-tinted border and gradient:
```css
border-color: rgba(217, 255, 133, 0.3);
background: linear-gradient(135deg, rgba(217,255,133,0.08) 0%, rgba(255,255,255,0.02) 100%);
```

### Buttons

| Type | Style |
|------|-------|
| Primary CTA | Lime bg (`#C8E64A`/`#D9FF85`), charcoal text, pill radius, `font-weight: 600` |
| Outline CTA | Transparent bg, `rgba(255,255,255,0.2)` border, white text, pill radius |
| Hover (primary) | Slight lighten, `translateY(-2px)`, lime box-shadow glow |
| Hover (outline) | `rgba(255,255,255,0.05)` bg, border goes white |

### Badges & tags

```css
padding: 0.4rem–0.5rem 1rem–1.25rem;
background: rgba(217, 255, 133, 0.1);
border: 1px solid rgba(217, 255, 133, 0.3);
border-radius: 50px–100px;
font-size: 0.75rem–0.85rem;
font-weight: 600–800;
color: #C8E64A;
text-transform: uppercase;
letter-spacing: 0.12em–0.18em;
```

### Status dot

The glowing lime dot is used beside labels:
```css
width: 8px; height: 8px; border-radius: 50%;
background: #c8e64a;
box-shadow: 0 0 10px rgba(200,230,74,0.5);
```

---

## 6. Asset Dimensions

| Asset type | Dimensions |
|------------|-----------|
| Social post (square) | 1080 × 1080 px |
| Social story / carousel slide | 1080 × 1920 px |
| Email template | 600px max-width (centered) |
| Web dashboard / report | 1100px max-width |

For social posts, set the body to the exact pixel dimensions with `overflow: hidden`.

---

## 7. Animations & Interactions (web only)

- Transition speed: `0.2s–0.3s ease`
- Hover lift: `transform: translateY(-2px)`
- CTA glow on hover: `box-shadow: 0 10px 30px rgba(217,255,133,0.3)`
- Use `.reveal` class with `opacity: 1; transform: none;` for PDF-safe renders (no JS animations)

---

## 8. Voice & Tone

### Personality

| Trait | How it shows up |
|-------|----------------|
| **Approachable** | Conversational, not corporate. "Here's what we found" not "Data indicates." |
| **Evidence-based** | Always cite the study, the protocol, the data. Never hand-wave. |
| **Participant-first** | Center the human experience. Wellness matters more than metrics. |
| **Trustworthy** | Lead with transparency — IRB approval, blinding, data privacy. |
| **Educational** | Explain complex science simply. Assume curiosity, not expertise. |

### Do / Don't

| Do | Don't |
|----|-------|
| "Participants" | "Subjects," "users," or "customers" |
| "Studies" | "Trials" (unless actual clinical trial) |
| "Sponsors" | "Clients" or "advertisers" |
| "Study protocol" | "Experiment" or "test plan" |
| "Wearable data" | "Biometric surveillance" |
| "Verified evidence" | "Proof" (science doesn't prove, it supports) |
| "Aggregate results" | "Individual results" (we protect privacy) |
| "The Reputable Protocol" | Generic "our process" |
| "Onboarding" | "Sign-up" (it's more than a form) |
| "Arms" or "groups" | "Test group / control group" (keep it neutral) |
| "Washout period" | "Break" or "pause" |
| "Compliance" | "Obedience" or "adherence rate" without context |

### Headlines

- Lead with the insight, not the feature.
- Use sentence case for headlines (not Title Case).
- Keep headlines to 8 words or fewer when possible.
- For social posts: bold, punchy, one clear idea per slide.

---

## 9. Email-Specific Guidelines

- Light-mode default (`#F8F5F2` body) with full dark-mode overrides via `@media (prefers-color-scheme: dark)`.
- Use `<table>` layouts for Outlook compatibility — no CSS Grid or Flexbox.
- System sans-serif for body; Georgia/serif for feature headlines only.
- Max-width: 600px, centered.
- Cards: white bg with `border-radius: 16px` and subtle shadow.
- Include banner color themes for seasonal variation (Spring/Rose, Ocean, Forest, Amber, Slate — see `weekly-email-template.html` header comment for exact hex values).
- Mark editable sections with `<!-- ✏️ EDIT -->` comments so non-technical teammates can find them.

---

## 10. File & Naming Conventions

```
asset-name.html                     # Single-page asset
asset-name-1.html … asset-name-4.html  # Multi-slide carousel series
generate-pdf.mjs                    # PDF export via Puppeteer
images/                             # All image assets (avatars, product photos, mockups)
docs/                               # Documentation sub-pages
```

- Use **kebab-case** for all filenames.
- Number carousel slides sequentially starting at 1.
- Keep each HTML file self-contained (inline styles, no external CSS files).
- Images referenced locally from `./images/` or inlined as base64 for email.

---

## 11. Quick-Start Checklist for New Assets

When creating any new branded asset, verify:

- [ ] Dark background (`#0A0A0A`) with grid overlay and at least one gradient orb
- [ ] Lime accent (`#C8E64A`) used only for highlights, CTAs, badges — never as a background fill
- [ ] Corner frames included (social posts)
- [ ] System font stack (or Poppins for program pages)
- [ ] Labels are uppercase with letter-spacing
- [ ] Cards use `rgba(255,255,255,0.03)` bg with `rgba(255,255,255,0.08)` border
- [ ] Pill-radius buttons (`100px`) for all CTAs
- [ ] Body text is muted (`#999`), headings are white
- [ ] Correct terminology (participants, studies, sponsors, etc.)
- [ ] Responsive: single column on mobile, multi-column on desktop
- [ ] PDF-safe: `.reveal` class present, no critical JS dependencies

---

## 12. CSS Variable Reference (copy-paste ready)

```css
:root {
  /* Brand */
  --brand-lime:       #C8E64A;
  --brand-lime-light: #D9FF85;
  --brand-lime-dim:   #A3C232;
  --brand-charcoal:   #222220;

  /* Surfaces */
  --bg-body:    #0a0a0a;
  --bg-raised:  #141414;
  --bg-surface: #1a1a1a;
  --bg-hover:   #1f1f1f;

  /* Borders */
  --border:        #262626;
  --border-subtle: #1c1c1c;
  --border-dark:   rgba(255,255,255,0.08);
  --lime-border:   rgba(200,230,74,0.2);

  /* Text */
  --text-main:      #FFFFFF;
  --text-primary:   #f0f0f0;
  --text-secondary: #a0a0a0;
  --text-muted:     #999999;

  /* Lime utilities */
  --lime-bg:   rgba(200,230,74,0.08);
  --lime-glow: rgba(200,230,74,0.12);

  /* Radii */
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-pill: 100px;
}
```
