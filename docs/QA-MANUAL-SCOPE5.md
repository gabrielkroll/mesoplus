# Meso+ Scope 5 Manual QA

Run this script on `https://mesoplus.openorbit.studio`.

## Acceptance Checklist

- [ ] Supabase client fires before any localStorage read in `index.html`.
- [ ] New user can sign up with email + password on the production URL.
- [ ] Existing user can log in and their migrated data is there.
- [ ] Data persists across sessions and devices.
- [ ] User can log out cleanly with no stale data visible after logout.
- [ ] Migration verified: 6 edge-case sessions spot-checked.
- [ ] One user cannot see another user's data.
- [ ] Error states tell the user what went wrong and what to do next.
- [ ] No regressions in logging tab, progress tab, or session flow.
- [ ] Sheets connection removed from the app.

For each section, note any browser console errors: F12 -> Console.

## A - Golden Path Under 60 Seconds

1. Open `https://mesoplus.openorbit.studio` in a fresh private/incognito window.
2. Sign up as a new user with a test email.
3. Log a gym session with at least 2 exercises and fill in readiness metrics.
4. Close the browser completely.
5. Reopen `https://mesoplus.openorbit.studio` and log in with the same credentials.
6. Verify the session is there with the correct exercises, sets, and weights.

Result:
- [ ] Pass
- [ ] Console errors noted:

## B - Cross-Device Persistence

1. Open `https://mesoplus.openorbit.studio` on a second device or browser profile.
2. Log in with the same test account from section A.
3. Verify the same session data is visible.

Result:
- [ ] Pass
- [ ] Console errors noted:

## C - Two-User RLS Isolation

1. Open a second private/incognito window.
2. Sign up as a second user with a different test email.
3. Log a different session as user B.
4. Verify user B cannot see user A's sessions.
5. Return to user A and verify user A cannot see user B's sessions.

Result:
- [ ] Pass
- [ ] Console errors noted:

## D - Migration Spot-Check

Log in as Gabriel's real account. Manually verify these 6 sessions exist with correct data:

- [ ] 1 BJJ session: check positions, notes, and partner fields.
- [ ] 1 session with a flagged exercise: check flagged state persisted.
- [ ] 1 session with notes: check notes field.
- [ ] 1 session with a superset containing 4+ exercises.
- [ ] 1 rest day entry.
- [ ] 1 extra-long session: check all sets and exercises are present.

For each checked session, open the Supabase dashboard and confirm the `profile_id` column matches Gabriel's auth UID.

Result:
- [ ] Pass
- [ ] Console errors noted:

## E - Error States

1. Try logging in with a wrong password. Verify the message names the problem and says what to do.
2. Try signing up with an already-used email. Verify the message is clear.
3. Optional: disconnect wifi and try to log in. Verify the timeout message is informative.

Result:
- [ ] Pass
- [ ] Console errors noted:

## F - Regression Sweep

Log in as Gabriel's real account and navigate through:

1. Logging tab: add a new session entry, save it, and verify it persists after refresh.
2. Progress tab: verify historical data displays correctly.
3. Session flow: complete a full gym session from readiness to exercises to save.

Result:
- [ ] Pass
- [ ] Console errors noted:

## G - Logout

1. Log out.
2. Verify the app shows the login screen.
3. Verify there is no trace of the previous user's data.

Result:
- [ ] Pass
- [ ] Console errors noted:
