# NUMORA UI/UX REDESIGN PROPOSAL

> **Konteks historis/provisional:** bukti dan rancangan di bawah dipertahankan pada tanggal pencatatannya. Aturan Core Learning yang berbeda telah digantikan oleh [PRD Drill v1.2 / TryOut v1.1, 2 Oktober 2026](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md); hasil tes lama tidak membuktikan acceptance terbaru.


**Version:** 1.0 - Initial Redesign Proposal
**Date:** 30 September 2026
**Status:** PROPOSAL - Menunggu Approval

---

## A. EXISTING UI AUDIT

### A.1 Current UI Structure

#### Pages yang Sudah Ada

| Route | Halaman | Status UI |
|-------|---------|-----------|
| `/` | Landing/Login | Basic structure |
| `/onboarding` | Role selection | Basic structure |
| `/auth/callback` | Auth callback | Functional |
| `/student` | Student Dashboard | Needs redesign |
| `/student/learn` | Chapter catalog | Needs redesign |
| `/student/learn/[chapterId]` | Chapter detail | Needs redesign |
| `/student/learn/[chapterId]/[subchapterId]` | Level selection | Needs redesign |
| `/student/drill/[attemptId]` | Drill assessment | Functional, focus mode |
| `/student/drill/[attemptId]/result` | Drill result | Needs redesign |
| `/student/tryout` | Tryout list | Needs redesign |
| `/student/tryout/[attemptId]` | Tryout assessment | Functional |
| `/student/tryout/[attemptId]/result` | Tryout result | Needs redesign |
| `/student/assessment` | Assessment history | Needs redesign |
| `/teacher` | Teacher dashboard | Needs redesign |
| `/teacher/classes/[classId]` | Class students | Needs redesign |
| `/teacher/classes/[classId]/students/[studentId]` | Student detail | Needs redesign |
| `/admin/content` | Admin content | Needs redesign |
| `/admin/schools` | Admin schools | Needs redesign |

#### Shared Components yang Tersedia

| Component | Lokasi | Status |
|-----------|--------|--------|
| `Button` | packages/ui | Basic, perlu enhancement |
| `Brand` (logo) | packages/ui | Ready |
| `LearningFrame` | features/core-learning/ui.tsx | Needs redesign |
| `Panel` | features/core-learning/ui.tsx | Basic |
| `PrimaryButton` | features/core-learning/ui.tsx | Basic |
| `Status` | features/core-learning/ui.tsx | Functional |
| `DataState` | features/core-learning/ui.tsx | Functional |

### A.2 Masalah Consistency

1. **Shell Pattern Tidak Konsisten**
   - Student: `.learning-shell` dengan top navigation
   - Teacher/Admin: `.monitoring-shell` dengan pattern berbeda
   - Tidak ada unified shell system

2. **Navigation Berbeda**
   - Student menggunakan top nav links
   - Teacher tidak punya navigation di header
   - Admin menggunakan Button-based nav tabs

3. **Card Component Tidak Modular**
   - `.learning-panel`, `.monitoring-row`, `.panel` adalah pattern berbeda
   - Tidak ada shared Card primitive

4. **Spacing dan Typography Tidak Ter标准**
   - Beberapa pakai Tailwind (`mt-7`, `text-xl`)
   - Beberapa pakai CSS custom (`.student-progress-grid`)
   - Inkonsisten dalam responsive behavior

5. **Button System Tidak Terintegrasi**
   - Primary button ada di 3 tempat berbeda
   - Tidak ada shared button component dengan variants lengkap

### A.3 Masalah Layout/Hierarchy

1. **Student Dashboard Terlalu Sederhana**
   - Hanya 3 action cards + progress
   - Tidak ada user identity/status yang jelas
   - Tidak ada "learning home" feel

2. **Navigation Tidak Tegas**
   - Top nav dengan text links
   - Tidak ada visual hierarchy yang kuat
   - Missing quick actions / feature shortcuts

3. **Card Design Tidak Visual**
   - Chapter/Subchapter list hanya plain text list
   - Tidak ada progress visualization
   - Tidak ada locked/unlocked state yang jelas

### A.4 Bagian yang Sebaiknya Dipertahankan

1. **LearningFrame structure** - Layout wrapper dengan title
2. **Auth flow** - Login dan onboarding functional
3. **AssessmentSession** - Drill/Tryout focus mode sudah baik
4. **DataState component** - Loading/error/empty states
5. **Brand logo** - NUMORA owl sudah tepat
6. **Color palette** - Sudah sesuai design system

### A.5 Bagian yang Sebaiknya Dirombak

1. **Student Dashboard** - Perlu "learning home" concept
2. **Learning catalog** - Perlu visual hierarchy
3. **Navigation** - Perlu unified bottom nav untuk mobile
4. **Card patterns** - Perlu shared card system
5. **Profile/Settings** - Perlu modern settings pattern
6. **Teacher UI** - Perlu consistent shell

---

## B. SCREENSHOT REFERENCE ANALYSIS

### B.1 Reference Mapping

| Screenshot | Pattern | NUMORA Application |
|------------|---------|-------------------|
| Pahamify Home (img 1-4) | Feature grid + progress + continue learning | Student Dashboard |
| Pahamify Learning (img 5-7) | Chapter cards with progress bars | Learning Catalog |
| Pahamify Tryout (img 9) | Card list with status badges | Tryout List |
| Pahamify Stats (img 8) | Chart + metrics cards | Assessment History |
| Pahamify Profile (img 13) | Profile header + stats + menu | Profile Page |
| Pahamify Settings (img 12) | Icon + row navigation | Settings Page |
| Ruangguru-style | Clean cards + soft shadows | General card design |

### B.2 Key Patterns to Adapt

#### Pattern 1: Student Home Structure
- **Reference:** Pahamify Home (img 1-4)
- **Characteristics:**
  - Top: User identity + status (streak, XP)
  - Feature shortcuts grid (2x3 atau 3x2)
  - Progress ring/bar untuk mastery
  - "Continue learning" section
  - Bottom nav dengan 4-5 items
- **Adaptation for NUMORA:**
  - Behns: User identity, Mandiri/Sekolah status
  - Feature shortcuts: Drill, Tryout, Progress, Leaderboard, PvP
  - Progress: Level mastery visualization
  - Continue: Latest subchapter/level

#### Pattern 2: Learning Catalog Card
- **Reference:** Pahamify Chapter cards (img 5-7)
- **Characteristics:**
  - Chapter icon/image
  - Title + subtitle
  - Progress bar dengan percentage
  - Completed/total items
  - Chevron indicator
- **Adaptation for NUMORA:**
  - Chapter: Title + description
  - Progress: Levels completed/total
  - Status: Completed/In Progress/Locked

#### Pattern 3: Level Selection Grid
- **Reference:** Pahamify Level nodes (img 6)
- **Characteristics:**
  - Visual level circles/nodes
  - Locked/Open/Completed states
  - Star indicators for mastery
  - Current level highlighted
- **Adaptation for NUMORA:**
  - Level cards dengan 1-5 indicator
  - Locked: grayed out, icon lock
  - Open: normal, action button
  - Completed: checkmark, stars (3 max)

#### Pattern 4: Tryout Card List
- **Reference:** Pahamify Tryout (img 9)
- **Characteristics:**
  - Card dengan package name
  - Status badge (Tersedia, Berlangsung, Selesai)
  - Date/time info
  - Action button (Mulai/Lanjutkan/Lihat)
- **Adaptation for NUMORA:**
  - Status: Tersedia, Berlangsung, Menunggu IRT, Selesai
  - Release date
  - Student affiliation indicator

#### Pattern 5: Settings/Profile Row
- **Reference:** Pahamify Settings (img 12)
- **Characteristics:**
  - Icon di kiri
  - Label + optional description
  - Chevron di kanan
  - Dividers antar section
- **Adaptation for NUMORA:**
  - Profile: Avatar, name, class info
  - Settings rows: Notifikasi, Bahasa, Tentang
  - Account section: Keluar

#### Pattern 6: Stats/Progress Cards
- **Reference:** Pahamify Stats (img 8)
- **Characteristics:**
  - Large metric number
  - Label di bawah
  - Optional trend indicator
  - Card-based layout
- **Adaptation for NUMORA:**
  - XP total
  - Levels completed
  - Average score
  - Best streak

---

## C. PROPOSED NUMORA INFORMATION ARCHITECTURE

### C.1 Student Navigation Structure

```
Student
├── Home (Beranda)
│   └── Identity + Status
│   └── Progress Overview
│   └── Feature Shortcuts
│   └── Continue Learning
│   └── Recent Activity
│
├── Learn (Belajar)
│   └── Chapter List
│       └── Subchapter List
│           └── Level Grid
│
├── Tryout
│   └── Current Package
│   └── Past Results
│   └── Upcoming Schedule
│
├── Progress (Riwayat)
│   └── Drill History
│   └── Tryout History
│   └── Achievement Summary
│
├── Leaderboard
│   └── Class Ranking
│   └── Global Ranking
│
├── Profile
│   └── Account Info
│   └── Class Info
│   └── Settings
│   └── Logout
```

### C.2 Bottom Navigation Items (Mobile)

| Position | Label | Icon Concept | Route |
|----------|-------|--------------|-------|
| 1 | Beranda | Home | /student |
| 2 | Belajar | Book/BookOpen | /student/learn |
| 3 | TryOut | ClipboardList | /student/tryout |
| 4 | Profil | User | /student/profile |

**Note:** Leaderboard dan PvP bisa diakses dari Beranda atau Profile menu.

### C.3 Desktop Navigation

Sidebar navigation di kiri dengan:
- Logo + brand
- Navigation items dengan icons
- User info di bottom
- Collapsible option

---

## D. PROPOSED STUDENT HOME LAYOUT

### D.1 Mobile Layout (Top to Bottom)

```
┌─────────────────────────────┐
│  [Logo]           [XP: 150] │  ← Top Bar
├─────────────────────────────┤
│  Halo, [Nama]! 👋           │  ← Greeting
│  📚 User Mandiri             │  ← Status badge
├─────────────────────────────┤
│  ┌───────────────────────┐   │
│  │ 📊 4/20 Level        │   │  ← Progress Card
│  │ ████████░░░░░ 20%    │   │
│  │ Lanjutkan belajar    │   │
│  └───────────────────────┘   │
├─────────────────────────────┤
│  Shortcut Fitur             │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │Dril│ │Try │ │Prog│      │  ← Feature Shortcuts (2x3)
│  └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │PVP │ │Rank│ │Set │      │
│  └────┘ └────┘ └────┘      │
├─────────────────────────────┤
│  Lanjutkan Belajar         │
│  ┌───────────────────────┐   │
│  │ Bab 1: Aljabar       │   │  ← Continue Card
│  │ Subbab 2: Persamaan  │   │
│  │ Level 3 →            │   │
│  └───────────────────────┘   │
├─────────────────────────────┤
│  Aktivitas Terakhir        │
│  ┌───────────────────────┐   │
│  │ Drill • Level 2 • 80%│   │  ← Recent Activity
│  │ 2 jam lalu           │   │
│  └───────────────────────┘   │
├─────────────────────────────┤
│  [🏠] [📚] [📋] [👤]       │  ← Bottom Navigation
└─────────────────────────────┘
```

### D.2 Section Rationale

| Section | Purpose | Reference Pattern |
|---------|---------|-------------------|
| Top Bar | Branding + XP display | Pahamify top bar |
| Greeting | Personal connection | Consumer app standard |
| Status Badge | Context (Mandiri/Sekolah) | Status indicator |
| Progress Card | Mastery overview | Pahamify progress ring |
| Feature Shortcuts | Quick navigation | Pahamify feature grid |
| Continue Learning | Next action clarity | Pahamify continue section |
| Recent Activity | Activity history | Activity list |
| Bottom Nav | Primary navigation | Mobile app standard |

### D.3 Desktop Layout

```
┌──────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ┌────────────────────────────────────┐    │
│            │  │  Halo, [Nama]!                     │    │
│  🏠 Beranda│  │  User Sekolah - Kelas IX A         │    │
│  📚 Belajar│  ├────────────────────────────────────┤    │
│  📋 TryOut │  │  ┌─────────┐ ┌─────────┐         │    │
│  📊 Progress  │  │ Progress │ │   XP    │         │    │
│  🏆 Ranking│  │  │  4/20   │ │   150   │         │    │
│            │  │  └─────────┘ └─────────┘         │    │
│ ───────────│  ├────────────────────────────────────┤    │
│  👤 Profil│  │  Feature Shortcuts                 │    │
│  ⚙️ Settings │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │    │
│  🚪 Keluar │  │  │Dril│ │Try │ │Prog│ │PVP │  │    │
│            │  │  └────┘ └────┘ └────┘ └────┘  │    │
└──────────────  └────────────────────────────────────┘    │
```

---

## E. DESIGN COMPONENT PLAN

### E.1 Components to Retain

| Component | Action | Notes |
|-----------|--------|-------|
| `Brand` | Retain | Already correct |
| `AuthProvider` | Retain | Auth flow is functional |
| `DataState` | Retain + Enhance | Good for loading/error states |
| `AssessmentSession` | Retain | Focus mode is appropriate |
| CSS Tokens | Retain | Design system tokens are good |

### E.2 Components to Improve

| Component | Current | Improved |
|-----------|---------|----------|
| `Button` | Basic passthrough | Add variants (primary, secondary, ghost), sizes, icons |
| `LearningFrame` | Basic shell | Add responsive variants, refactor to AppShell |
| `Panel` | Basic section | Add card variants, interactive state |

### E.3 Components to Create

#### Global Shell Components
| Component | Purpose |
|-----------|---------|
| `AppShell` | Root layout wrapper |
| `StudentShell` | Student-specific layout with nav |
| `TeacherShell` | Teacher-specific layout with nav |
| `AdminShell` | Admin-specific layout with nav |
| `TopBar` | Top header with branding + actions |
| `BottomNav` | Mobile bottom navigation |
| `SidebarNav` | Desktop sidebar navigation |

#### Navigation Components
| Component | Purpose |
|-----------|---------|
| `NavLink` | Navigation item with active state |
| `NavSection` | Grouped nav items |

#### Content Components
| Component | Purpose |
|-----------|---------|
| `Card` | Base card with variants |
| `CardHeader` | Card title + subtitle |
| `CardContent` | Card body |
| `CardFooter` | Card action area |
| `FeatureShortcut` | Grid item for feature nav |
| `ProgressRing` | Circular progress indicator |
| `ProgressBar` | Linear progress with label |
| `LevelNode` | Level indicator (locked/open/completed) |
| `StatusBadge` | Status chip (tersedia, berlangsung, dll) |

#### List Components
| Component | Purpose |
|-----------|---------|
| `ListRow` | Icon + text + chevron row |
| `ListSection` | Grouped list rows |
| `ChapterCard` | Learning chapter card |
| `TryoutCard` | Tryout package card |

#### Profile Components
| Component | Purpose |
|-----------|---------|
| `ProfileHeader` | Avatar + name + status |
| `ProfileStats` | Stats row (XP, level, streak) |
| `SettingsRow` | Settings menu item |

#### Form Components
| Component | Purpose |
|-----------|---------|
| `Input` | Text input with label |
| `Select` | Dropdown select |
| `Checkbox` | Checkbox option |

#### Feedback Components
| Component | Purpose |
|-----------|---------|
| `Skeleton` | Loading placeholder |
| `EmptyState` | Empty data message |
| `ErrorState` | Error message + retry |
| `Toast` | Non-blocking notification |

### E.4 Components to Consolidate/Remove

| Current | Action | Reason |
|---------|--------|--------|
| `.monitoring-shell` | Merge into `AdminShell` | Unify shell system |
| `.learning-shell` | Merge into `StudentShell` | Unify shell system |
| `.panel` class | Replace with `Card` component | Component-based |
| `.monitoring-row` | Replace with `ListRow` | Component-based |

---

## F. REFACTOR PLAN

### Phase 0: Design Foundation (Foundation)
**Duration:** ~1-2 days
**Deliverables:**
1. CSS token consolidation
2. Core UI component library setup
3. Shared CSS structure

**Tasks:**
- [ ] Consolidate design tokens in `globals.css`
- [ ] Create `packages/ui/src/` component structure
- [ ] Implement `Button` with variants
- [ ] Implement `Card` component
- [ ] Implement `Input` component
- [ ] Implement `Badge` component
- [ ] Implement `Skeleton` component

### Phase 1: Global Shell & Navigation (1 week)
**Duration:** ~1 week
**Deliverables:**
1. Unified shell system
2. Student navigation (mobile + desktop)
3. Teacher/Admin shell alignment

**Tasks:**
- [ ] Create `AppShell` base component
- [ ] Create `StudentShell` with bottom nav
- [ ] Create `SidebarNav` for desktop
- [ ] Create `TopBar` component
- [ ] Create `BottomNav` component
- [ ] Update `LearningFrame` to use new shell
- [ ] Create `TeacherShell` aligned with system
- [ ] Create `AdminShell` aligned with system
- [ ] Add responsive behavior to all shells

### Phase 2: Student Dashboard Redesign (1 week)
**Duration:** ~1 week
**Deliverables:**
1. New student home layout
2. Feature shortcut grid
3. Progress visualization
4. Continue learning section

**Tasks:**
- [ ] Design new dashboard layout
- [ ] Implement `ProfileHeader` component
- [ ] Implement `StatusBadge` (Mandiri/Sekolah)
- [ ] Implement `ProgressCard` with ring/bar
- [ ] Implement `FeatureShortcutGrid`
- [ ] Implement `ContinueCard`
- [ ] Implement `RecentActivityList`
- [ ] Wire up data to dashboard
- [ ] Test responsive behavior

### Phase 3: Learning Module Redesign (1 week)
**Duration:** ~1 week
**Deliverables:**
1. Visual chapter catalog
2. Chapter detail page
3. Level selection with visual states

**Tasks:**
- [ ] Redesign chapter list layout
- [ ] Implement `ChapterCard` component
- [ ] Implement `ChapterDetailPage`
- [ ] Implement `SubchapterList` with progress
- [ ] Implement `LevelGrid` with `LevelNode`
- [ ] Add locked/open/completed states
- [ ] Add star indicators
- [ ] Wire up drill start functionality

### Phase 4: Tryout & Result Redesign (3-4 days)
**Duration:** ~3-4 days
**Deliverables:**
1. Visual tryout list
2. Tryout card with status badges
3. Result page enhancement

**Tasks:**
- [ ] Redesign tryout list layout
- [ ] Implement `TryoutCard` component
- [ ] Implement status badges (Tersedia, Berlangsung, Menunggu IRT, Selesai)
- [ ] Enhance result page layout
- [ ] Add IRT waiting state visualization

### Phase 5: Profile & Settings (3-4 days)
**Duration:** ~3-4 days
**Deliverables:**
1. Profile page with stats
2. Settings page with row navigation
3. Class management UI

**Tasks:**
- [ ] Create `/student/profile` page
- [ ] Implement `ProfileHeader` with stats
- [ ] Implement `ProfileStatsRow`
- [ ] Implement settings row navigation
- [ ] Create join class UI
- [ ] Add logout functionality

### Phase 6: Teacher UI Alignment (3-4 days)
**Duration:** ~3-4 days
**Deliverables:**
1. Teacher home with class overview
2. Consistent teacher shell
3. Student progress cards

**Tasks:**
- [ ] Redesign teacher dashboard
- [ ] Implement class cards
- [ ] Add student progress indicators
- [ ] Enhance student detail view
- [ ] Align with new shell system

### Phase 7: Onboarding/Auth Alignment (2-3 days)
**Duration:** ~2-3 days
**Deliverables:**
1. Login page enhancement
2. Onboarding page alignment
3. Consistent auth flow styling

**Tasks:**
- [ ] Review login page layout
- [ ] Add feature preview cards
- [ ] Align onboarding with new design system
- [ ] Add NUMORA illustration style

### Phase 8: Admin Alignment (2-3 days)
**Duration:** ~2-3 days
**Deliverables:**
1. Admin shell with nav
2. Consistent admin styling
3. Admin cards/tables

**Tasks:**
- [ ] Update admin shell
- [ ] Align content management UI
- [ ] Align schools management UI
- [ ] Consistent button/form styling

### Phase 9: Polish & Accessibility (Ongoing)
**Duration:** Throughout + final week
**Deliverables:**
1. Accessibility compliance
2. Responsive polish
3. Animation refinement

**Tasks:**
- [ ] Accessibility audit (WCAG basics)
- [ ] Focus management
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Motion/refined animation
- [ ] Cross-browser testing

---

## G. QUESTIONS FOR APPROVAL

### G.1 Navigation Decisions

**Q1:** Untuk Student navigation, apakah 4-item bottom nav sudah cukup?
- Beranda, Belajar, TryOut, Profil
- Atau perlu item lain (Leaderboard, PvP)?

**Q2:** Apakah Leaderboard harus memiliki dedicated tab di bottom nav?

**Q3:** Untuk desktop, apakah sidebar navigation harus collapsible?

### G.2 Content Decisions

**Q4:** Di Student Home, apakah "Aktivitas Terakhir" harus menampilkan:
- Hanya drill history?
- Drill + Tryout?
- Semua aktivitas termasuk PvP?

**Q5:** Feature shortcuts grid - fitur mana yang prioritas tinggi?
- Drill (Practice)
- TryOut
- Progress/Riwayat
- Leaderboard
- PvP
- Settings

### G.3 Visual Decisions

**Q6:** Apakah progress visualization lebih prefer:
- Circular progress ring (Pahamify style)?
- Linear progress bar?
- Keduanya dengan toggle?

**Q7:** Untuk locked level - apakah perlu visual lock icon yang jelas, atau cukup grayed out?

**Q8:** Untuk achievement/stars - apakah perlu 3-star system visualization di level cards?

### G.4 Product Scope Questions

**Q9:** Untuk User Mandiri:
- Apakah "TryOut" tab perlu disabled/hidden?
- Atau tampil dengan status "Tersedia untuk User Sekolah"?

**Q10:** Apakah perlu dedicated "PvP" section di home, atau cukup dari Leaderboard menu?

### G.5 Implementation Questions

**Q11:** Apakah implementasi bertahap sesuai rencana (9 phases) acceptable, atau perlu prioritas berbeda?

**Q12:** Apakah boleh melakukan refactor bertahap sambil tetap menjaga functionality (continuous delivery)?

---

## H. TECHNICAL CONSTRAINTS

### H.1 Preserve During Redesign

**MUST NOT CHANGE:**
- API endpoints
- Database schema
- Authentication flow
- Authorization rules
- Product behavior (scoring, progress, access)
- Route structure
- Business logic in services

**MUST PRESERVE:**
- All existing functionality
- State management (TanStack Query)
- Auth integration (Supabase)
- Responsive behavior
- Accessibility baseline

### H.2 Implementation Guidelines

1. **Component-First:** Build shared components before pages
2. **Token-Based:** All styling via CSS variables
3. **Responsive:** Mobile-first with desktop adaptation
4. **Accessible:** WCAG 2.1 AA baseline
5. **Incremental:** Small, reviewable changes

---

## I. SUCCESS CRITERIA

After redesign, NUMORA should have:

1. **Consistent Visual Identity** - NUMORA brand clearly recognizable
2. **Modern Consumer Feel** - Education app yang terasa profesional dan engaging
3. **Clear Navigation** - User selalu tahu di mana mereka dan kemana harus pergi
4. **Visual Hierarchy** - Informasi penting menonjol, detail sekunder accessible
5. **Progress Visibility** - Student dapat melihat achievement dan next steps
6. **Responsive Excellence** - Berfungsi baik di mobile dan desktop
7. **Accessibility Compliance** - Dapat digunakan oleh semua user

---

## APPENDIX: Component Architecture

### Proposed File Structure

```
packages/ui/src/
├── tokens.css              # Design tokens
├── globals.css             # Global styles
├── button/
│   ├── index.ts
│   └── button.tsx
├── card/
│   ├── index.ts
│   └── card.tsx
├── badge/
│   ├── index.ts
│   └── badge.tsx
├── input/
│   ├── index.ts
│   └── input.tsx
├── skeleton/
│   ├── index.ts
│   └── skeleton.tsx
└── index.ts               # Main exports

apps/web/src/components/
├── shell/
│   ├── app-shell.tsx
│   ├── student-shell.tsx
│   ├── teacher-shell.tsx
│   └── admin-shell.tsx
├── navigation/
│   ├── top-bar.tsx
│   ├── bottom-nav.tsx
│   ├── sidebar-nav.tsx
│   └── nav-link.tsx
├── cards/
│   ├── feature-shortcut.tsx
│   ├── chapter-card.tsx
│   ├── tryout-card.tsx
│   ├── progress-card.tsx
│   └── level-node.tsx
├── profile/
│   ├── profile-header.tsx
│   ├── profile-stats.tsx
│   └── settings-row.tsx
├── feedback/
│   ├── empty-state.tsx
│   ├── error-state.tsx
│   └── skeleton-list.tsx
└── index.ts
```

---

**End of Proposal**

*Waiting for approval to proceed with Phase 0: Design Foundation*
