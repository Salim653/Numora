---
name: numora-ui
description: Apply the NUMORA UI design system when designing, coding, reviewing, or refactoring NUMORA frontend interfaces, especially Next.js/React pages, components, responsive layouts, assessment screens, dashboards, authentication, class flows, drill, pretest, tryout, leaderboard, PvP, profile, admin, and teacher surfaces. Use this skill whenever a coding agent such as Codex is asked to implement NUMORA UI, translate Figma/mockups into code, create temporary functional UI while UI/UX works in parallel, or check whether frontend code follows NUMORA visual, interaction, accessibility, and reuse conventions.
---

# NUMORA UI

Use this skill as the visual and frontend implementation baseline for NUMORA while UI/UX and Software work in parallel.

## Authority order

Apply sources in this order when they conflict:

1. Latest approved/product-baseline PRD for product behavior, access rules, copy semantics, assessment rules, and feature availability.
2. Latest explicit UI/UX handoff or approved Figma frame for screen-specific layout and interaction.
3. `NUMORA_UI_DESIGN_SYSTEM.md` for shared visual language, tokens, reusable components, responsive behavior, states, and accessibility.
4. Existing repository components when they do not conflict with the sources above.
5. Figma Community/Duolingo-inspired resources only as implementation references, never as product authority.

Never let a visual reference change a business rule from the PRD.
Never let old code or old Jira requirements silently override the latest PRD.
Never invent an unresolved product rule. Mark it as unresolved and use a non-destructive placeholder if implementation must continue.

## Required workflow

Before implementing NUMORA UI:

1. Read `NUMORA_UI_DESIGN_SYSTEM.md`.
2. Inspect the existing repository for tokens, shared components, routing, CSS strategy, and installed libraries before adding anything.
3. Identify the user role and product state represented by the screen.
4. Reuse or extend existing primitives before creating a new component.
5. Keep business/data logic separate from presentational components so a later UI/UX handoff can replace visuals without rewriting behavior.
6. Implement all required states: loading, empty, success, validation, error, disabled/locked, unauthorized, and offline/recovery when relevant.
7. Verify responsive behavior at mobile, tablet, and desktop widths.
8. Verify keyboard access, focus visibility, labels, contrast, and minimum interaction target size.
9. If a current Figma/mockup exists, compare structure and visual hierarchy against it after the functional implementation works.

## Parallel-development rule

When UI/UX is not final, build a functional shell rather than inventing a different design language.

- Use NUMORA tokens and shared components.
- Use straightforward page structure and predictable hierarchy.
- Do not over-design temporary screens.
- Keep page-specific styling shallow.
- Keep API/state/business behavior stable behind reusable components.
- Expect the next sprint to replace or refine presentation without reworking backend contracts.

## Reuse rules

Prefer:

- `Button`, `IconButton`, `Card`, `Surface`, `Input`, `Select`, `Tabs`, `Badge`, `Progress`, `Modal`, `Toast`, `QuestionOption`, `BottomNav/SidebarNav`, `ListRow`, `EmptyState`, `StatusState`, and `Skeleton` primitives.
- CSS variables/design tokens instead of hardcoded colors.
- Semantic variants such as `primary`, `secondary`, `reward`, `danger`, `success`, and `muted` instead of page-specific color names.
- Compound components for repeated learning flows.

Avoid:

- hardcoded HEX values inside feature components;
- one-off border radii and spacing values;
- copying Duolingo branding, mascot, copy, proprietary imagery, or exact brand identity;
- adding a new UI framework when the repository already has a workable one;
- making the mobile mockup fill the entire desktop viewport by simple scaling;
- color-only status communication.

## Referenced resources

Read `NUMORA_UI_DESIGN_SYSTEM.md` for the complete specification.
The source document references these assets, but they were not supplied with the two Markdown files. Obtain and review the approved files before using them:

- `assets/numora-logo.png` - referenced NUMORA owl brand mark; file pending from UI/UX.
- `assets/reference-mobile-screens.png` - referenced UI/UX concept screen set; file pending from UI/UX.
