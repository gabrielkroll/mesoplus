# Codex Handoff — Supabase Auth Foundation Scope 5: End-to-end QA

## The guardrail — read this first

**Claude owns all decisions. Codex owns execution only.**

If you discover any mismatch between this spec and what you find in the code — a schema conflict, an RLS gap, a data mapping issue, anything unexpected — **stop immediately and surface it to Claude/Gabriel**. Do not self-improve. Do not make judgment calls on architecture. Do not add anything not listed here. All decisions come back to Claude first.

This is not a revolving door. We designed this carefully and do not want improvisation.

---

## What this scope delivers

All seven pitch Delivers verified — the app works identically to before, backed entirely by Supabase, with the Sheets connection removed.

**Appetite:** 1 day. If anything blocks you for more than 30 minutes, stop and surface it.

---

## Acceptance criteria

- [ ] Supabase client fires before any localStorage read in `index.html` (no race condition)
- [ ] New user can sign up with email + password on the production URL
- [ ] Existing user can log in and their migrated data is there
- [ ] Data persists across sessions and devices (verified on two different browsers/devices)
- [ ] User can log out cleanly — no stale data visible after logout
- [ ] Migration verified: 6 edge-case sessions spot-checked (1 BJJ, 1 flagged exercise, 1 with notes, 1 multi-superset with 4+ exercises, 1 rest day, 1 extra-long session)
- [ ] One user cannot see another user's data — verified with two real Supabase accounts
- [ ] Error states tell the user what went wrong AND what to do next (not just "Invalid credentials")
- [ ] No regressions in logging tab, progress tab, or session flow
- [ ] Sheets connection removed from the app

---

## Two-invocation model

This handover runs in **two separate Codex sessions** due to the manual QA gate in Step 6.

- **Invocation 1 (Steps 1–5):** Code checks + generate manual test script. Stop at Step 6.
- **Invocation 2 (Steps 7–8):** Sheets removal + commit. Only after Gabriel confirms manual tests pass.

Do not attempt to run both in one session.

---

## Execution steps — in order

### 1. Code check — Supabase init order

Open `index.html`. The Supabase client is initialized at approximately line 1818 (`supabase.createClient(...)`). The `init()` function which reads localStorage runs later (approximately line 2141).

Verify: `supabase.createClient(...)` still appears **before** the `init()` call and before any `localStorage.getItem(...)` call in the file.

**Pass:** `createClient` line number is lower than any `localStorage.getItem` or `init()` call.
**Fail:** Surface to Claude immediately. Do not proceed.

### 2. Code check — RLS policy verification

Read the Supabase RLS policies from `docs/schema.sql` (or wherever the schema is defined).

The authoritative source is the **live Supabase dashboard** (not `docs/schema.sql` — that file may be outdated). Check the dashboard at: `https://supabase.com/dashboard/project/tztpbyyqzmgkinfvzbmv/auth/policies`.

Verify:
- Every table that stores user data (`sessions`, `activities`, `supersets`, `exercises`, `bjj_sessions`, `profiles`) has RLS enabled
- The `SELECT` policy on each table restricts rows to `auth.uid() = user_id` or `auth.uid() = profile_id`
- The `INSERT` policy enforces the same
- No table has a policy that allows reading all rows without a user filter

**Pass:** All user-data tables have restrictive RLS in the dashboard.
**Fail:** List exactly which tables or policies are missing or wrong. Surface to Claude immediately. Do not proceed.

### 3. Code check — Error state messages

Search `index.html` for Supabase auth error handling (look for `error.message`, auth error callbacks, or catch blocks around `supabase.auth.signIn` / `supabase.auth.signUp`).

Verify each error path shows a message that:
- Names what went wrong (not just a generic error)
- Tells the user what to do next

**Pass criteria — each error path must show a message that names the problem and the action:**
- Wrong password → something like "Incorrect password. Try again or reset your password." (not "Invalid credentials" or "Error")
- Unverified email → something like "Please verify your email before logging in. Check your inbox." (not a generic auth error)
- Network timeout → something like "Connection failed. Check your internet and try again." (not a silent failure or spinner freeze)

**Fail:** List which error paths are missing or show generic messages. Surface to Claude. Do not write new message copy — surface only.

### 4. Code check — Migration user_id mapping

The migration runs in-app. Search `index.html` for `[supabase migration]` (around line 3026). Also search for `profile_id` assignments in the migration flow.

In `index.html`, search for `authSession` — this is the variable holding the current Supabase session object. It is set via `supabase.auth.getSession()` or an auth state change listener.

Verify:
- `profile_id` in all Supabase upsert calls inside the migration block is set from `authSession.user.id` (not a hardcoded UUID, not `null`, not a placeholder)
- If the variable name differs from `authSession`, trace it back to the `supabase.auth` call to confirm it is the live authenticated user

**Pass:** Every `profile_id` upsert in the migration uses the live auth user's ID.
**Fail:** Surface to Claude immediately. Do not fix.

### 5. Generate manual test script

Write a file `docs/QA-MANUAL-SCOPE5.md` with a step-by-step manual test script for Gabriel to run in the browser.

The script must cover these flows **in this order**, on `https://mesoplus.openorbit.studio`:

**A — Golden path (under 60 seconds)**
1. Open the URL in a fresh private/incognito window
2. Sign up as a new user (use a test email)
3. Log a gym session — at least 2 exercises, fill in readiness metrics
4. Close the browser completely
5. Reopen the URL, log in with the same credentials
6. Verify the session is there — correct exercises, sets, weights

**B — Cross-device persistence**
1. Open the URL on a second device or browser profile
2. Log in with the same test account
3. Verify the same session data is visible

**C — Two-user RLS isolation**
1. Open a second private/incognito window
2. Sign up as a second user (different test email)
3. Log a different session as user B
4. Verify user B cannot see user A's sessions and vice versa

**D — Migration spot-check**
Log in as Gabriel's real account. Manually verify these 6 sessions exist with correct data:
- 1 BJJ session (check positions, notes, partner fields)
- 1 session with a flagged exercise (check flagged state persisted)
- 1 session with notes (check notes field)
- 1 session with a superset containing 4+ exercises
- 1 rest day entry
- 1 extra-long session (check all sets and exercises present)
For each: open Supabase dashboard and confirm the `user_id` column matches Gabriel's auth UID.

**E — Error states**
1. Try logging in with a wrong password — verify message names the problem and says what to do
2. Try signing up with an already-used email — verify message is clear
3. (Optional) Disconnect wifi and try to log in — verify timeout message is informative

**F — Regression sweep**
Log in as Gabriel's real account. Navigate through:
- Logging tab: add a new session entry, save it, verify it persists after refresh
- Progress tab: verify historical data displays correctly
- Session flow: complete a full gym session from readiness → exercises → save

Each section: note any errors in browser console (F12 → Console).

**G — Logout**
Log out. Verify the app shows the login screen with no trace of the previous user's data.

Include a simple checklist at the top of `docs/QA-MANUAL-SCOPE5.md` matching the AC above so Gabriel can tick off each item as he goes.

### 6. Stop — wait for Gabriel to confirm manual tests

After writing `docs/QA-MANUAL-SCOPE5.md`, **stop completely**.

Surface to Claude/Gabriel: "Manual test script is ready at docs/QA-MANUAL-SCOPE5.md. Run through it and confirm all items pass before I proceed to Sheets removal."

**Do not proceed to step 7 until Gabriel explicitly replies that all manual AC pass.** The Sheets removal is a one-way door — there is no undo.

### 7. Remove Sheets connection from `index.html`

Only run this step after Gabriel confirms all manual tests pass.

In `index.html`, remove **only** the following — nothing else:

**Functions to remove:**
- `syncDayToSheets(date)` — around line 2787
- `appendRows(rows)` — around line 3198
- `deleteFromSheets(date)` — search for it
- `markSynced(date)` — around line 2739
- The `_synced` Set and its localStorage read (`mp7_synced`) — around line 2738
- The debounced sync timer (`_syncTimer`, `setTimeout syncDayToSheets`) — around line 2784

**State fields to remove from `S` object (line ~2061):**
- `apiKey: ''`
- `sheetId: ''`
- `sheetTab: 'Workout_Log'`
- `scriptUrl: ''`

**localStorage keys to remove** (reads and writes):
- `mp7_k` (apiKey)
- `mp7_s` (sheetId)
- `mp7_t` (sheetTab)
- `mp7_su` (scriptUrl)
- `mp7_synced` (sync state)

**Settings UI to remove:**
- The input element with id `s-key` and its label only
- The input element with id `s-id` and its label only
- The input element with id `s-tab` and its label only
- The input element with id `s-script` and its label only
- Any button whose sole purpose is saving these four fields — **only if it does not also save other non-Sheets settings**. If the save button is shared with other settings fields, do not remove it. Surface to Claude instead.

**Do not remove anything else.** If you are unsure whether a piece of code is Sheets-related or serves another purpose, surface it to Claude. Do not guess.

After removal: start the local server (`python3 -m http.server 3001`) and open `http://localhost:3001`. Then:
1. Open browser console (F12 → Console) — zero errors is required
2. Log in and save a session — verify the save completes without a Supabase error in the console
3. Confirm the session appears after a page refresh

All three must pass. If any fail, surface to Claude before committing.

### 8. Commit

```bash
git add index.html docs/QA-MANUAL-SCOPE5.md
git commit -m "feat(P1): Scope 5 complete — E2E QA passed, Sheets connection removed"
```

Do not push. Gabriel pushes after final review.
