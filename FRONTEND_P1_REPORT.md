# Kopa-Padi frontend P1 stabilization

Date: 14 October 2026. Repository: `C:/coding_stuff/kopa-padi-web/kopa-padi-web`.

## Changes delivered

- Map `state` parameters resolve to actual API State IDs, including case variations and FCT/Abuja aliases. They prefill departure context only. No map or location parameter selects a destination camp.
- Explicit `originStateId`, `originLgaId`, and optional `originTownId` parameters are validated against API options. LGA options are fetched under the selected State; Town options under the selected LGA. Invalid, duplicate, oversized, or unknown parameters are ignored safely.
- The active Travel Plan is fetched before handoff data is applied. An existing plan keeps its original origin, destination, schedule, and preferences. Unverified users continue to see the verification gate.
- `/locations` reads the selected State, preserves the State/LGA/optional Town flow, and exposes **Continue to Travel Plan** after confirmation. The link carries validated IDs in the URL, so the handoff also survives a reload.
- Native select options are loaded before initializing a full handoff. Browser testing caught and fixed an initialization regression that otherwise cleared the LGA/Town selections.
- Camp previews follow the selected form value while editing and appear in the route, review, and active-plan views. They show the API camp name, State, official address or a clear missing-address fallback, and ACTIVE/TEMPORARY status. No camp details are generated or inferred.
- Failed plan lookups show a retry state rather than an empty creation form. Stale asynchronous loads cannot replace a newer URL load.
- Shared mobile application/admin menus replace inactive menu controls. Menus support native keyboard operation, Escape, and closing after navigation.
- Desktop page search now provides links to real application screens. Inactive notification icons become clearly labelled links to Circle messages or operational status, without fake notification badges.
- Profile links point to `/profile`; verification labels point to `/verification`; journey sharing/contact/check-in tools point to `/journey`; concern reporting points to `/safety`. The geography admin's broken `/dashboard` return link now points to `/app`.
- Homepage/footer links now point to implemented pages or existing section anchors. The missing `/blog` route and empty `href="#"` links were removed. No legal policy or contact content was invented.
- The homepage trip preview now explicitly explains that entries are not saved or carried into the plan. The plan's former “Save and exit” action now says “Exit without saving.” Existing responsive layouts and brand styling were retained.

## Files changed for this task

All paths below are relative to this independent frontend repository.

| File | Purpose |
|---|---|
| `app/locations/page.tsx` | Suspense boundary for URL-backed departure UI |
| `app/travel-plans/page.tsx` | Suspense boundary for URL-backed plan UI |
| `lib/departure-context.ts` (new) | State-name/ID resolution, hierarchical validation, handoff URL |
| `components/location-selector.tsx` | State prefill, confirmed handoff, mobile menu |
| `components/travel-plan-manager.tsx` | Validated new-plan prefill, active-plan preservation, camp preview, retry/loading protection |
| `components/user-navigation.tsx` (new) | Functional shared mobile menus and desktop page search |
| `components/user-sidebar.tsx` | Accurate verification label/current state |
| `components/homepage.tsx` | Correct links, footer destinations, trip-preview wording, mobile menu Escape |
| `components/traveler-dashboard.tsx` | Desktop search/mobile menu, accurate safety links and footer |
| `components/circle-dashboard.tsx` | Desktop search/mobile menu and labelled message link |
| `components/journey-dashboard.tsx` | Desktop search/mobile menu, correct Profile route |
| `components/matching-status.tsx` | Mobile menu |
| `components/profile-dashboard.tsx` | Mobile menu/message link and functioning privacy-details anchor |
| `components/safety-center.tsx` | Mobile menu/message link and correct Profile route |
| `components/verification-flow.tsx` | Mobile menu and correct Profile/Verification navigation |
| `components/geography-admin.tsx` | Correct return-to-app route |
| `components/operations-dashboard.tsx` | Functional admin menu and Geography link |
| `components/safety-admin.tsx` | Functional admin menu, Geography link, operational/profile controls |
| `components/journey-guide-admin.tsx` | Functional admin menu |
| `tests/departure-context.test.mjs` (new) | Nine departure-resolution regression tests |
| `tests/navigation.test.mjs` (new) | Three route/placeholder/fragment regression tests |
| `tests/fixture-api.mjs` (new) | Isolated browser fixtures for verified, active-plan, and unverified states |
| `FRONTEND_P1_REPORT.md` (new) | Delivery and validation record |

Pre-existing local edits to `package.json`, `package-lock.json`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, and `.nvmrc` were preserved. Build/type-generation tools refresh generated type/cache files. No dependencies were added by this task. Next.js also generated its ignored agent guidance files during development.

## Regression evidence

### Automated tests

Command:

```powershell
node --experimental-strip-types --test tests/departure-context.test.mjs tests/navigation.test.mjs
```

**12 passed, zero failed.** Coverage includes case-insensitive State names, FCT aliases, invalid/duplicate/oversized/markup parameters, valid State/LGA/Town IDs, parent mismatch rejection, optional Town fallback, isolation from destination/schedule fields, handoff URLs, implemented static route links, placeholder removal, and homepage section anchors.

### Browser scenarios

These checks used the real frontend against the isolated local fixture API, with clearly synthetic camp/user/location data. No live API contract, real account, database, email, or matching rule was changed. No plan was submitted or cancelled during browser checks.

| Scenario | Result |
|---|---|
| Homepage Nigeria map → Travel Plan | Lagos prefilled as origin; verified camp remained the destination |
| `/locations?state=lAgOs` → confirmed State/LGA/Town → Travel Plan | All three validated IDs prefilled and survived reload |
| Invalid State/LGA/Town URL values | Unknown values ignored; no arbitrary option selected |
| FCT alias | Resolved to the API's Federal Capital Territory ID |
| Verified PCM without active plan | New-plan form displayed with valid departure context |
| Verified PCM with active plan | Both map-name and complete location-ID URLs preserved the existing FCT-origin plan |
| Active-plan editing | Existing origin remained intact; changing camp immediately changed preview |
| Unverified user | Verification-required screen displayed |
| Camp selection | ACTIVE camp showed its API address; TEMPORARY camp showed explicit address fallback |
| Wizard progression | Validated handoff passed the route step and persisted when returning from schedule |
| Desktop navigation, 1440px viewport | Page search filtered to My Trips and navigated to Travel Plan; real sidebar destinations visible |
| Mobile navigation, 390px viewport | Homepage menu opened/closed on navigation; application menu opened and closed with Escape; Profile destination correct |
| Responsive layout | Desktop/mobile screenshots inspected; mobile document did not overflow horizontally |

Screenshots are retained under the ignored `test-results/frontend-p1/` directory:

- `desktop-handoff.jpg`
- `mobile-handoff.jpg`
- `mobile-menu.jpg`

To repeat fixture browser checks, run `node tests/fixture-api.mjs`, then start Next.js on port 3100 with `NEXT_PUBLIC_API_URL=http://localhost:4081`. The fixture selector is `http://localhost:4081/__fixtures?mode=verified` (or `active` / `unverified`). The fixture API accepts no business writes and requires no database. Test servers were stopped after this run.

## Required builds

Runtime: Node.js 22.22.1 (the repository's existing runtime update).

| Command | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run build` | Passed; all 23 generated pages/routes completed |
| `npm run build:vinext` | Passed; all five build stages completed, exit code 0 |
| `git diff --check` | Passed |

## Remaining limits and known issues

- Browser regression checks used synthetic API fixtures. Live authentication/session integration and production API data still require staging validation.
- Real legal policies and a dedicated contact/help/blog service remain unimplemented. Misleading links were removed or replaced with existing FAQ/safety/profile destinations.
- Homepage trip preview fields intentionally do not persist as a draft; the UI now states that clearly. Canonical departure handoffs use the map/location flow.
- Existing API behavior, destination validation, and matching policy remain backend-owned and were not changed.
- A pre-existing Next.js development warning requests `data-scroll-behavior="smooth"` for route transitions; it did not block the inspected flows or builds.
- Vinext emits dependency-level ineffective-dynamic-import warnings and cannot classify some routes with its current static analysis. Its production build completed; Cloudflare deployment/runtime behavior was not exercised.

No commit, push, deployment, backend edit, database migration, or API-contract change was performed.
