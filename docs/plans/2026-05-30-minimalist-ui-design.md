# Design Document: Minimalist & Clean UI Style (No Gradients)

## 1. Goal & Context
The user wants the VKU Score UI to look premium, beautiful, and easier to use, while completely avoiding gradients ("nói không với gradient"). We will shift to a high-quality "Minimalist & Clean" style utilizing subtle borders, flat solid brand colors (e.g. Cobalt Blue / Violet), elevated shadow depth, rounded corners, and cleaner spacing.

## 2. Proposed Changes

### A. Logo & Header
In `src/core/layout/Header.tsx`:
* Replace the `bg-gradient-to-r` text gradient on "VKU Score" with a solid color:
  * Light mode: `text-blue-600`
  * Dark mode: `text-blue-400`
* Remove `bg-clip-text` and `text-transparent`.

### B. Action Floating Action Button (FAB)
In `src/components/action-buttons.tsx`:
* Replace the `bg-gradient-to-r from-violet-600 to-indigo-600` classes on the "Gợi ý cải thiện học phần" button with:
  * Solid background: `bg-blue-600 hover:bg-blue-700`
  * Add a subtle border if needed, and a clean flat shadow (`shadow-md hover:shadow-lg`).
  * Ensure hover zoom is kept (`hover:scale-105 active:scale-95 transition-all`).

### C. Cards & Containers
Throughout all view files (`main-view.tsx`, `score-table.tsx`, `upload-file.tsx`):
* Ensure card border is thin and subtle (`border-border/30` or `border-slate-200/50` / `dark:border-zinc-800/50`).
* Use flat background values (e.g., `bg-card/70` in light, `bg-card/40` in dark with backdrop blur).
* Soft shadows: `shadow-xs hover:shadow-sm` or similar.

### D. Table Formatting
In `src/components/score-table.tsx` and `src/components/recommend-dialog.tsx`:
* Clean up the table rows:
  * Make row padding slightly larger for breathing room.
  * For edited rows (where changes have been made), add a subtle solid border-left highlight: `border-l-4 border-l-emerald-500` along with a very light solid background highlight (`bg-emerald-500/5 dark:bg-emerald-500/10`).
  * Remove vertical borders (`border-r`) between columns inside the table body to make it look clean and modern. Only keep horizontal borders (`border-b`).
  * Update table header to have a clean, light solid border.

## 3. Verification Plan
* Run `npm run build` to confirm compilation is error-free.
* Manually inspect the UI at `http://localhost:3000/vku-score-v3` to ensure that:
  1. No text or button has a gradient background.
  2. The table looks cleaner without vertical cell borders.
  3. Edited rows highlight with a solid left green accent line.
  4. The general aesthetic is polished, clean, and minimalist.
