# Minimalist UI Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Modify the VKU Score application's styling to apply a clean, minimalist UI without gradients.

**Architecture:** Replace existing text and button gradients with solid premium colors. Clean up table cell dividers (removing vertical borders) and add a solid left accent border for edited rows.

**Tech Stack:** Next.js, Tailwind CSS, Lucide Icons.

---

### Task 1: Clean Header logo and FAB button styles

**Files:**
- Modify: `src/core/layout/Header.tsx`
- Modify: `src/components/action-buttons.tsx`

**Step 1: Edit Header.tsx**
Remove the gradient classes on the VKU Score title. Make it:
`className="font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400"`

**Step 2: Edit action-buttons.tsx**
Replace `bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700` with:
`bg-blue-600 hover:bg-blue-700` (flat solid blue).

**Step 3: Verify Build**
Run: `npm run build`
Expected: PASS

**Step 4: Commit**
```bash
git add src/core/layout/Header.tsx src/components/action-buttons.tsx
git commit -m "style: remove gradients from Header logo and Improvement FAB"
```

---

### Task 2: Clean ScoreTable lines and highlights

**Files:**
- Modify: `src/components/score-table.tsx`

**Step 1: Remove vertical borders inside the table**
In `score-table.tsx`, remove `border-r last:border-0` classes from `TableCell` elements to clean up vertical dividers. Keep horizontal dividers.

**Step 2: Add left accent border highlight for edited rows**
* In `getRowBgColor(row)`:
  * For edited rows, return: `border-l-4 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 hover:bg-emerald-500/15`
  * Add transition support for borders: make sure the `TableRow` has `border-l-4 border-l-transparent` by default, or just apply it inside `TableRow` className wrapper.
  * Wait, to prevent row shifts when `border-l-4` is applied dynamically, the default rows should have `border-l-4 border-l-transparent`.

**Step 3: Verify Build**
Run: `npm run build`
Expected: PASS

**Step 4: Commit**
```bash
git add src/components/score-table.tsx
git commit -m "style: clean ScoreTable lines and add solid left border for edited rows"
```

---

### Task 3: Clean RecommendDialog lines and highlights

**Files:**
- Modify: `src/components/recommend-dialog.tsx`

**Step 1: Remove vertical borders inside Table cells**
In `recommend-dialog.tsx`, remove `border-r last:border-0` classes from `TableCell` elements.

**Step 2: Add left accent border highlight for edited rows**
* Update `getRowBgColor` in `recommend-dialog.tsx` to match the style:
  * Edited rows: `border-l-4 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 hover:bg-emerald-500/15`
  * Default rows: `border-l-4 border-l-transparent`

**Step 3: Verify Build**
Run: `npm run build`
Expected: PASS

**Step 4: Commit**
```bash
git add src/components/recommend-dialog.tsx
git commit -m "style: clean RecommendDialog lines and add solid left border for edited rows"
```
