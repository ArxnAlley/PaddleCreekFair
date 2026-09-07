# Paddle Creek Paints Backend — Google Apps Script Setup & Deployment Guide

This folder contains the complete server-side code behind **both** website
forms. The code lives here so it can be copied into the Google Apps Script
editor. **Nothing in this folder runs from the website's hosting** — GitHub
Pages serves static files only.

**Not deployed yet.** Everything below is the manual setup still to be done,
in the owner's Google account, once both workflows are signed off.

---

## Two funnels, one deployment

There is **ONE** Apps Script Web App and **ONE** `/exec` URL. Every request
declares a `submissionType`, and the script routes on it. A request that does
not say what it is gets refused rather than guessed at.

```
                          ┌─ submissionType: "discountSignup" ─┐
                          │                                    │
Website  ──POST──►  ONE /exec  ──►  DiscountLeads sheet
                          │         ├─► customer: welcome email (carries PADDLE10)
                          │         └─► Mary: "new 10% signup" alert
                          │
                          └─ submissionType: "commissionInquiry" ─┐
                                    │
                                    ├──►  CommissionLeads sheet
                                    ├─► customer: inquiry acknowledgement (NO code)
                                    └─► Mary: full inquiry detail
```

**The two funnels never touch each other.** A commission inquiry never writes
to DiscountLeads and never earns PADDLE10. A discount signup never creates a
CommissionLeads row. The Google Sheet is the durable record for both — the
notification emails are a convenience, never the system of record.

---

## What Each File Does

| File | Purpose |
| --- | --- |
| `Code.gs` | `doGet`, `doPost`, the routing switch, both funnel handlers, request parsing, and three test functions |
| `Config.gs` | Submission types, sheet names, both header contracts, the discount code, business facts, owner address, subjects, limits |
| `Validation.gs` | Shared sanitizers + `validateDiscountPayload` / `validateCommissionPayload`, formula neutralisation, honeypot, routing resolution |
| `SheetService.gs` | Generic sheet helpers, case-insensitive duplicate lookup, both writers, inquiry IDs, activity/error logging |
| `NotificationService.gs` | All four emails, shared send/retry/escaping helpers |
| `ResponseService.gs` | JSON responses (deliberately **never** containing the discount code) |

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create **one** new
   spreadsheet. Both funnels share it, as separate tabs.
2. Name it something like `Paddle Creek Paints — Leads`.
3. You do **not** need to create any tabs or headers. The script creates
   `DiscountLeads`, `CommissionLeads`, `ActivityLog` and `ErrorLog` and their
   header rows automatically on first use.

### The two tabs

**`DiscountLeads`** — three columns, and that is the whole contract:

`Email · Signup Date · Discount Code`

**`CommissionLeads`** — the real fields from the Start a Piece form:

`Inquiry ID · Submitted At · Name · Email · Surface · What To Paint · Occasion · Referenced Piece · Source`

## Step 2 — Create the Apps Script Project

1. In the spreadsheet, open **Extensions → Apps Script**. (Binding the script
   to the spreadsheet means no spreadsheet ID configuration is needed.)
2. Delete the default `Code.gs` content.
3. Create six script files matching the names in this folder
   (**+ → Script**), and paste each file's contents in:
   - `Code.gs`
   - `Config.gs`
   - `Validation.gs`
   - `SheetService.gs`
   - `NotificationService.gs`
   - `ResponseService.gs`
4. Save the project (name it `Paddle Creek Paints Backend`).

**After pasting `Config.gs`, check one line.** The discount subject contains
an em dash and a curly apostrophe:

```javascript
discountCustomer: 'Welcome to Paddle Creek Paints — here’s your 10% off!',
```

If either character arrives as `?`, `â€"` or similar, retype it in the editor.

### Configuration

Nothing is required — the defaults work for a bound script. Two optional
**Script Properties** (Project Settings → Script Properties) are available:

| Property | Effect |
| --- | --- |
| `SPREADSHEET_ID` | Point a *standalone* (unbound) script at the spreadsheet. The long ID from the sheet URL: `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit` |
| `OWNER_EMAIL` | Override where Mary's notifications go, without editing code |

Mary's notifications default to **`paddlecreekpaints@gmail.com`**
(`DEFAULT_OWNER_EMAIL` in `Config.gs`). Customer emails are sent with a
reply-to of `paddlecreekpaints@gmail.com`, the public studio address
(`BUSINESS.studioEmail` in `Config.gs`) — the same confirmed inbox as
`DEFAULT_OWNER_EMAIL`, kept as a separate constant so either can be
overridden independently later.

## Step 3 — Test BOTH submission types

Set `TEST_EMAIL` at the bottom of `Code.gs` from
`PUT_A_REAL_MAILBOX_HERE@example.com` to a mailbox you can actually open.
Then run each function from the editor dropdown, approving the authorization
prompts the first time (the script needs your spreadsheet, and permission to
send email as you).

### 3a. `testDiscountSignup`

Execution log shows three JSON lines:

- **New signup** — `"success": true`, `"alreadySignedUp": false`.
- **Repeat signup** (the same address in capitals) — `"success": true`,
  `"alreadySignedUp": true`.
- **Invalid address** — `"success": false`.

Then check:

- `DiscountLeads` has **exactly one** row, with `PADDLE10` in column 3.
- The test mailbox has **two** emails titled
  *Welcome to Paddle Creek Paints — here's your 10% off!*; the second opens
  with "You are already on the list…".
- `paddlecreekpaints@gmail.com` has **one** *New 10% signup* alert. (A repeat
  signup deliberately does **not** re-alert Mary.)
- **No** `CommissionLeads` row was created.
- No JSON line anywhere contains `PADDLE10` — the code travels by email only.

### 3b. `testCommissionInquiry`

Execution log shows two JSON lines: a success carrying an `inquiryId` like
`PCP-0001`, and a rejection for the incomplete inquiry.

Then check:

- `CommissionLeads` has **one** new row with all nine columns filled.
- The test mailbox has **one** email titled *Thank you for your custom piece
  inquiry — Paddle Creek Paints*, and it does **not** mention `PADDLE10`.
- `paddlecreekpaints@gmail.com` has **one** *New commission inquiry* email
  containing the name, email, surface, what to paint, occasion and piece.
- **No** new `DiscountLeads` row, and **no** discount email.

### 3c. `testRoutingRefusal`

Both lines must be `"success": false`. A payload with no `submissionType`, or
an unrecognised one, is refused outright and writes nothing.

### Clean up

Delete the test rows from both tabs (leave the header rows) and set
`TEST_EMAIL` back to the placeholder.

## Step 4 — Deploy as a Web App

1. **Deploy → New deployment**.
2. Gear icon → **Web app**.
3. Configure:
   - **Description:** `Paddle Creek Paints endpoint`
   - **Execute as:** `Me` *(required — visitors must not need Google
     accounts, and both customer emails and Mary's notifications are sent
     from your account)*
   - **Who has access:** `Anyone` *(required — the forms post anonymously)*
4. **Deploy**, and authorize.
5. Copy the **Web app URL**. It ends in `/exec`.

> "Anyone" access only allows submitting a POST request. Responses never
> include spreadsheet contents, other people's details, the spreadsheet ID,
> or the discount code.

## Step 5 — Put the /exec URL in the website

Open `js/siteJS.js` and find the block near the top of the file under the
`SITE CONFIGURATION` banner:

```javascript
const paddleCreekConfig = {

    /* Paste the deployed Google Apps Script Web App URL here. */

    offerEndpointUrl: 'PASTE_DEPLOYED_APPS_SCRIPT_URL_HERE',
```

Replace the placeholder with the URL from Step 4:

```javascript
    offerEndpointUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec',
```

**That is the only website change required, and the only place in the whole
repository where the `/exec` URL belongs.** Both forms read it.

Until it is replaced, neither form pretends to work: the discount form says
it is not connected yet, and the commission form falls back to opening the
visitor's own mail client and says plainly that nothing was sent.

## Step 6 — Final end-to-end test on the live site

Commit, push, and wait for GitHub Pages to publish. Then, on the real site:

**Discount path**
1. Scroll to *Get 10% Off Your First Custom Piece* (or tap **Claim My 10%
   Off** in the hero).
2. Enter a real address and submit.
3. The page should say *"You're in! Check your email…"* and must **never**
   show `PADDLE10`.
4. The welcome email arrives with the code; Mary gets her alert; one row
   appears in `DiscountLeads`.
5. Submit the **same address again in different capitals** — the email
   arrives a second time, and `DiscountLeads` still holds **one** row.

**Commission path**
1. Tap a catalogue piece, then **Ask about this piece** (or **Start a
   piece**).
2. Fill in the form and submit.
3. The page should confirm the inquiry is with Mary.
4. The acknowledgement email arrives **without** `PADDLE10`; Mary gets the
   full detail; one row appears in `CommissionLeads`.
5. Confirm **no** `DiscountLeads` row was created by this.

---

## Updating the Code Later

Apps Script Web Apps are versioned. After editing code, choose
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
The URL stays the same, so the website never needs to change.

## Changing the Discount Code

The code is assigned server-side in one place — `DISCOUNT_CODE` in
`Config.gs`. Change it there and redeploy; the website never sends, stores or
displays a code, so nothing on the site needs editing.

Existing rows keep the code they were issued. Editing that column in the
sheet is the way to bring old rows forward.

## How Duplicates Are Handled

**DiscountLeads** — addresses are lower-cased and trimmed before they are
compared and before they are stored, so `Mary@Example.com`,
`mary@example.com` and `  MARY@EXAMPLE.COM  ` are one person and one row. A
returning address never creates a second row; it **does** get the welcome
email again, with slightly different opening wording, so someone who lost
the first email can simply ask again. Mary is not re-alerted for a repeat.

Rows typed into the sheet by hand are matched too — the comparison
lower-cases both sides rather than trusting the stored value. If such a row
has an empty Discount Code cell, it is filled in the first time that address
signs up through the form.

**CommissionLeads** — deliberately **not** de-duplicated. Someone asking
about a second piece is a second inquiry, and two people can legitimately
share a mailbox.

All writes run inside `LockService.getScriptLock()`. Emails are sent *after*
the lock is released, so mail delivery never holds up another visitor.

## What Happens When Something Fails

| Failure | Behaviour |
| --- | --- |
| Missing/unknown `submissionType` | Refused. Nothing written, nothing sent. |
| Honeypot filled | Nothing written, nothing sent, success returned. The bot learns nothing. |
| Invalid input | Rejected before any write. The visitor sees the reason. |
| Sheet write fails | Error response, logged to `ErrorLog`. No email sent. |
| Email fails | The row is already saved, so the submission is **not** lost. Logged, retried once as plain text, and the response reports `emailSent: false` so the page can say so honestly. |
| Logging fails | Swallowed. Logging can never break a submission. |

## Privacy Note

`DiscountLeads` is a list of email addresses given in exchange for a discount
code. It is not a mailing list those people agreed to, and the welcome email
is the only message this system sends them. Emailing that list for anything
else is a separate decision.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Site says "The discount signup is not connected yet" | The placeholder in `paddleCreekConfig.offerEndpointUrl` was never replaced (Step 5) |
| Commission form opens a mail client instead of submitting | Same cause — the endpoint is still unconfigured |
| Browser console shows a CORS error | Redeploy with **Who has access: Anyone**; make sure you copied the `/exec` URL, not `/dev` |
| `"Unrecognised submission type."` | The site and the script are out of step — redeploy the script from the current files |
| `No spreadsheet configured` in `ErrorLog` | The script is standalone and `SPREADSHEET_ID` is missing (Step 2) |
| Rows appear but no email arrives | Check `ErrorLog`, then the Gmail sending quota (roughly 100 recipients/day on a consumer account, 1,500 on Workspace). Each submission sends **two** emails. |
| Mary is not getting notifications | Check `OWNER_EMAIL` if set, otherwise `DEFAULT_OWNER_EMAIL` in `Config.gs`; check spam |
| Subject shows `â€"` instead of `—` | The em dash was mangled when `Config.gs` was pasted; retype it (Step 2) |
| Same address created two DiscountLeads rows | Only possible if one was typed in by hand with stray characters. The form path cannot do it. |
