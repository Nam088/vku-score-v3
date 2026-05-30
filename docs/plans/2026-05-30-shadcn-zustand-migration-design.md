# Tài liệu thiết kế: Di chuyển sang Shadcn UI & Zustand, Tối ưu cấu trúc & Hiệu năng dự án VKU Score v3

## 1. Mục tiêu (Goals)
* Nâng cấp dự án lên các phiên bản package mới nhất (**Next.js 15**, **React 19**, và các dependencies đi kèm).
* Thay thế toàn bộ Material UI (MUI) bằng **Shadcn UI** và **Tailwind CSS**.
* Thay đổi state management từ React Context hiện tại sang **Zustand** kết hợp cơ chế persist lưu trữ local.
* Tối ưu hiệu năng tải trang bằng cách chuyển file dữ liệu hồi quy tuyến tính `linear.ts` (2.2MB) sang chạy trên **Server-side API Route** của Next.js, tránh đưa vào JS bundle chính ở client.
* Tối ưu hiệu năng render danh sách bảng điểm bằng cách khử vòng lặp $O(N^2)$ khi nhóm theo học kỳ.
* Chuẩn hóa cấu trúc thư mục dự án theo chuẩn dễ duy trì (maintain).

## 2. Kiến trúc & Cấu trúc thư mục mới
Dự án sẽ được tái cấu trúc theo sơ đồ sau:
```text
src/
├── app/
│   ├── api/
│   │   └── recommend/
│   │       └── route.ts         # Next.js API Route xử lý dự đoán hồi quy
│   ├── layout.tsx               # Next.js Root Layout, tích hợp ThemeProvider & Sonner
│   ├── page.tsx                 # Trang chính render MainView
│   └── globals.css              # CSS toàn cục tích hợp Tailwind CSS
├── components/
│   ├── ui/                      # Primitive components của Shadcn
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── toast.tsx
│   ├── gpa-display.tsx          # Hiển thị GPA (layout premium, hỗ trợ chế độ sáng/tối)
│   ├── score-table.tsx          # Bảng điểm nhóm theo học kỳ (đã tối ưu render O(N))
│   ├── upload-file.tsx          # Kéo thả file JSON nhập điểm
│   ├── add-score-dialog.tsx     # Form thêm môn học sử dụng react-hook-form + zod
│   ├── recommend-dialog.tsx     # Bảng gợi ý cải thiện học phần lấy dữ liệu từ API
│   ├── action-buttons.tsx       # Nút Fab nổi góc màn hình hỗ trợ dark/light toggle
│   └── tutorial-dialog.tsx      # Hướng dẫn cào điểm từ cổng đào tạo
├── store/
│   └── useScoreStore.ts         # Zustand store lưu trữ bảng điểm & toggle UI
├── lib/
│   ├── calculate-gpa.ts         # Hàm tính toán GPA
│   ├── linear-data.ts           # Object hồi quy gốc (chỉ chạy trên Server)
│   └── utils.ts                 # Hàm helper của dự án và shadcn (cn, v.v.)
```

## 3. Quản lý trạng thái với Zustand Store
Store sẽ lưu giữ:
* `scores: IScore[]`
* `dialogs: { addScore: boolean, tutorial: boolean, recommend: boolean }`
* `toggleUploadFile: boolean`
* Các actions: `addScore`, `updateScore`, `deleteScore`, `changeScoreCh`, `changeScoreT10`, `resetScores`, `setScores`, `toggleDialog`.
* Sử dụng middleware `persist` của Zustand để đồng bộ dữ liệu vào `localStorage` tự động.

## 4. Tối ưu hiệu năng & API Route
* **API Route (`src/app/api/recommend/route.ts`):** Tiếp nhận danh sách điểm qua phương thức POST, thực hiện tính toán hồi quy bằng thuật toán của nhóm dựa trên dữ liệu server `src/lib/linear-data.ts`. Client chỉ việc fetch dữ liệu dạng JSON. Bundle JS của Client sẽ giảm được 2.2MB.
* **Tối ưu bảng điểm:** Nhóm danh sách `table.getRowModel().rows` theo học kỳ một lần duy nhất trước khi render thay vì chạy filter lặp lại cho từng học phần, chuyển đổi độ phức tạp từ $O(N^2)$ xuống $O(N)$.

## 5. Giao diện & Trải nghiệm Người dùng
* Hỗ trợ đầy đủ Light/Dark mode mượt mà thông qua `next-themes` và Tailwind CSS.
* Sử dụng font chữ hiện đại (Inter/Outfit) tải tự động bằng `next/font`.
* Áp dụng các micro-animations cho nút bấm và hiệu ứng chuyển đổi trạng thái.

## 6. Kế hoạch xác thực (Verification Plan)
* Khởi chạy dự án local bằng `npm run dev` để kiểm tra khả năng biên dịch không lỗi của Next.js 15 và React 19.
* Xác thực upload file JSON điểm mẫu thành công.
* Kiểm tra thay đổi điểm chữ / điểm hệ 10 lập tức cập nhật GPA mới chính xác.
* Kiểm tra chức năng gọi API `/api/recommend` trả về các học phần đề xuất cải thiện chuẩn xác.
