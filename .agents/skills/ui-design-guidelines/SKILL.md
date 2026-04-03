---
name: ui-design-guidelines
description: Use this skill for any UI styling/redesign work in consultorio-psi. It enforces the token-first dark-blue design system, shared-component-first changes, and consistent shell/table/card/button behavior across authenticated screens.
---

# UI Design Guidelines

## Purpose
Use this skill when implementing or reviewing UI changes in this repository, especially redesign work across authenticated screens.

This skill encodes the current visual principles so multiple agents produce consistent results.

## Trigger Conditions
Use this skill when the task includes any of the following:
- redesign, restyle, polish, visual parity, theme updates
- updates to cards, tables, buttons, top bar, sidebar, layout spacing
- replacing hardcoded colors with tokens
- cross-page UI consistency changes

## Source of Truth Files
- Tokens: `src/styles/theme.ts`
- Antd theme bridge: `src/styles/antd-theme.ts`
- Shell: `src/components/Layout/index.tsx`, `src/components/Layout/style.ts`, `src/components/TopBar/index.tsx`, `src/components/Siderbar/index.tsx`
- Shared UI: `src/components/Card/*`, `src/components/AppointmentsCard/*`, `src/components/Table/*`, `src/components/Button/*`, `src/components/Calendar/CustomToolbar.tsx`
- Page styles: `src/pages/**/style.ts`

## Non-Negotiables
1. Token-first: do not introduce hardcoded hex values in app UI components/pages.
2. Do not reintroduce legacy electric blue accents.
3. Shared-components-first: implement visual changes in reusable components before page-level overrides.
4. Breadcrumb pattern for authenticated shell: `Início / <Página>`.
5. Detail breadcrumbs must use generic labels (e.g., `Paciente`, `Notificação`) instead of long dynamic names.
6. Preserve responsive integrity; avoid horizontal overflow on mobile.
7. Whenever you're adding a form, use `react-hook-form` with inputs from the design system at `src/components/Inputs`.
8. Links over buttons with navigation on click whenever possible.

## Visual System Rules
### Color
- Primary actions and accents come from `theme.colors.primary*`.
- Sidebar stays strong dark blue (`primary800`) with high contrast text.
- Page/content surfaces should use neutral tokens (`base0`, `base50`, `base100`), not raw hex.
- Semantic states:
  - Success: `good600` / `good50`
  - Warning: `warning550` / `warning50`
  - Error: `error600` / `error50`

### Spacing and Shape
- Use 8px rhythm with common steps: `8, 12, 16, 24, 32`.
- Prefer 12px radius for cards and table containers.
- Keep vertical rhythm coherent between topbar, KPI cards, and tables.

### Cards
- Use `Card`/`AppointmentsCard` as KPI base.
- Value emphasis should be stronger than description (e.g., `primary700` vs `base700`).

### Tables
- Use `TableComponent` for standard list screens.
- Table header should be visually distinct (tinted neutral/primary light background).
- Row hover should be subtle but visible.
- Action buttons should look like a coherent family (consistent radius/spacing/motion).

### Buttons
- Prefer `ButtonComponent` variants (`primary`, `secondary`, `outline`, etc.).
- If explicit colors are needed, pass token values from `theme`, not literals.

## Redesign Workflow
1. Map impact and inheritance:
   - Identify shared components that affected pages depend on.
2. Update tokens first:
   - `src/styles/theme.ts`
   - `src/styles/antd-theme.ts` (if component tokens are needed)
3. Update shared components:
   - Layout/topbar/sidebar, then cards/tables/buttons.
4. Clean page-level exceptions:
   - Remove hardcoded colors and spacing drift where still needed.
5. Verify alignment on representative screens:
   - Dashboard, Pacientes, one Relatórios screen, one detail page.
6. Run checks:
   - `pnpm lint`
   - `pnpm typecheck`
   - Optional targeted e2e/visual checks

## Guardrails
- Prefer minimal, centralized changes over broad one-off overrides.

## Done Criteria
- No legacy bright-blue accent regressions.
- No new hardcoded hex values in touched UI pages/components.
- Shared shell, tables, and cards feel cohesive across authenticated screens.
