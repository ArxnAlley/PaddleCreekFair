# PaddleCreekFair — Progress

> **Single authoritative progression document for this project.** Do not
> recreate separate frontend/deployment/backend progress files or a progress
> folder — consolidate all durable state here. This is a living reference,
> not a chronological log; rewrite sections in place as state changes rather
> than appending entries.

**Last updated:** 2026-09-06

---

## 1. Purpose & Architecture

PaddleCreekFair is a **standalone, single-page, mobile-first microsite** for
Paddle Creek Paints (a solo home-studio artist, Mary, in Catlettsburg, KY),
originally built as a QR-code destination for vendor fairs and now serving
as **the live production site at the business's real domain**,
`paddlecreekpaints.com`.

- Pure HTML/CSS/JS, no build step, no framework.
- One page: `index.html`. Everything — hero/announcement, gallery, About,
  the 10% offer, commission form — lives on it; nav items are in-page
  anchors, not separate pages.
- The **only** server-side component is a single Google Apps Script Web App
  serving **two separate funnels** (§11). It is not hosted here and not
  deployed by this repo — its source lives in `googleAppsScript/` to be
  pasted into the Apps Script editor by hand. GitHub Pages still serves
  static files only.
- It was copy-derived from a larger multi-page reference project
  (`ClientSites/impeccableTest2_PaddleCreekPaints/`, specifically its
  `fair.html`) but is now fully independent — **do not treat the multi-page
  project as this project's source of truth**; PaddleCreekFair has diverged.
- Code style: camelCase throughout, generous whitespace, section-banner
  comments — governed by `AGENTS.md`/`codeStyle.md` at the NuloWorkspace
  root. Follow existing patterns; this project has no `AGENTS.md`/
  `codeStyle.md` of its own.

---

## 2. Completed Implementation

**Navigation** — four in-page destinations: Custom Pieces (`#customPieces`),
About (`#about`), Facebook (external), Start a Piece (`#startAPiece`). All
mega-menu markup/CSS/JS from the source project was removed. Footer nav
matches. **On phones this is now a full-screen panel — see §3a.** No
discount entry was added to the nav; the decision and reasoning are in §7.

**Announcement brush** — the `.fairBar` band is a real painted brush-stroke
PNG (`graphics/assets/PaddleCreekBrushStroke.png`). Fully reworked
2026-09-06; the measurement it is built on and both treatments are in §3b.

**Hero / the two ways in** — `.fairHeroGrid` puts the catalogue heading,
lede and **both conversion CTAs** beside the "Meet Mary" video placeholder.
A visitor arriving from the QR code sees both paths before they start
browsing: **Start a piece** (rose painted button → `#startAPiece`) and
**Claim My 10% Off** (its cream twin → `#tenOffOffer`). Note
`.buttonPaintedLight` is a **colour modifier only** — it must be applied
alongside `.buttonPainted`, never on its own, or it renders as a bare link.

**Hero video placeholder** — non-autoplay "Meet Mary" frame, no fabricated
video source.

**About section** — id `about`, between the gallery and the offer section.
Copy is the *real, pre-existing* first-person text from the source project's
homepage (not invented). **Portrait is now the real photo** —
`graphics/images/artistPhoto.png` (941×1672, owner-supplied, untouched) —
inside the existing `.aboutFigure` polaroid frame. See §3c.

**Gallery / piece viewer (lightbox)** — click a piece → modal with subject/
surface/note, Prev/Next cycles `pieceCatalogue` in `js/siteJS.js`, close
button and Escape both work. The close is **animated** — `hidden` is set
after 320ms, so any test must wait past that.

**10% offer section** and **commission form** — the two funnels, §11.

**Header logo** — `graphics/logos/PaddleCreekPaintsLogoTP.png` (transparent,
1254×1254), `height: 6.5rem` desktop / `5.5rem` ≤1024px / `4.5rem` ≤720px.
The square pink-card `PaddleCreekPaints_logo.png` is **not** the header
logo; it is the **footer** logo (different folder) and the `og:image` (§5).

---

## 3. Current Frontend/UI State

Single page, fully responsive, verified with real Playwright-driven Chrome at
1920/1440/1280/1100/1025/1024/900/768/430/390/375/360/320px. No horizontal
overflow at any width. See §8.

### 3a. Mobile navigation — full-screen panel (rebuilt 2026-09-06)

At ≤880px the hamburger opens a **full-viewport** cream panel that slides
**down from the top** (`translateY(-100%)` → `0`), not a side drawer.

**The bug this replaced, and the corrected diagnosis.** Earlier revisions of
this document blamed `.siteHeader { position: sticky }` for trapping the
drawer inside the header's ~90px box. **That was wrong, and it was verified
wrong in Chrome:** with `position: static` and the blur still applied the
panel was still 90px tall; with `backdrop-filter: none` and sticky restored
it was the full 844px. The containing block for a `position: fixed`
descendant was being created by the header's own **`backdrop-filter`**,
which is one of the properties that does so (alongside `transform`,
`filter`, `perspective`, `will-change`, `contain`). `position: sticky` is
not. The fix is therefore `.siteHeader.navOpen`, which drops the blur for
exactly as long as the menu is open; the panel's own cream fills the header
strip in its place, so the header background can simply go transparent.

Everything else about it:

- `.brandLockup` and `.menuToggle` get `position: relative; z-index: 60`
  against the panel's `45`, so the **logo and the toggle stay visible on top
  of the open menu**. They are siblings of the panel inside `.headerInner`,
  so a stacking order is all it takes — no DOM move, no duplicate markup.
- The **hamburger morphs into an X in place**. That morph already existed
  (`.menuToggle[aria-expanded='true'] .menuToggleBars span` rotations); it
  needed no change. The button does not move by even a pixel between states
  — measured — and there is **no separate close control** anywhere in the
  panel.
- Links: stacked, hairline-separated, `1.5rem`, `min-height: 3.5rem` (56px,
  comfortably over the 44px floor). `.navAction` matches.
- `visibility` is stepped with `transition: visibility 0s linear 420ms` when
  closed and `0s linear 0s` when open. **This matters:** `visibility` is a
  discrete property, so left to transition normally it flips at the halfway
  point and the panel is unfocusable for the first half of the slide —
  which silently broke moving focus into it.
- `body.isNavOpen { overflow: hidden }` locks the page, mirroring the
  lightbox's `isViewerOpen`. `overflow: hidden` is deliberate over the
  `position: fixed` technique: it holds the scroll position rather than
  resetting it, so closing the menu — or following an in-page anchor out of
  it — lands correctly with nothing to restore.
- Escape closes and returns focus to the toggle. Tab is trapped inside
  `.headerInner` (which contains the X, the only way out). A resize above
  880px closes the menu so a rotated phone cannot strand the lock.

### 3b. The announcement brush (reworked 2026-09-06)

**The measurement everything is built on.** Measured with ImageMagick on the
actual PNG (3200 × 300): across the text's horizontal span the stroke is
only fully opaque between **y49 and y237 — the middle 63% of the rendered
image height, centred at 47.7%**. Above and below is frayed, semi-
transparent bristle. Text outside that band sits on cream and becomes
unreadable. (Narrowing the span to the middle 40% only widens the band to
66%, so 63% is the number to design against.)

**Desktop (>1024px)** — event and time sit on **one centred line**, so the
band only has to clear a single line of type. The stroke is flattened from
its natural `32/3` to `aspect-ratio: 41/3` with `object-fit: fill` — about
**22% less vertical presence** at every desktop width (measured: 1920px
165.6→129.2, 1440px 124.2→96.9, 1280px 110.4→86.2, 1025px 88.4→69.0).
Flattening rather than narrowing is what keeps the painted ends and the
cream side margins exactly where they were.

**Mobile (≤1024px)** — deliberately **two centred lines**. At phone widths
the natural stroke renders far too short to hold them (at 390px: ≈35px of
image, ≈22px of band, against ≈42px of text — which is exactly why the old
build spilled the time line onto the cream). So the relationship inverts:
`.fairBarInner` becomes the in-flow element that sizes the wrap, and the
stroke is absolutely positioned behind it and stretched to fill. The brush
is then always exactly as tall as the words need, at every width, with no
per-breakpoint height table. Its vertical padding
(`clamp(1.15rem, 4.6vw, 1.55rem)`) is the whole mechanism — below roughly
`0.36 × ` the text block's height the time line returns to the cream.
`.fairBar`'s mobile padding was raised to `clamp(1rem, 3.4vw, 1.4rem)` so
the heavier stroke never reads as merged with the cream header (measured
gap: 16px on phones, 22px at 768–1024px, up from 10px).

Typography was **not** shrunk to make any of this fit — the existing
`clamp()`s are untouched.

### 3c. The About portrait — real photo integrated (2026-09-06)

The "coming soon" portrait placeholder is gone. The `.aboutFigure` frame
(polaroid card: cream mat, `box-shadow: var(--shadowLedgeDark)`,
`transform: rotate(-1.6deg)`) was **already built anticipating a real
photo** — `.aboutFigure img` already carried
`aspect-ratio: 1/1; object-fit: cover; object-position: 50% 42%` before this
session touched it. Swapping the placeholder `<div>` for a plain `<img>`
was the entire change; no new CSS was needed for the crop or the frame.

**Follow-up, same day:** owner feedback that the square crop read too tight
on the face. `.aboutFigure img`'s `aspect-ratio` was changed from `1/1` to
`4/5` — a taller box means `object-fit: cover` has to crop less of the
photo's vertical extent to fill it, so more of the shoulders/background
shows without touching `object-position` or the frame treatment. `object-fit`
stays `cover` (no distortion, no letterboxing). Verified at all 9 tested
widths (1920→320px) that the rendered box is genuinely 4:5, not stretched.

- **Asset:** `graphics/images/artistPhoto.png` — 941×1672 (portrait),
  owner-supplied, untouched (verified same MD5 before/after this session).
- **Markup:** `index.html`, inside `<figure class="aboutFigure">` alongside
  the existing `<figcaption>Mary</figcaption>` — the modifier class
  `aboutFigurePlaceholder` (which had no CSS rule of its own) was dropped
  along with the placeholder `<div>`, its SVG icon, and the "Portrait coming
  soon" note.
- **`width="941" height="1672"`** attributes set to the file's real
  intrinsic size (prevents layout shift); `loading="lazy"` and
  `decoding="async"` match the convention used elsewhere on the page.
- **`alt="Mary, the artist behind Paddle Creek Paints, in her home
  studio."`** — identifies her by name and role, consistent with the
  no-fabrication rule (§7): it does not claim anything about the photo's
  actual setting beyond what "home studio" already establishes for Mary
  generally.
- **Responsive behaviour** is the pre-existing single rule, not new
  per-breakpoint work: `object-fit: cover` with `aspect-ratio: 1/1` means
  the image is always cropped to a square, never stretched, at every width;
  `object-position: 50% 42%` biases the crop slightly above center, which
  keeps a face in frame regardless of source aspect ratio. At ≤1024px
  `.aboutFigure` itself caps to `max-width: 22rem` and the section drops to
  one column (a rule that already existed) — no image-specific mobile CSS
  was added or was needed.
- **Obsolete CSS removed:** `.aboutPortraitPlaceholder`,
  `.aboutPortraitIcon`, `.aboutPortraitNote` in `css/stylePages.css` — all
  three were referenced only by the now-deleted markup.
- **The Meet Mary hero video placeholder was not touched** — verified
  byte-identical before/after. It is a separate, still-unfulfilled
  placeholder (§9).

### 3d. Known issues

None outstanding in the nav, brush, or About portrait. The remaining items
are in §9/§10.

---

## 4. Git / GitHub Pages State

| Item | Value |
|---|---|
| Repo | `https://github.com/ArxnAlley/PaddleCreekFair` (public) |
| Local path | `C:\Dev\NuloWorkspace\PaddleCreekFair` |
| Default branch | `main` |
| Local `main` | **`7c09eb6` — up to date with `origin/main`** |
| GitHub Pages | Enabled, serving from `main` branch root |
| `.nojekyll` | **Absent.** Harmless today, but **if `docs/*.md` is ever committed and pushed, Jekyll will render it as a public page**. Add `.nojekyll` at repo root before that happens. |

The earlier "behind by 1" state was resolved with an explicit
**`git merge --ff-only origin/main`** (fast-forward only). The incoming
commit was inspected first and touched only `CNAME`. The uncommitted CSS was
backed up beforehand and verified byte-identical afterwards (same MD5; a
line-level diff showed 0 lines removed).

**⚠️ Everything below is uncommitted:**

1. `css/stylePages.css` — the brush rework (§3b), the offer section, the
   hero CTA pair, **plus** the earlier responsive brush/typography pass from
   a previous session that has still never been committed.
2. `css/styleIndex.css` — the full-screen mobile nav (§3a) and
   `body.isNavOpen`.
3. `index.html` — offer section, hero CTA pair, commission honeypot,
   metadata fixes (§5), the real About portrait (§3c).
4. `js/siteJS.js` — `paddleCreekConfig`, both funnel handlers, nav rework.
5. `googleAppsScript/` — new, untracked (§11).
6. `docs/` — this file and `sessionCloseout.md`, untracked.
7. `graphics/qrCodes/PaddleCreekPaints_QRCode.svg` — untracked,
   **owner-supplied**, not created by any Claude session and not referenced
   by any page. Left untouched.
8. `graphics/images/artistPhoto.png` — untracked, **owner-supplied**, now
   referenced from `index.html` (§3c). The source file itself was never
   modified.

**No Claude session has ever run `git commit` or `git push` on this repo.**
The `--ff-only` fast-forward above is the only git write any session has
performed, and it was explicitly requested.

---

## 5. Custom Domain, DNS, HTTPS/TLS State

Domain: **`paddlecreekpaints.com`** — the real business domain.

Verified live by direct DNS lookup and HTTP(S) fetch:

| Record | Value |
|---|---|
| apex | A → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` |
| `www` | CNAME → `arxnalley.github.io` |
| `CNAME` file | `paddlecreekpaints.com` (present locally and on `origin/main`) |
| `https://` | 200, serving this project. TLS working. |
| `http://` | Also 200 — **does not redirect**. "Enforce HTTPS" is off; recommend enabling it. |

DNS is presumably at Namecheap per the registrar the owner referenced; not
independently verified, only the resolved records above.

### Production metadata — fixed

| Was | Now |
|---|---|
| `canonical` → `…/fair.html` (a path that does not exist) | `https://paddlecreekpaints.com/` |
| `og:url` → same bad `/fair.html` | `https://paddlecreekpaints.com/` |
| `og:image` → `…/images/logos/ogImage.jpg`, **live 404** | `…/images/logos/PaddleCreekPaints_logo.png` — **live 200, image/png, 1200 × 1200** |

`og:image:width`/`height`/`alt` added alongside. The stale TODO above the
canonical tag (referencing a `sitemap.xml` that does not exist here) was
replaced.

**Caveat, recorded not acted on:** `twitter:card` is `summary_large_image`,
which crops to ~1.91:1, so a 1200 × 1200 logo is centre-cropped by
Twitter/X. Correct elsewhere. A purpose-built 1200 × 630 image is a design
task for the owner, not a metadata repair.

---

## 6. Important Asset/File Paths

```
index.html                                   the entire site
css/styleIndex.css                           shared design system + full-screen mobile nav
css/stylePages.css                           fairBar/brush, hero video + CTA pair, hero video placeholder, 10% offer
js/siteJS.js                                 config, nav, piece viewer, BOTH funnel handlers

googleAppsScript/Code.gs                     doGet/doPost, routing, both handlers, 3 test functions
googleAppsScript/Config.gs                   submission types, sheet names, both header contracts, code, business facts, owner address
googleAppsScript/Validation.gs               shared sanitizers + both payload validators, routing resolution
googleAppsScript/SheetService.gs             generic sheet helpers, duplicate lookup, both writers, logging
googleAppsScript/NotificationService.gs      all four emails + shared send/escape helpers
googleAppsScript/ResponseService.gs          JSON responses (never carry the discount code)
googleAppsScript/README.md                   manual Sheet + Apps Script deployment guide

graphics/assets/PaddleCreekBrushStroke.png   announcement brush (3200×300, do not modify)
graphics/logos/PaddleCreekPaintsLogoTP.png   CURRENT header logo (do not modify)
graphics/logos/PaddleCreekPaints_logo.png    NOT the header logo (unused copy)
graphics/qrCodes/PaddleCreekPaints_QRCode.svg  owner-supplied, untracked, unreferenced
graphics/images/artistPhoto.png              owner-supplied, untracked, THE real About portrait (§3c) — do not modify

images/artwork/*, images/photos/*            gallery + piece-viewer images
images/decorative/*                          botanicalSprig.svg, roseBrushStroke.svg, sageBrushStroke.svg
images/favicons/*                            favicon set
images/logos/PaddleCreekPaints_logo.png      footer logo AND the og:image (§5)
images/logos/devCredit/MasterLogoTP.png      footer "Developed by" credit mark

docs/progress.md                             this file — the single authoritative progress doc
docs/sessionCloseout.md                      last-session handoff
```

**Pre-existing dead asset reference (inert, NOT fixed):**
`css/styleIndex.css` references `../images/decorative/heroPaintStroke.svg`
twice; the file does not exist. Present in committed `HEAD` too. Harmless
here: the owning selectors (`.wallHeroWords::before`, `.pageHeroInner::before`)
never match on this page, so the browser never requests it.

---

## 7. Established Decisions & Constraints

| Decision | Reason |
|---|---|
| Facebook is the **only** verified social account | Supplied directly by the owner. **No Instagram or any other handle exists for this business as far as this project knows — never invent or infer one,** including in email copy. |
| "Mary" is the artist's real name | Supplied directly by the owner. |
| About copy reuses the source homepage's real text verbatim | Never invent biographical copy. |
| Hero video is an honest placeholder | Same no-fabrication principle. The About **portrait** is no longer a placeholder — real photo integrated 2026-09-06 (§3c). |
| The artist photo is used exactly as supplied | The brief required using the existing asset directly without modifying the source image; only CSS (`object-fit`/`object-position`, already pre-built) controls the crop. |
| Brush/logo PNGs are never modified in place | All sizing via CSS. |
| Single consolidated `progress.md` | Explicit instruction for this project. |
| No git commit/push by any Claude session | Every task has forbidden it. The one `--ff-only` fast-forward was explicitly requested and is **not** standing authorization. |
| **The discount code is server-side only** | The website never sends, stores or displays a code, and the JSON response deliberately does not carry it either. It exists in the customer's email and nowhere else. |
| **The two funnels share plumbing but nothing else** | Separate sheets, separate emails, separate validators. Routing is on an explicit `submissionType`, never inferred from which fields happen to be present. |
| The discount is **email only** | No name, phone, SMS, address or message field. Verified by test. |
| **No discount entry was added to the nav** | The brief said not to add one for symmetry, and only if it materially improved discoverability. It would not: the nav is 4 items and already carries Start a Piece, and the hero now exposes **both** paths above the fold before any browsing. Revisit only if the owner asks. |
| Commission inquiries are **not** de-duplicated | A second inquiry is a second piece to discuss, and two people can share a mailbox. |
| Mary is **not** re-alerted for a repeat discount signup | It is not a new name on the list. She still gets the alert for every genuinely new one. |
| The commission form keeps its `mailto:` fallback | Used only while the endpoint is unconfigured, so a half-built backend can never silently swallow a commission. |

---

## 8. Verification Already Completed

All browser verification uses **real rendering** (Playwright 1.63.0 driving
the installed Chrome via `channel: 'chrome'`) against a local static server.
Harnesses live in the session scratchpad, **not** committed to the repo.

**566 automated assertions, all passing** as of 2026-09-06 (494 from the
funnel/nav/brush session, plus 72 added for the About portrait swap):

| Suite | Assertions | Covers |
|---|---|---|
| Backend (`runner.js`) | 131 | Both funnels in a Node `vm` with mocked Apps Script globals |
| Frontend core (`verify.js`) | 125 | Metadata, offer section, microsite regression, responsive, a11y |
| Two funnels (`funnels.js`) | 53 | CTA placement, commission funnel, cross-funnel isolation |
| Mobile nav (`nav.js`) | 185 | Full-screen panel at 5 phone widths + desktop regression |
| Artist photo (`artistPhoto.js`) | 72 | Real asset resolution, placeholder removal, responsive crop at 9 widths |
| Brush geometry (`brush.js`) | 13 widths | Text inside the measured painted band at every width |

**Backend — what is actually proven**
- Missing or unknown `submissionType` is refused; nothing written, nothing sent.
- DiscountLeads headers exactly `Email · Signup Date · Discount Code`;
  address normalized lowercase; date a real `Date`; code `PADDLE10`.
- Duplicate suppression **case-insensitively** and with surrounding
  whitespace; a hand-typed sheet row is matched too and its empty code cell
  repaired. A repeat re-sends the welcome and writes **no** second row, and
  does **not** re-alert Mary.
- A payload trying to set `discountCode: 'FREE100'` is ignored; `FREE100`
  never reaches the sheet.
- **`PADDLE10` never appears in any JSON response** — asserted on the
  response body, not just the UI.
- CommissionLeads headers exactly the nine mapped columns; line breaks in
  the idea field preserved; formula-shaped input neutralized with a leading
  apostrophe.
- **Cross-funnel isolation asserted directly:** no commission-only address
  appears in DiscountLeads and vice versa; every discount welcome went to a
  DiscountLeads address; every commission acknowledgement went to a
  CommissionLeads address; `PADDLE10` appears only in discount-welcome and
  owner-alert bodies.
- Commission acknowledgement contains **no** `PADDLE10`, thanks them,
  confirms receipt, says Mary will review and follow up, and promises **no**
  response time (asserted against "24/48/72 hours" and "within N days").
- Mary's two notifications are distinct from each other and from the
  customer mail, go to `paddlecreekpaints@gmail.com`, and carry the right
  detail (discount: email, date, 10% claim, code, "recorded in
  DiscountLeads"; commission: all submitted fields + "CommissionLeads is the
  record"). `replyTo` is the customer on both.
- Mail failure never loses a record: row still written, success still
  returned, `emailSent: false`, error logged.
- Lock taken and always released, including on error paths.
- Honeypot on both funnels: success returned, nothing written, nothing sent.

**Frontend — what is actually proven**
- Discount form shows **exactly one visible field** (measured by on-screen
  box, `display`, `visibility` and `opacity`); commission form shows exactly
  its five real fields. Both honeypots off-canvas, `opacity: 0`,
  `pointer-events: none`, `aria-hidden`, `tabindex="-1"`, skipped by Tab.
- Discount success copy is the required wording and **`PADDLE10` is absent
  from the status line, from `body.innerText`, and from the whole rendered
  DOM.**
- Discount payload keys are exactly `email, honeypot, source, submissionType`
  — no name/phone/address/message, no commission fields.
- Commission payload carries all five real fields plus the referenced piece,
  declares `commissionInquiry`, and requests no discount code.
- Both CTAs sit inside the hero grid beside Meet Mary and **before** the
  gallery; nav still has exactly its 4 original destinations with no
  discount entry.
- Unconfigured endpoint: discount form says so honestly without leaking the
  code; commission form falls back to the mail-client handoff and says
  plainly that nothing was sent.
- Endpoint configuration is tested by **literally performing README Step 5**
  — rewriting the placeholder in the served `siteJS.js`.
- Mobile nav at 430/390/375/360/320: panel fills the viewport, header blur
  dropped, body locked, toggle and brand on top (hit-tested), all 4
  destinations ≥44px, none behind the header, bars morphed to an X, X in the
  **same** position (<1.5px), no separate close control, X closes, scroll
  restored, blur restored, anchor navigation closes the menu and leaves the
  page scrollable, Escape closes and returns focus, focus moves into the
  panel on open, external link keeps `target`/`rel`.
- Desktop nav unregressed at 1440/1024/900: toggle hidden above 880px, nav
  `static`/`row`, body never locked.
- Brush: text inside the measured painted band at all 13 widths, no
  horizontal overflow, no header overlap.
- Zero page errors, zero console errors, zero failed asset requests.

**About portrait — what is actually proven**
- The `<img>` resolves to the real file, loads successfully (`naturalWidth`/
  `naturalHeight` match the actual 941×1672 asset — checked after scrolling
  it into view, since it is `loading="lazy"`), and `width`/`height`
  attributes match the intrinsic size.
- Alt text identifies Mary by name and business.
- All TODO comments, the placeholder `<div>`, its SVG icon, the "Portrait
  coming soon" note, the `aboutFigurePlaceholder` modifier class, and the
  three now-orphaned CSS rules are confirmed **gone** — asserted by string
  search, not just visual check.
- At all 9 tested widths: `object-fit: cover` holds (no distortion),
  `object-position: 50% 42%` is preserved, the rendered box stays square
  (ratio within 0.05 of 1:1 — proves `aspect-ratio` is applied, not
  stretched to the source's native 941:1672), the polaroid shadow and
  rotation (the "already written" framed treatment) are present, and there
  is no horizontal overflow.
- The Meet Mary hero video placeholder is confirmed **unchanged** — string
  and DOM checks that "Meet Mary" / "Video coming soon" are still exactly
  there.

**Lighthouse** (local server): Desktop **88**/96/100/100 — above the earlier
86 baseline. Mobile **69**/96/100/100, LCP 12.5s, matching the recorded
baseline across two runs. The two remaining findings were confirmed by
selector to be pre-existing: `color-contrast` is the footer
`.devCreditLabel`, `unsized-images` is the announcement brush.

**Static checks.** `node --check` on all six `.gs` files and `js/siteJS.js`;
CSS brace balance (51/51 and 394/394); HTML tag balance across 13 element
types; no duplicate ids; all five in-page anchors resolve; full
asset-reference sweep (only the inert `heroPaintStroke.svg` from §6);
`PASTE_DEPLOYED_APPS_SCRIPT_URL_HERE` confirmed as the single occurrence and
no fabricated `/exec` URL anywhere.

---

## 9. Remaining Placeholders/TODOs

- Hero "Meet Mary" video — no real video yet; placeholder marked
  `TODO — OWNER`. (This is a different asset from the About portrait, which
  is now real — §3c.)
- ~~About-section portrait of Mary~~ — **resolved 2026-09-06** (§3c).
- Phone number and any social beyond Facebook are deliberately absent.
- A purpose-built 1200 × 630 share image, if Twitter/X cropping matters (§5).

## 10. Pending Work

- **Commit and push.** Nothing in §4 is committed, so none of this is live.
- **Deploy the Apps Script** (§14) — the backend is code-complete and
  locally verified but inert until the owner does the manual Google setup.
- Enable "Enforce HTTPS" in GitHub repo Settings → Pages (§5).
- Add `.nojekyll` before `docs/` is ever pushed (§4).
- `images/logos/paddleCreekLogoTransparent.webp`,
  `graphics/logos/devCredit/masterLogoTP.webp`, and the dead
  `heroPaintStroke.svg` rules (§6) are unreferenced leftovers; safe to
  remove in a later cleanup pass.

---

## 11. Two Conversion Funnels — BUILT 2026-09-06

**Status: implemented and locally verified. Not deployed, not committed.**
The Google Sheet and Apps Script Web App do not exist yet (§14).

ONE Apps Script deployment, ONE `/exec` URL, routed by an explicit
`submissionType` on every request:

```
                    ┌─ "discountSignup" ─────┐
Website ──POST──►  /exec                     ├─► DiscountLeads
                    │                        ├─► customer welcome (carries PADDLE10)
                    │                        └─► Mary: "new 10% signup"
                    └─ "commissionInquiry" ──┐
                                             ├─► CommissionLeads
                                             ├─► customer acknowledgement (NO code)
                                             └─► Mary: full inquiry detail
```

A request that does not declare a recognised type is **refused**, never
guessed at. That is what guarantees the isolation.

### Funnel A — Start a Piece (commission)

The existing form, unchanged in its fields. It no longer composes a
`mailto:` on success; it posts to the endpoint. The mail-client handoff
survives as the fallback for when no endpoint is configured.

`CommissionLeads` — mapped from the **real** form fields:

| Column | Source |
|---|---|
| Inquiry ID | server-generated, `PCP-0001` upward |
| Submitted At | server |
| Name | `#visitorName` |
| Email | `#visitorEmail`, normalized |
| Surface | `#pieceSurface` |
| What To Paint | `#pieceIdea` (line breaks preserved) |
| Occasion | `#pieceOccasion` |
| Referenced Piece | the catalogue piece carried in from the lightbox |
| Source | `fairCommission` |

Required: name, well-formed email, and something about what to paint —
matching the form's own client-side rules. Not de-duplicated (§7).

### Funnel B — Claim My 10% Off (discount)

**Exactly one visible field: email.** No name, phone, SMS, address or
message. Plus an off-canvas honeypot.

`DiscountLeads` — `Email · Signup Date · Discount Code`, three columns.
Case-insensitive duplicate protection; a repeat never opens a second row but
does re-send the welcome email.

Shared server-controlled code: **`PADDLE10`**, assigned in `Config.gs`. The
browser never sends it, never stores it, never displays it, and the JSON
response does not carry it.

### The four emails

| Email | To | Carries PADDLE10? |
|---|---|---|
| Discount welcome | customer | **yes** — the only place it appears |
| Discount alert | `paddlecreekpaints@gmail.com` | yes (so Mary can verify at the table) |
| Commission acknowledgement | customer | **no** |
| Commission notification | `paddlecreekpaints@gmail.com` | no |

**Discount welcome** — subject
`Welcome to Paddle Creek Paints — here’s your 10% off!`. Greeting → who Mary
is and where she paints → the code in a bordered block → how to redeem →
catalogue link → Facebook link → sign-off. Returning signups get a variant
opening ("You are already on the list…").

**Discount alert** — customer email, signup date, that they claimed 10% off,
`PADDLE10`, and that they are recorded in DiscountLeads with the row number.
States plainly that DiscountLeads is the authoritative list and that Mary can
verify entitlement either from the customer's own email on their phone or
from the sheet. Sent for **new** signups only.

**Commission acknowledgement** — subject
`Thank you for your custom piece inquiry — Paddle Creek Paints`. Thanks them
for reaching out, confirms the inquiry was received, says Mary will read it
through properly and come back to them to talk the piece through, echoes
their own submitted details, and gives the inquiry reference. **No discount
code. No response-time promise.**

**Commission notification** — every submitted field in a readable table plus
the free-text idea in full, `replyTo` set to the customer so replying just
works, and a note that CommissionLeads is the durable record.

**Sourcing note.** No literal email copy existed in this document before it
was written, so all four bodies were composed from facts this project has
already established (§7): Mary; Catlettsburg, Kentucky;
`hello@paddlecreekpaints.com`; the site URL; the verified Facebook URL; and
the site's own voice ("painted one piece at a time"). **Nothing was
invented** — no expiry date, no minimum spend, no phone number, no second
social account, no response-time promise.

### The one frontend configuration point

`js/siteJS.js`, under the `SITE CONFIGURATION` banner:

```javascript
const paddleCreekConfig = {

    /* Paste the deployed Google Apps Script Web App URL here. */

    offerEndpointUrl: 'PASTE_DEPLOYED_APPS_SCRIPT_URL_HERE',

    offerRequestTimeout: 15000

};
```

**Both forms read it.** It is the only place in the repository where the
`/exec` URL belongs, and no real URL has been fabricated.

Note `paddleCreekConfig` is a `const`, so it is **not** on `window`; a test
that wants to point it elsewhere must rewrite the served file.

### Preserved backend behaviour

Server-side validation and normalization, formula-injection neutralisation,
honeypots on both forms, `LockService` around every write with emails sent
after release, case-insensitive duplicate protection, best-effort email with
plain-text retry, activity/error logging, server-controlled `PADDLE10`, the
CORS-simple `text/plain` request pattern, and one obvious `/exec`
configuration point. Utilities are shared between the funnels, not
duplicated.

## 12. Existing Nulo Implementations Reused

Read (never modified):

- **`birthdayWebsite/googleAppsScript/`** — the structural template: the
  file split, the `doPost` pipeline shape, `parseRequestPayload` handling
  both JSON-as-text/plain and form-encoded bodies,
  `getConfiguredSpreadsheet` with the Script-Properties/bound fallback,
  headers-as-contract with self-healing, swallow-everything logging, the
  response shape, in-editor test functions, and the client `fetch` pattern.
  Its README was the model for `googleAppsScript/README.md`.
- **`ClientSites/client_HesterAsphalt/appsScript/`** — the email and
  data-safety patterns: `isValidEmail`, `neutralizeFormula`, `escapeHtml`,
  the plain-text-first/HTML-second body pair, the best-effort send with a
  plain-text retry that never throws back into the write path, and the
  owner-notification shape (which **is** now used, unlike the first pass).
- **`ClientSites/client_BluegridLandSolutions/appsScript/`** — second data
  point; agrees with Hester's approach.

Deliberately not carried over: their sequential per-lead reference schemes
beyond the simple `PCP-` counter, and their in-sheet `config` tab.

## 13. Exact Next Steps for a Fresh Claude Session

1. Read this file and `docs/sessionCloseout.md` in full first.
2. Run `git status` / `git log --oneline -5` and confirm §4 still holds —
   trust git over this document if they disagree.
3. **Get explicit user confirmation before any `git commit` or `git push`.**
4. The backend is code-complete but **inert until §14 is done by the owner**.
   Do not fabricate an `/exec` URL to "finish" it.
5. Do not create `progressFrontend.md`/`progressDeployment.md`/
   `progressBackend.md` or a `progress/` folder.

## 14. Manual Google Setup Still Required (owner)

Full detail, with the expected results of every test, is in
**`googleAppsScript/README.md`**. None of it can be done from this repo.

1. **Create one Google Sheet.** No tabs or headers needed — the script
   creates `DiscountLeads`, `CommissionLeads`, `ActivityLog` and `ErrorLog`.
2. **Extensions → Apps Script**, delete the default `Code.gs`, create six
   files matching `googleAppsScript/`, paste each in. Then check the em dash
   and curly apostrophe in the discount subject survived the paste.
3. **Optional Script Properties:** `SPREADSHEET_ID` (only for a standalone
   script), `OWNER_EMAIL` (to change Mary's address without a code edit).
4. **Run all three test functions** after setting `TEST_EMAIL`:
   `testDiscountSignup`, `testCommissionInquiry`, `testRoutingRefusal`.
   Verify both sheets, all four emails, and that neither funnel touched the
   other. Delete the test rows afterwards.
5. **Deploy → New deployment → Web app**, **Execute as: Me**, **Who has
   access: Anyone**. Copy the `/exec` URL.
6. **Paste it into `offerEndpointUrl`** in `js/siteJS.js` (§11).
7. **Commit and push**, then run the final live end-to-end test for both
   paths in README Step 6.

Gmail sending limits apply: roughly 100 recipients/day on a consumer
account, 1,500 on Workspace. **Each submission now sends two emails.**


---

## 15. Footer Content Corrections (2026-09-06)

Four targeted fixes, all owner-requested from a live screenshot review:

1. **Footer contact email → `paddlecreekpaints@gmail.com`.** Scoped
   deliberately to the single `mailto:` link inside the actual `<footer>`
   element (the "Get in touch" list). **Not** changed: the commission
   section's "write to me directly" link and the Apps Script backend's
   `BUSINESS.studioEmail` / the frontend's `STUDIO_EMAIL` constant, both
   still `hello@paddlecreekpaints.com`. This was a deliberate scope
   decision, not an oversight — see the open item in §16.
2. **`Serving the KY / OH / WV tri-state`** — `.footerPlain` gained
   `white-space: nowrap`. Verified at all 9 tested widths (1920→320px):
   stays on one line, causes no horizontal overflow (the mobile breakpoint
   already gives "Get in touch" the full footer width via
   `.footerNavGroup:last-child { grid-column: span 2; }`, so there was
   always room).
3. **`.devCreditMark`** — `height: 2.1rem` → `4.375rem` (70px).
4. **`.devCreditLabel`** — `font-size: 0.82rem` → `1.05rem`, so "Developed
   by" doesn't read as an afterthought next to a mark now more than twice
   its previous size.

32 Playwright assertions, all passing, including a check that the
commission section's `hello@` link was left untouched by the footer-only
scoping.

---

## 16. Legal / Privacy / Analytics Readiness (2026-09-06)

**Status: prepared and locally verified. Analytics is wired but inert — no
tracking ID has been supplied, so nothing is currently being sent to Google
or Microsoft. Nothing deployed, nothing committed.**

### 16.1 New pages

Three new standalone pages, sharing the site's exact header, footer, and
full-screen mobile nav (verified to open/close correctly on all three, same
as the homepage):

| Page | Purpose |
|---|---|
| `privacyPolicy.html` | Full disclosure of both forms' data flows, GA4, Clarity, Apps Script/Sheets, GitHub Pages, and the unsubscribe gap (§16.4) |
| `termsOfUse.html` | Content ownership, catalogue/commission are not binding until confirmed, no-warranty, Kentucky governing law |
| `doNotSell.html` | States plainly that PCP does not sell or share personal information for cross-context behavioral advertising, and why |

All three: `<meta name="robots" content="noindex, follow">` (not yet meant
to rank — they exist to be linked to and read, not indexed), their own
canonical URL, and a `.legalArticle` prose layout built from the site's
existing type scale (`.sectionHeading`, `--fontDisplay`/`--fontBody`,
`.linkPainted`) — new CSS added to `stylePages.css` under a "LEGAL PAGES"
banner, but no new visual language invented. Footer legal links (`Privacy
Policy · Terms of Use · Do Not Sell or Share My Personal Information`) were
added to `index.html`'s footer **and** each legal page's own footer, via a
new `.footerLegalLinks` nav sitting between the copyright line and the dev
credit.

### 16.2 Discount signup — marketing consent disclosure

The 10% offer is confirmed as an email-list acquisition funnel, not just a
one-time code delivery. A `.formDisclosure` paragraph now sits directly
beneath the **Claim My 10% Off** button (after the CTA, before the status
line — never buried only in the Privacy Policy):

> By claiming your 10% off, you agree to receive your discount and
> occasional emails from Paddle Creek Paints about new pieces, custom work,
> and special offers. You can unsubscribe at any time. See our
> [Privacy Policy](privacyPolicy.html).

- Visually secondary: `0.78rem` vs. the `1rem` body base — smaller and
  quieter than the surrounding copy, but not so small it fails readability
  (verified as a real, rendered, legible element, not `display:none`
  fine-print theater).
- **No checkbox was added.** Determination, not an oversight: this is a
  disclosed, unchecked statement adjacent to the action, which CAN-SPAM
  (the applicable US law for a Kentucky-based business with no stated EU/UK
  marketing intent) does not require to be opt-in via checkbox — only that
  it be clearly disclosed and that opt-outs be honored. **This is not legal
  advice** — flagged for the owner in §16.5 if extra-cautious opt-in is
  wanted regardless (e.g. anticipating non-US visitors).
- **The commission form was deliberately left untouched** — no disclosure,
  no checkbox. Submitting it does not add anyone to DiscountLeads and does
  not constitute marketing consent — asserted directly by test, not just by
  omission.

### 16.3 Analytics — Google Analytics 4 + Microsoft Clarity

New file: **`js/analyticsConfig.js`**, loaded on every page (`index.html`
and all three legal pages) right before `js/siteJS.js`. One config object,
same inert-until-configured pattern as `paddleCreekConfig.offerEndpointUrl`:

```javascript
const paddleCreekAnalyticsConfig = {

    ga4MeasurementId: '',      // e.g. 'G-XXXXXXXXXX'

    clarityProjectId: ''       // e.g. 'abcd1234ef'

};
```

Both `ga4MeasurementId` and `clarityProjectId` are **blank**. No placeholder
or example ID was ever put in the working config — `''` is the only value
either field has held. `loadGoogleAnalytics`/`loadMicrosoftClarity` check
for a non-empty string before doing anything; with a blank ID, **no script
tag is inserted into the page at all** — verified by Playwright watching
actual network requests: zero requests to `googletagmanager.com`,
`google-analytics.com`, or `clarity.ms` fire on any page as currently
configured, and `window.dataLayer`/`window.clarity` are never created. A
second test proves the wiring genuinely works — feeding the loader a fake
ID via request interception (never a real network call) confirms the
correct script IS requested with that exact ID, so the only reason nothing
fires today is the blank config, not broken code.

**No cookie-consent banner or gate was added.** Determination, not an
oversight: GA4 is configured with no advertising features, ad
personalization, or Google Signals — plain usage analytics only — and
Microsoft Clarity is a usage/heatmap tool, not an ad platform. For a
Kentucky-based small business with no stated EU/UK targeting, a blocking
consent gate is not a legal requirement this implementation triggers, and
the brief explicitly asked for lightweight pages, not a compliance
apparatus disproportionate to the site's actual scope. What **was**
implemented instead: full, honest disclosure in the Privacy Policy of what
each tool collects, that both use cookies, and concrete opt-out paths
(browser cookie settings, Google's official opt-out browser add-on,
Clarity's own cookie documentation). **This determination is not legal
advice** — see §16.5.

Script placement: end of `<body>`, immediately before `siteJS.js`, matching
this project's existing pattern of not render-blocking `<head>` (the
previous session's Lighthouse work specifically flagged render-blocking
requests). Since both IDs are currently blank this has zero present
performance effect either way; noted here so a future session doesn't treat
the placement as an oversight if `<head>`-loading is later preferred for
earliest-possible pageview capture.

### 16.4 The unsubscribe mechanism — a real, flagged gap

The disclosure and the Privacy Policy both say "you can unsubscribe at any
time." As of this session, that promise is **honored manually, not
automatically**:

- No automated one-click unsubscribe link exists in the discount welcome
  email (`googleAppsScript/NotificationService.gs` was **not modified** in
  this session — analytics/legal work only).
- No suppression-list or opted-out flag exists in `DiscountLeads`.
- A removal request today means: the visitor replies to an email or writes
  to `paddlecreekpaints@gmail.com`, and Mary manually deletes or flags the
  row.

This is disclosed plainly in the Privacy Policy itself (§16.1) rather than
silently assumed to be automatic. **Before any recurring marketing
campaign is sent from `DiscountLeads`** — as opposed to the one existing
one-time welcome/discount-code email, which is not a marketing campaign —
a real, low-friction opt-out path should exist: either a mailto-based
"reply UNSUBSCRIBE" convention Mary commits to checking promptly, or (more
robust) an Apps Script `doGet` route plus a one-click link embedded in
future campaign emails that flips a suppression flag or removes the row.
Building that automated path was **not** in scope for this session and is
not yet built — recorded here so it isn't mistaken for already-solved.

### 16.5 Decisions requiring owner confirmation

None of the following block what was built, but all affect what should
happen before real marketing emails are sent or before treating any part
of this as settled legal compliance:

1. **Email consistency.** The footer's public contact is now
   `paddlecreekpaints@gmail.com`; the Apps Script's customer-facing
   `replyTo` (discount welcome, commission acknowledgement) and the
   commission section's direct-write link are still `hello@paddlecreekpaints.com`.
   If both addresses are actively monitored this is harmless, but if
   `hello@` is not checked, a customer replying to "unsubscribe" or a
   commission inquiry could land in an unread inbox. Recommend confirming
   which address(es) are real and unifying if only one is.
2. **This is not legal advice.** The Privacy Policy, Terms of Use, Do Not
   Sell page, the no-checkbox determination, and the no-consent-banner
   determination were all written using general, publicly known principles
   (CAN-SPAM's disclosed-and-honored standard, CCPA/CPRA's sale/share
   definitions) applied to the facts of this specific, small, single-state
   business. An actual attorney should review before this is relied on for
   a business with real legal exposure, especially if the audience is
   expected to include EU/UK/California traffic at meaningful volume.
3. **GA4 and Clarity real IDs.** Both are blank by design (§16.3). Nothing
   further is needed on the code side to activate either — paste the real
   ID into `js/analyticsConfig.js` and it starts working, per the file's
   own header comment.
4. **The unsubscribe mechanism** (§16.4) should be built before any
   marketing send beyond the existing one-time welcome email.
5. **Opt-in checkbox reconsideration** (§16.2) if the owner wants
   extra-cautious consent regardless of the CAN-SPAM determination.

### 16.6 Files changed/created this session

```
privacyPolicy.html                           new — full Privacy Policy
termsOfUse.html                              new — Terms of Use
doNotSell.html                               new — Do Not Sell or Share
js/analyticsConfig.js                        new — GA4 + Clarity loader, both IDs blank
index.html                                   footer legal links, discount disclosure, analyticsConfig.js <script> tag, footer email/tri-state fixes (§15)
css/styleIndex.css                           .footerLegalLinks, devCredit resize, footerPlain nowrap, aboutFigure img 4/5 follow-up
css/stylePages.css                           .formDisclosure, LEGAL PAGES article layout (new banner section)
```

`googleAppsScript/` was **not modified** in this session.

### 16.7 Verification

**73 new Playwright assertions** (`legal.js`), all passing:
- Analytics loader fires zero network requests with blank IDs, but is
  proven to fire correctly given a real one (request interception).
- Disclosure text matches the required copy elements (discount, occasional
  marketing email, new pieces/custom work/special offers, unsubscribe,
  Privacy Policy link), contains no SMS/phone language, no checkbox added.
- Commission form confirmed to carry no disclosure and no checkbox.
- All three legal pages: no console/page errors, no failed requests, shared
  header/footer/nav present, mobile full-screen nav opens correctly, back
  link resolves, canonical URL correct, cross-links between the three pages
  resolve.
- Privacy Policy text checked for the required distinctions (DiscountLeads
  vs. CommissionLeads, GA4, Clarity, Apps Script, GitHub Pages), the
  explicit "commission does not sign you up for marketing" statement, the
  "no advertising features enabled" statement, and the honest manual-
  unsubscribe disclosure — plus a check that no fabricated GA4-shaped ID
  string appears anywhere in the rendered text.

Combined with the existing suites, **671 total assertions pass** across all
seven harnesses (backend, frontend core, funnels, mobile nav, artist photo,
footer fixes, legal/analytics).
