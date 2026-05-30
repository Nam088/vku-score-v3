# Design Document: Table UI Optimization

## 1. Goal & Context
The current VKU Score table is too narrow on widescreen monitors, and long subject names (e.g. "Tiếng Anh chuyên ngành 1 IT") are truncated or force the table to look cramped. The user wants the layout to be cleaner, full-width (or wider), and to wrap long subject names elegantly.

## 2. Proposed Changes

### A. Main Container Layout
Modify `src/app/layout.tsx` to change the main container's maximum width from `max-w-7xl` (1280px) to `max-w-[1440px]`. This gives the table more horizontal space.

### B. Table Component Styling
In `src/components/score-table.tsx` and `src/components/recommend-dialog.tsx`:
* Modify the **Subject Name** column (`name` accessor) cell renderer to:
  * Remove `truncate`.
  * Set a minimum width and maximum width (`min-w-[200px] max-w-[350px]`).
  * Add classes: `whitespace-normal break-words line-clamp-2` so names can wrap up to 2 lines cleanly.
* Add explicit widths to utility columns to keep them compact and centered:
  * **ID**: `w-[60px]`
  * **Tín chỉ** & **Lần học**: `w-[70px]`
  * **Score fields** (Chuyên cần, Bài tập, Giữa kỳ, Cuối kỳ, Điểm hệ 10, Điểm chữ): `w-[85px]`
  * **Thay đổi**: `w-[100px]`
  * **Hành động**: `w-[90px]`

### C. Standard Table Styling Customization
In `src/components/ui/table.tsx`:
* `TableHead` and `TableCell` have `whitespace-nowrap`.
* We will override this by explicitly applying `whitespace-normal` or custom widths to columns where wrapping is expected.

## 3. Verification Plan
* Verify that the Next.js production build (`npm run build`) is successful.
* Manually inspect the table in the browser at `http://localhost:3000/vku-score-v3` to ensure that:
  1. The layout is wider and uses space more efficiently.
  2. Long subject names wrap onto a second line instead of being cut off or pushing other columns away.
  3. Utility columns stay centered and compact.
