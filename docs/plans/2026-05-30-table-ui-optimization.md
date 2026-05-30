# Table UI Optimization Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Optimize the VKU Score table width and styling to make it look full-width/spacious and wrap long subject names gracefully.

**Architecture:** Increase main container max-width from `max-w-7xl` to `max-w-[1440px]`. Override table cell wrap settings for subject names to allow wrapping up to two lines, and enforce narrow widths for numbers and action columns.

**Tech Stack:** Next.js, Tailwind CSS, React.

---

### Task 1: Expand Layout Max Width

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Edit layout.tsx**
Modify the class on the `main` tag to use `max-w-[1440px]` instead of `max-w-7xl`.

**Step 2: Verify Build**
Run: `npm run build`
Expected: PASS

**Step 3: Commit**
```bash
git add src/app/layout.tsx
git commit -m "style: expand layout container max-width to 1440px"
```

---

### Task 2: Optimize ScoreTable Columns Sizing and Wrapping

**Files:**
- Modify: `src/components/score-table.tsx`

**Step 1: Edit score-table.tsx column accessor cell renderers**
* Change the `name` column cell renderer to use a wrapper div with `min-w-[200px] max-w-[350px] whitespace-normal break-words line-clamp-2` instead of `truncate` and `max-w-xs`.
* Change other column definitions to set header/cell className with fixed width classes to keep them compact (e.g. `w-14`, `w-20`, `text-center`).

**Step 2: Verify Build**
Run: `npm run build`
Expected: PASS

**Step 3: Commit**
```bash
git add src/components/score-table.tsx
git commit -m "style: optimize ScoreTable columns wrapping and sizing"
```

---

### Task 3: Optimize RecommendDialog Columns Sizing and Wrapping

**Files:**
- Modify: `src/components/recommend-dialog.tsx`

**Step 1: Edit recommend-dialog.tsx table layout**
* Update the name cell display to use a wrapper div with `min-w-[200px] max-w-[350px] whitespace-normal break-words line-clamp-2` and `text-left`.
* Set narrow widths/alignment for numerical columns (`w-14`, `w-20`, `text-center`).

**Step 2: Verify Build**
Run: `npm run build`
Expected: PASS

**Step 3: Commit**
```bash
git add src/components/recommend-dialog.tsx
git commit -m "style: optimize RecommendDialog table columns wrapping and sizing"
```
