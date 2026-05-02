<div align="center">

<img src="docs/logo/logo.png" alt="SmartChain Hub" width="100" />

# 🎨 SmartChain Hub — UI Components & Color Audit
### *What exists, what's inconsistent, and what to improve*

[![Frontend](https://img.shields.io/badge/Next.js-16.2.4-000000?style=flat-square&logo=next.js)](.)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](.)
[![Font](https://img.shields.io/badge/Font-Plus_Jakarta_Sans-6366f1?style=flat-square)](.)

> Verified against all 17 components and 16 pages in `smartchain_hub_frontend/src/`

</div>

---

## 1 · Current Color System

### What Is Actually Used (from source)

```
BACKGROUND SCALE
  gray-950   #030712   ← root background (globals.css --background)
  gray-900   #111827   ← card / panel background
  gray-800   #1f2937   ← hover states, table headers, input bg
  gray-700   #374151   ← borders, dividers
  gray-600   #4b5563   ← muted text, labels
  gray-500   #6b7280   ← secondary text
  gray-400   #9ca3af   ← placeholder text
  gray-300   #d1d5db   ← hover text
  gray-200   #e5e7eb   ← light text
  white      #ffffff   ← primary text

PRIMARY — Blue
  blue-600   #2563eb   ← primary buttons, active nav, badges
  blue-500   #3b82f6   ← hover, accents, logo inner
  blue-400   #60a5fa   ← TEE badge text, links
  blue-500/10          ← badge backgrounds
  blue-600/10          ← subtle tints

SEMANTIC COLORS
  green-400  #4ade80   ← confirmed status, savings, live dot
  green-500  #22c55e   ← success states
  green-600  #16a34a   ← success buttons
  yellow-400 #facc15   ← warning, wrong chain
  yellow-500 #eab308   ← pending status
  red-400    #f87171   ← error text
  red-500    #ef4444   ← error borders
  red-600    #dc2626   ← danger buttons (sign out)

FEATURE ACCENT COLORS
  purple-400 #c084fc   ← ZK proof badge
  purple-600 #9333ea   ← ZK badge bg, revenue widget
  indigo-500 #6366f1   ← revenue widget tints
  cyan-400   #22d3ee   ← storage receipts
  rose-400   #fb7185   ← AI route optimization feature
  emerald-400 #34d399  ← on-chain earnings, 2FA enabled
  orange-400 #fb923c   ← MetaMask button
```

### Color Inconsistency Found — Critical

```
PROBLEM: OptimizationAnalytics.tsx uses LIGHT theme colors
  bg-blue-50, bg-green-50, bg-purple-50, text-blue-900, text-green-900
  These are light-mode colors on a dark-mode app (gray-950 background)
  → Cards appear washed out / broken on dark background

PROBLEM: AIOptimizationWidget.tsx uses custom CSS classes
  text-deep-blue, bg-electric-purple, shadow-electric-purple/20
  These are NOT defined in globals.css or tailwind config
  → Falls back to nothing — invisible or default styling

PROBLEM: BlockchainTransactionsWidget.tsx uses border-gray-50
  border-gray-50 = #f9fafb (near-white) on dark background
  → Invisible border — looks like no border at all

PROBLEM: RevenueSharingWidget.tsx uses bg-indigo-500/10 + border-indigo-100
  border-indigo-100 = light mode color
  → Inconsistent with the rest of the dark UI
```

---

## 2 · Current Component Inventory

### ✅ Well-Built (consistent dark theme)

| Component | Quality | Notes |
|---|---|---|
| `Header.tsx` | ✅ Excellent | Sticky, wallet modal, avatar, page titles, wrong-chain warning |
| `Sidebar.tsx` | ✅ Excellent | Active state, 0G stack status, mobile close, network badge |
| `AgentIDCard.tsx` | ✅ Excellent | Soulbound badge, TEE/ZK badges, mint/refresh/reset, fetchingRef guard |
| `Layout.tsx` | ✅ Good | App vs public routing, mobile overlay, responsive |
| `Footer.tsx` | ✅ Good | Standard footer |
| `HeroSection.tsx` | ✅ Good | Landing hero |
| `FeaturesSection.tsx` | ✅ Good | Feature grid |
| `TransactionList.tsx` | ✅ Good | Table with status badges |
| `ErrorBoundary.tsx` | ✅ Good | React error boundary |
| `Tooltip.tsx` | ✅ Good | Accessible tooltip |

### ⚠️ Needs Fixes (color/style inconsistencies)

| Component | Issue | Fix |
|---|---|---|
| `OptimizationAnalytics.tsx` | Light-mode colors (`bg-blue-50`, `text-blue-900`) on dark app | Replace with dark equivalents |
| `AIOptimizationWidget.tsx` | Undefined CSS classes (`text-deep-blue`, `bg-electric-purple`) | Replace with real Tailwind classes |
| `BlockchainTransactionsWidget.tsx` | `border-gray-50` invisible on dark bg | Change to `border-gray-800` |
| `RevenueSharingWidget.tsx` | `border-indigo-100` light-mode border | Change to `border-indigo-500/20` |
| `AIDecisionTree.tsx` | Mixed light/dark (`border-green-500`, `bg-green-50/50`) | Unify to dark theme |
| `ProfileSection.tsx` | Not used in any page — orphaned component | Either use or remove |

---

## 3 · Suggested Color System (Unified)

Define these as a single source of truth in `globals.css`:

```css
/* globals.css — add to :root */
:root {
  /* Backgrounds */
  --bg-root:    #030712;   /* gray-950 */
  --bg-card:    #111827;   /* gray-900 */
  --bg-hover:   #1f2937;   /* gray-800 */
  --bg-input:   #030712;   /* gray-950 */

  /* Borders */
  --border-default: rgba(255,255,255,0.06);
  --border-subtle:  rgba(255,255,255,0.04);
  --border-strong:  #374151;  /* gray-700 */

  /* Text */
  --text-primary:   #ffffff;
  --text-secondary: #6b7280;  /* gray-500 */
  --text-muted:     #4b5563;  /* gray-600 */

  /* Brand */
  --brand-primary:  #2563eb;  /* blue-600 */
  --brand-hover:    #3b82f6;  /* blue-500 */

  /* Semantic */
  --success:  #4ade80;  /* green-400 */
  --warning:  #facc15;  /* yellow-400 */
  --error:    #f87171;  /* red-400 */
  --info:     #60a5fa;  /* blue-400 */

  /* Feature accents */
  --tee:      #3b82f6;  /* blue-500  — 0G Compute */
  --zk:       #9333ea;  /* purple-600 — ZK proofs */
  --storage:  #22c55e;  /* green-500 — 0G Storage */
  --chain:    #2563eb;  /* blue-600  — 0G Chain */
  --escrow:   #06b6d4;  /* cyan-500  — Agent Escrow */
  --revenue:  #6366f1;  /* indigo-500 — Revenue */
}
```

---

## 4 · Suggested New Components

### 4.1 · `StatCard` — Reusable Metric Card

Currently every page hand-codes its own stat cards. Extract to one component:

```tsx
// components/StatCard.tsx
interface StatCardProps {
  label: string
  value: string | number
  change?: string        // e.g. "+12.4%"
  changePositive?: boolean
  accent?: 'blue' | 'green' | 'purple' | 'yellow' | 'cyan'
  icon?: React.ReactNode
}

// Usage:
<StatCard label="Agent Reputation" value={42} change="+3" changePositive accent="blue" />
<StatCard label="Total Savings"    value="$18.85" accent="green" />
<StatCard label="Claimable"        value="0.003 A0GI" accent="purple" />
```

Accent color map:
```
blue   → bg-blue-500/[0.06]   border-blue-500/20   text-blue-400
green  → bg-green-500/[0.06]  border-green-500/20  text-green-400
purple → bg-purple-500/[0.06] border-purple-500/20 text-purple-400
yellow → bg-yellow-500/[0.06] border-yellow-500/20 text-yellow-400
cyan   → bg-cyan-500/[0.06]   border-cyan-500/20   text-cyan-400
```

---

### 4.2 · `Badge` — Reusable Status/Feature Badge

Currently badges are inline everywhere. Extract:

```tsx
// components/Badge.tsx
type BadgeVariant = 'tee' | 'zk' | 'storage' | 'chain' | 'soulbound' |
                   'confirmed' | 'pending' | 'failed' | 'live' | 'coming-soon'

// Suggested colors per variant:
tee        → bg-blue-600        text-white          "0G Compute"
zk         → bg-purple-600      text-white          "ZK Proof"
storage    → bg-green-500/10    text-green-400      "0G Storage"
chain      → bg-blue-500/10     text-blue-400       "0G Chain"
soulbound  → bg-blue-500/10     text-blue-400       "Soulbound"
confirmed  → bg-green-500/10    text-green-400      "Confirmed"
pending    → bg-yellow-500/10   text-yellow-400     "Pending"
failed     → bg-red-500/10      text-red-400        "Failed"
live       → bg-green-400 dot + text-green-400      "● Live"
coming-soon→ bg-gray-700/50     text-gray-500       "Coming Soon"
```

---

### 4.3 · `EmptyState` — Reusable Empty State

Currently every table has its own empty state. Extract:

```tsx
// components/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: { label: string; href?: string; onClick?: () => void }
}

// Usage:
<EmptyState
  title="No transactions yet"
  description="Use the AI Optimizer to get started."
  action={{ label: "Optimize Transaction →", href: "/transactions" }}
/>
```

---

### 4.4 · `PageHeader` — Consistent Page Titles

Some pages have `<h2>` titles, some have `<h1>`, some have none. Standardise:

```tsx
// components/PageHeader.tsx
interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: string        // e.g. "0G Chain"
  action?: React.ReactNode
}

// Usage:
<PageHeader
  title="AI Transaction Optimizer"
  subtitle="TEE-verified optimization via 0G Compute"
  badge="0G Compute"
  action={<button>Fine-tune Model</button>}
/>
```

---

### 4.5 · `OnChainBadge` — 0G Module Indicator

Show which 0G module is active for any action. Already partially done in AgentIDCard — extract:

```tsx
// components/OnChainBadge.tsx
type Module = '0G Compute' | '0G Storage' | '0G Chain' | 'ZK Proof' | 'Agent Escrow'

// Color map:
'0G Compute'  → blue-600 bg, white text
'0G Storage'  → green-500/10 bg, green-400 text
'0G Chain'    → blue-500/10 bg, blue-400 text
'ZK Proof'    → purple-600 bg, white text
'Agent Escrow'→ cyan-500/10 bg, cyan-400 text
```

---

### 4.6 · `LoadingSkeleton` — Consistent Loading States

Currently some components use `animate-pulse h-64 bg-gray-800 rounded-2xl` and some use spinners. Standardise:

```tsx
// components/LoadingSkeleton.tsx
// Variants: card | table | stat | text

// Card skeleton (replaces animate-pulse divs):
<LoadingSkeleton variant="card" rows={3} />

// Stat skeleton:
<LoadingSkeleton variant="stat" count={3} />
```

---

### 4.7 · `NotificationToast` — Already Exists, Enhance It

`NotificationContext.tsx` exists. Suggested improvements:
- Add `duration` prop (default 4000ms, error = 6000ms)
- Add icon per type (✓ success, ⚠ warning, ✕ error, ℹ info)
- Add progress bar that drains over duration
- Stack multiple toasts (currently unclear if it does)

---

## 5 · Suggested Color Fixes Per Component

### `OptimizationAnalytics.tsx` — Fix Light Colors

```
BEFORE                          AFTER
─────────────────────────────────────────────────────
bg-blue-50                  →   bg-blue-500/[0.06]
border-blue-100             →   border-blue-500/20
text-blue-900               →   text-blue-300
text-blue-600               →   text-blue-400

bg-green-50                 →   bg-green-500/[0.06]
border-green-100            →   border-green-500/20
text-green-900              →   text-green-300
text-green-600              →   text-green-400

bg-purple-50                →   bg-purple-500/[0.06]
border-purple-100           →   border-purple-500/20
text-purple-900             →   text-purple-300
text-purple-600             →   text-purple-400

bg-indigo-500/10 (ok)       →   keep
border-indigo-100           →   border-indigo-500/20
text-indigo-300 (ok)        →   keep
```

### `AIOptimizationWidget.tsx` — Fix Undefined Classes

```
BEFORE                          AFTER
─────────────────────────────────────────────────────
text-deep-blue              →   text-white
bg-electric-purple          →   bg-blue-600
hover:bg-purple-600         →   hover:bg-blue-500
shadow-electric-purple/20   →   shadow-blue-600/20
bg-white (card bg)          →   bg-gray-900
border-gray-50              →   border-gray-800
bg-gray-50 (input)          →   bg-gray-800
border-gray-100             →   border-gray-700
bg-green-50/50 (result)     →   bg-green-500/[0.06]
border-green-100            →   border-green-500/20
text-green-800              →   text-green-300
text-deep-blue (result)     →   text-white
```

### `BlockchainTransactionsWidget.tsx` — Fix Invisible Border

```
BEFORE                          AFTER
─────────────────────────────────────────────────────
border-gray-50              →   border-gray-800
bg-green-100 text-green-600 →   bg-green-500/10 text-green-400
bg-yellow-100 text-yellow-600→  bg-yellow-500/10 text-yellow-400
```

### `RevenueSharingWidget.tsx` — Fix Light Borders

```
BEFORE                          AFTER
─────────────────────────────────────────────────────
border-indigo-100           →   border-indigo-500/20
bg-gray-900 (inner cards)   →   bg-gray-800  (needs contrast vs outer)
```

### `AIDecisionTree.tsx` — Fix Mixed Theme

```
BEFORE                          AFTER
─────────────────────────────────────────────────────
bg-green-50/50              →   bg-green-500/[0.06]
border-green-500 (ok)       →   keep
text-green-700              →   text-green-300
bg-white (card bg)          →   bg-gray-900
text-deep-blue              →   text-white
bg-purple-100 text-purple-600→  bg-purple-500/10 text-purple-400
```

---

## 6 · Typography Suggestions

Current font: `Plus Jakarta Sans` (set in globals.css) — good choice, keep it.

```
CURRENT INCONSISTENCIES:
  Some headings use font-black (900)
  Some use font-bold (700)
  Some use font-extrabold (800)
  → Standardise: font-black for display, font-bold for UI

SUGGESTED SCALE:
  Page title (h1):    text-2xl font-black text-white
  Section title (h2): text-base font-bold text-white
  Card title (h3):    text-sm font-bold text-white
  Label:              text-xs font-semibold text-gray-500 uppercase tracking-wider
  Body:               text-sm text-gray-400 leading-relaxed
  Mono (hash/addr):   text-xs font-mono text-gray-300
  Caption:            text-[10px] text-gray-600
```

---

## 7 · Spacing & Border Radius Suggestions

```
CURRENT (inconsistent):
  rounded-2xl  (most cards)
  rounded-[2.5rem] (AIOptimizationWidget — too large)
  rounded-xl   (buttons, inputs)
  rounded-lg   (small elements)
  rounded-full (badges, dots)

SUGGESTED STANDARD:
  Page cards:     rounded-2xl   (24px)
  Inner panels:   rounded-xl    (12px)
  Buttons:        rounded-xl    (12px)
  Inputs:         rounded-xl    (12px)
  Badges:         rounded-full
  Modals:         rounded-2xl
  Sidebar items:  rounded-xl
```

---

## 8 · Missing UI Components (Suggested Additions)

| Component | Where Needed | Priority |
|---|---|---|
| `StatCard` | Dashboard, Revenue, History, Transactions | 🔴 High |
| `Badge` | All pages — status, 0G module indicators | 🔴 High |
| `EmptyState` | All tables when no data | 🟡 Medium |
| `PageHeader` | All app pages | 🟡 Medium |
| `OnChainBadge` | Transactions, Dashboard, History | 🟡 Medium |
| `LoadingSkeleton` | All data-fetching components | 🟡 Medium |
| `ConfirmModal` | Payments, Agent Escrow, Reset Agent ID | 🟡 Medium |
| `CopyButton` | Wallet address, tx hash, contract addresses | 🟢 Low |
| `ChainScanLink` | History, Dashboard, any tx hash | 🟢 Low |
| `NetworkStatus` | Sidebar already has it — expose as standalone | 🟢 Low |
| `WalletConnect` | Already in Header — extract for reuse in pages | 🟢 Low |

---

## 9 · Quick Wins — Highest Impact, Lowest Effort

```
1. Fix OptimizationAnalytics.tsx light colors          → 15 min
   Broken cards on dark background — most visible bug

2. Fix AIOptimizationWidget.tsx undefined CSS classes  → 20 min
   text-deep-blue / bg-electric-purple render nothing

3. Fix BlockchainTransactionsWidget.tsx border-gray-50 → 5 min
   Invisible border

4. Add globals.css utility classes for 0G badges       → 10 min
   .badge-tee .badge-zk .badge-storage .badge-chain

5. Standardise all stat card markup into StatCard.tsx  → 45 min
   Used in 5+ pages — huge consistency win

6. Add WalletConnect button to Payments + OnRamp       → 10 min
   Already exists in Header — just import and reuse
```

---

## 10 · Recommended Tailwind Additions to `globals.css`

```css
/* Add to globals.css @layer utilities */

/* 0G Module badges */
.badge-tee     { @apply bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg; }
.badge-zk      { @apply bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg; }
.badge-storage { @apply bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold px-2.5 py-1 rounded-lg; }
.badge-chain   { @apply bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-1 rounded-lg; }
.badge-escrow  { @apply bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold px-2.5 py-1 rounded-lg; }

/* Status badges */
.badge-confirmed { @apply bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium px-2.5 py-1 rounded-full; }
.badge-pending   { @apply bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-medium px-2.5 py-1 rounded-full; }
.badge-failed    { @apply bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium px-2.5 py-1 rounded-full; }

/* Card variants */
.card           { @apply bg-gray-900 border border-gray-800 rounded-2xl; }
.card-hover     { @apply bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors; }
.card-accent-blue   { @apply bg-blue-500/[0.06] border border-blue-500/20 rounded-2xl; }
.card-accent-green  { @apply bg-green-500/[0.06] border border-green-500/20 rounded-2xl; }
.card-accent-purple { @apply bg-purple-500/[0.06] border border-purple-500/20 rounded-2xl; }

/* Input standard */
.input { @apply w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all; }

/* Button variants */
.btn-primary   { @apply px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-sm; }
.btn-secondary { @apply px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all text-sm; }
.btn-danger    { @apply px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold rounded-xl transition-all text-sm; }
.btn-ghost     { @apply px-4 py-2.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-all text-sm; }

/* Live indicator */
.live-dot { @apply w-2 h-2 bg-green-400 rounded-full animate-pulse; }
```

---

<div align="center">

**SmartChain Hub** · UI Audit · 0G APAC Hackathon 2026

*Fix the 3 broken components first — they are the most visible issues.*

`#BuildOn0G` · `#AgenticEconomy`

</div>
