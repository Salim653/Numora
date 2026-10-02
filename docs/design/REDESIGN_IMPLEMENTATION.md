# Responsive NUMORA redesign

## Status and authority

**ENGINEERING DECISION — 2 October 2026:** implement the owner's requested UI overhaul after repository/reference review and the explicit instruction “saatnya langsung implementasikan”. The owner subsequently instructed work to continue. No product-policy decision is inferred from the visual references.

**PRD RULE:** Google authentication, role authorization, class affiliation, server-owned mastery/unlock, scoring, assessment persistence, Tryout eligibility and IRT gating remain authoritative. This change adds no endpoint, schema, product feature, or scoring rule.

**OPEN:** final identity/handoff decision OPEN-06, official Tryout configuration OPEN-05, and other academic/product OPEN items remain unresolved. This implementation does not close them.

## Reference adaptation

All 15 images in the supplied ZIP were reviewed. Reference numbering follows the audit extraction order.

| References                    | Pattern                                                 | NUMORA adaptation                                                                               |
| ----------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 01–02, Pahamify Home          | Identity, compact shortcuts, materials, recent activity | Student learning home, chapter grid, shared activity rows                                       |
| 03, Pahamify History          | Scannable activity list, status and result              | Chronological paginated history; zero scores remain visible                                     |
| 04–07, Tryout/category/detail | Clear status, package metadata, primary action          | Shared package/result composition; class access and unavailable states use real API eligibility |
| 08, purchasing grid           | Compact card anatomy                                    | Reused visual structure only; no commerce or subscription behavior                              |
| 09, 15, profiles              | Identity header and grouped account rows                | Affiliation, Google account information, class join, real navigation and logout                 |
| 10–11, settings/logout        | Icon, label, supporting text, action                    | Profile/account rows; no empty help/privacy actions                                             |
| 12–13, Ruangguru Home         | Progress region and modular learning sections           | Actual completed/total levels and latest Drill score; no invented daily goals, XP or streak     |
| 14, live-class listing        | Compact metadata and reusable cards                     | Class/level card rhythm; no live-class or scheduling feature                                    |

Primary remains Sagat Purple `#722CCE`; Soft Purple, Peach, Golden Yellow, Ivory and Pearl remain canonical. Existing Inter and owl artwork are local assets. Semantic badge text uses neutral dark text where the accent itself lacks sufficient contrast.

## Shared composition

- `packages/ui/src/tokens.css` is imported once by global CSS; the duplicate root token block and remote font request were removed.
- `AppShell` owns desktop sidebar, mobile navigation, page heading, account region and focus mode. Student has five destinations: Beranda, Belajar, Tryout, Progres, Profil. Teacher/Admin use their own existing routes.
- Existing Button, Card, Input, Badge, SectionHeader, ProgressBar, EmptyState and Skeleton are reused. Shared Icon, ChapterCard, ActivityRow and ProgressSummary cover actual repeated patterns.
- `apps/web/src/app/numora.css` owns responsive composition. Legacy competing shells, inactive duplicate history/teacher/Tryout screens and the previous Figma override stylesheet were removed.
- StudentGate and TeacherGate isolate query caches by access token. Teacher redirect side effects run in an effect. Joining a class refreshes identity from the server.
- Learning retains chapter → subchapter → level routes. Level status and latest/best scores come from the API. Resume starts through the existing endpoint.
- Assessment focus mode removes global Student navigation. Count-up timing, save acknowledgement, failed-save retry, submit confirmation, persisted results and explanation expiry retain existing behavior.
- Admin retains its operational forms/actions, tabs, pagination, immutable content revisions and authorization inside the shared shell.

## Availability boundaries

The current live Tryout contract returns unavailable/eligible; future package/attempt/result states already present in the frontend remain supported without pretending the backend implements them. PvP, leaderboard and other demo-only experiences remain accessible through the explicit demo area rather than the live Student navigation.

The identity contract does not return a school/class display name for Student. The profile therefore displays confirmed affiliation only. No made-up class, XP, streak, mastery aggregate or “continue latest” target is generated. Teacher scores remain per level; no new academic aggregation is introduced.

## Verification

- Web regression tests cover real query-provider composition, role gates, nested-route navigation, class join plus identity refresh, ineligible Tryout, zero scores, empty progress, and locked-level/resume behavior.
- Existing save/retry/submit, server-owned result, auth and Admin contract tests are retained.
- Local Chromium visual checks use explicitly fictional network fixtures, separate from product code, across 320, 390, 768 and 1440px Student layouts and mobile/desktop Teacher/Admin layouts.
- Visual checks inspect the actual routed app, including login, home, catalog, levels, Tryout, history, profile, Drill/results, teacher classes/students/detail and Admin forms. They check horizontal overflow and browser exceptions.
- Keyboard focus, native labels, minimum touch targets, reduced motion, semantic status text and safe-area bottom padding are included.

Browser fixtures do not verify deployment credentials, real Google OAuth, backend persistence or production end-to-end behavior. Those remain release QA checks against a configured environment.

Verification run: repository lint passed; web and UI typechecks passed; the production web build passed; 29 web tests passed. Forty routed-page/viewport combinations had no horizontal overflow or JavaScript exceptions. A separate Chromium interaction check passed Drill start, answer-save acknowledgement, confirmed submit, result navigation, keyboard skip/focus, class-join identity refresh and logout, using only intercepted test APIs.
