# Clinic Stock Console

Internal stock console for a clinic's supplies team, built against the
[DummyJSON](https://dummyjson.com/docs) API as a stand-in for the clinic's
stock catalogue. Built for the Savannah Informatics Web Engineer take-home
assessment.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Sign in with any DummyJSON test user, e.g.
`emilys` / `emilyspass`.

Other scripts:

```bash
npm run format:check   # Prettier, no changes
npm run format          # Prettier, writes changes
npm run lint             # ESLint
npm run test              # Vitest
npm run build             # Production build
```

## Section 1 — Design

### The scenario

Internal stock console for a clinic's supplies team. They need to search
stock, filter by category, sort it, view an item's detail, and correct the
stock count when a physical count disagrees with the system. Most users are
on ward tablets over patchy wifi, and some share links to specific items over
chat. Treating DummyJSON's product catalogue as the clinic's stock catalogue,
not inventing clinical fields the API doesn't have.

### 1. Components and screen layout

**Stock list page (`/`)**

- Header — page title
- Summary cards row — total items, low stock (this page), showing count
- Filter bar — category filter and sort control
- Search box — above the grid
- Card grid — one card per item: image, name, category, stock count, and a
  "View details" link to the item's detail page
- Pagination — numbered, bottom of the grid, 10 items per page

**Item detail page (`/items/[id]`)**

- Full item info
- Stock correction form + update button

Split into standalone components so they're composed on the page rather than
built inline: `SummaryCards`, `FilterBar`, `SearchBox`, `StockCardGrid`,
`StockCard`, `Pagination`. Each card is a real `<Link>`, not a clickable div,
so it's keyboard-reachable and works as an actual navigable URL.

Using shadcn for components, Tailwind for styling. Not using a modal for item
detail — a shared/reloaded link needs to land on the actual item, and a
dedicated route satisfies that directly without extra routing complexity.

A top navbar (`Navbar`) shows the console name and a profile icon; clicking
it opens a modal with the signed-in user's details (fetched live from
`/auth/me`) and a sign-out action.

### 2. Where state lives

- **URL state** — `q` (search, debounced), `category`, `sortBy`, `order`,
  `page`. Read via `useSearchParams`. This is what makes reload and copied
  links restore the exact same view.
- **Server state** — product list, single item, categories, current user.
  Owned by TanStack Query, keyed off the URL state above (e.g.
  `['products', 'list', { q, category, sortBy, order, page }]`). Changing
  any URL param produces a new query key, which is what protects against
  stale results overwriting fresh ones on a slow connection.
- **Local UI state** — the raw (non-debounced) search input value, the
  stock-correction form's input value, mutation-in-flight flags.

### 3. Fetch, cache, invalidate

- List/detail/category data fetched via TanStack Query, cached by query key.
- Search input is debounced (~350ms) before being written into the URL —
  only the debounced value drives the query.
- `keepPreviousData` used on the list query so switching filters/sort/page
  never flashes an empty grid mid-transition.
- On a successful stock correction (`PUT /products/{id}`), the query cache
  is **patched directly from the mutation's response**, not invalidated and
  refetched. See "API limitations" below — this was a deliberate reversal
  of an earlier decision once a real constraint was discovered.

### 4. Layout, spacing, colour, typography

shadcn defaults (`new-york` style, `neutral` base colour) for component
styling, Tailwind for layout and spacing. No custom design system built for
this — shadcn/Tailwind defaults used as-is.

### 5. Accessibility approach

- Relying on shadcn/Radix primitives for correct semantics and keyboard
  behaviour by default.
- All interactive elements are real `<a>`/`<button>`/`<input>` — no
  div+onClick — so Tab order and activation work without extra code.
- Not stripping default focus rings.
- Explicitly handling focus on route change: moving focus to the item detail
  page's heading on navigation so keyboard users aren't stranded or reset to
  the top of the document.
- `aria-label`s on the search box and unlabeled filter controls.
- Verified via a keyboard-only pass through the app and a 360px viewport
  check.

### Decision log

1. **Server-side debounced search over client-side fuzzy search.**
   Considered a fuzzy-search library (client-side, instant, no network lag)
   but rejected it — the list is paginated (10/page out of 194 total), so a
   client-side fuzzy search would only search whatever's already loaded, not
   the real catalogue. Server-side search via `GET /products/search?q=`,
   debounced before hitting the URL/query key, correctly searches the whole
   catalogue and lets TanStack Query cancel stale in-flight requests when
   the query changes.

2. **Numbered pagination over infinite scroll.** Considered infinite scroll
   since the list is a card grid rather than a table. Rejected it — the
   brief requires that reloading or opening a copied URL restores "same
   page," which maps cleanly to `?page=3` in the URL but not to an
   infinite-scroll position.

3. **Dedicated route for item detail over a modal.** Considered a modal for
   viewing/correcting stock. Rejected it as the primary pattern — a modal
   has no independent URL, so a colleague opening a shared link wouldn't
   land on the item.

4. **Patch the query cache from the mutation response, not
   invalidate-and-refetch, after a stock correction.** Originally chose
   invalidate-and-refetch (simpler to reason about, small refetch delay as
   the only cost). Discovered DummyJSON does not persist `PUT` writes
   server-side — a refetch after a successful correction returns the
   original, unmodified stock value, silently reverting the update in the
   UI. Switched to patching the cache directly from the mutation's own
   response, since that response is the only place the "truth" of the
   update exists for the rest of the session. Noting this as a reversed
   decision, not a clean first guess — the original reasoning wasn't wrong,
   it just didn't yet know about this constraint.

### API limitations (DummyJSON)

- **No single endpoint accepts search, category, and sort together.**
  `GET /products/search?q=`, `GET /products/category/{slug}`, and
  `GET /products` (with `sortBy`/`order`) are separate endpoints. This
  implementation gives search precedence over category when both are set —
  see `getProducts()` in `lib/api/products.ts`, and the test in
  `products.test.ts` that locks in this precedence.
- **`GET /products/categories` returns `{slug, name, url}` objects**, not
  plain strings as some docs/examples suggest — verified against the live
  API rather than assumed.
- **Writes do not persist.** `PUT /products/{id}` returns a 200 with a
  merged response body, but nothing is saved server-side — a later `GET`
  returns the original data. This directly shaped decision #4 above, and
  means a stock correction is only reflected for the rest of the current
  browser session; reloading the page will show the original DummyJSON
  value again. This is a ceiling of the mock API, not something fixable
  client-side.

## Section 3 — Deployment & CI/CD

- **Deployed app:** https://clinic-stock-console-blue.vercel.app/
- **Branch that triggers deployment:** `main`
- **CI (GitHub Actions, `.github/workflows/ci.yml`):** runs on every pull
  request targeting `main`, and on every push to `main`. Two jobs:
  - `quality` — installs deps, then runs `format:check`, `lint`, and `test`.
    Any failure fails the job.
  - `commitlint` — runs only on pull requests, checks every commit in the
    PR against Conventional Commits via `commitlint-github-action`.
    Both jobs are required status checks — set as required in the GitHub
    branch protection rule for `main` so a failing check blocks merge.
- **CD (Vercel):** the repo is connected to Vercel via its native GitHub
  integration (no deploy step in GitHub Actions — Vercel handles this
  independently once connected). `vercel.json`'s
  `git.deploymentEnabled` config restricts deployments to the `main` branch
  only — no preview builds are triggered for feature branches or PRs.
  Merging a PR into `main` triggers a new production deployment
  automatically.

### One-time Vercel setup (not part of the repo)

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the repo. Vercel auto-detects
   Next.js; no build command overrides needed.
3. Confirm the project's **Production Branch** (Project Settings → Git) is
   set to `main`.
4. Deploy once manually to verify, then every future merge to `main` will
   redeploy automatically.

## Section 4 — AI Reflection

**1. What did you use AI for across the four sections?**

- Section 1 (Design): tidying up my README write-up.
- Section 2 (Build): scaffolding and boilerplate code generation.
- Section 3 (Deployment & CI/CD): setting up the GitHub Actions workflows
  and Vercel deployment config.
- Section 4 (this section): refining the wording of my answers.

**2. Which tools did you use, and how did the workflow run?**

Used Claude (chat-based) as the AI tool. Didn't follow a named spec-driven
framework (Superpowers, GSD, Spec Kit, OpenSpec, BMAD). Structured the work
as: write Section 1's design decisions myself first → prompt for project
scaffolding once the design was settled → prompt section-by-section through
the build, reviewing and testing each piece against the real API before
moving on.

**3. One example where an AI suggestion improved your work, and what you
prompted it with.**

Considering infinite scroll for the card grid layout instead of numbered
pagination. When I raised it, the AI pointed out that infinite scroll
doesn't map cleanly onto the brief's requirement that reloading or opening
a copied URL restores the exact same page — an infinite-scroll position
isn't a natural URL value the way `?page=3` is. That reasoning is why the
app uses numbered pagination.

Also, the cache-patching fix for the stock-correction mutation: I reported
that the PUT request was returning 200 but the stock count wasn't actually
updating in the UI. That led to identifying that DummyJSON doesn't persist
writes server-side, and switching from invalidate-and-refetch to patching
the query cache directly from the mutation's response.

**4. One example where AI output was wrong, incomplete, or subtly bad, and
how you caught it.**

The original invalidate-and-refetch decision for the stock correction
mutation — AI-proposed reasoning that seemed sound at the time (simpler to
reason about, small refetch delay as the only cost), but was actually wrong
given a constraint neither of us knew yet: DummyJSON doesn't persist
writes. It wasn't caught by lint or tests — it was caught by me actually
testing the feature against the real API and reporting that the stock
count wasn't updating.

**5. Two decisions made without AI, and why I trusted my own judgment
there.**

- Deciding the search/filter/sort should apply instantly rather than
  requiring an "Apply" button.
- Picking Next.js + TanStack Query + shadcn as the stack in the first
  place, before any implementation details were discussed.

Both were mostly based on experience from past projects. I also switched
the stock list from a table to a card grid layout on my own judgment,
before any discussion of how that would affect routing or the detail-page
decision.

**6. One part of the codebase I'd struggle to defend, and why.**

The `AuthGuard` component and the search/category filter interaction in
`getProducts`. While reviewing the code, `AuthGuard` was reading
`getAccessToken()` directly during render with a `typeof window` check —
this produced a real hydration mismatch (confirmed via the actual React
error), since the server and the client's first paint could disagree on
whether a token existed. Fixed with a proper mount-gate: both render
identically (`null`) on first paint, and the real token check only happens
after mount. Separately, `getProducts` picks search over category when
both are set (DummyJSON has no single endpoint for both together), but the
UI gave no indication of this — a user could set a category, then search,
and have their filter silently ignored. Fixed by disabling the category
control while search is active, with a visible explanation, and clearing
it when a new search starts so it can't show a stale, ignored value.
Neither issue was caught by lint or tests — the hydration bug only showed
up when actually running the app in a browser, and the UX gap only became
obvious from re-reading the code with fresh eyes, not from any automated
check.
