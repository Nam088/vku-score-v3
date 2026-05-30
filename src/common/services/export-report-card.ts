import { IScore } from '@/common/interfaces/score';
import { calculateGPA } from './gpa.service';

export function exportReportCardPNG(scores: IScore[]) {
    const stats = calculateGPA(scores);
    const { gpa, gpaNew, difference, allTinChi } = stats;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 1. Vẽ nền tối Canvas
    ctx.fillStyle = '#121214'; // Zinc-950
    ctx.fillRect(0, 0, 800, 600);

    // 2. Vẽ khung bo tròn chứa nội dung
    ctx.fillStyle = '#1c1c1f'; // Zinc-900 (softer than background)
    ctx.strokeStyle = '#2d2d30'; // border Zinc-800
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(40, 40, 720, 520, 16);
    ctx.fill();
    ctx.stroke();

    // 3. Tiêu đề ứng dụng
    ctx.fillStyle = '#60a5fa'; // Blue-400
    ctx.font = 'bold 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('VKU SCORE REPORT CARD', 70, 95);

    ctx.fillStyle = '#e4e4e7'; // Zinc-200
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Bảng Điểm Giả Lập Học Tập', 70, 122);

    const dateStr = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    ctx.fillStyle = '#71717a'; // Zinc-500
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`Thời gian xuất: ${dateStr}`, 70, 144);

    // 4. Đường gạch ngăn cách
    ctx.strokeStyle = '#2d2d30';
    ctx.beginPath();
    ctx.moveTo(70, 168);
    ctx.lineTo(730, 168);
    ctx.stroke();

    // 5. Vẽ 3 ô thống kê
    // Ô 1: GPA Gốc (x: 70, y: 190, w: 200, h: 100)
    ctx.fillStyle = '#222226';
    ctx.beginPath();
    ctx.roundRect(70, 190, 200, 100, 12);
    ctx.fill();
    ctx.strokeStyle = '#2d2d30';
    ctx.stroke();

    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('GPA TÍCH LŨY GỐC', 90, 218);
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'extrabold 32px system-ui, sans-serif';
    ctx.fillText(gpa.toFixed(2), 90, 260);

    // Ô 2: GPA Giả lập (x: 290, y: 190, w: 200, h: 100)
    ctx.fillStyle = '#222226';
    ctx.beginPath();
    ctx.roundRect(290, 190, 200, 100, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('GPA GIẢ LẬP MỚI', 310, 218);
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'extrabold 32px system-ui, sans-serif';
    ctx.fillText(gpaNew.toFixed(2), 310, 260);

    // Ô 3: Chênh lệch & Tín chỉ (x: 510, y: 190, w: 220, h: 100)
    ctx.fillStyle = '#222226';
    ctx.beginPath();
    ctx.roundRect(510, 190, 220, 100, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('GPA CHÊNH LỆCH', 530, 218);
    ctx.fillStyle = '#34d399';
    ctx.font = 'extrabold 32px system-ui, sans-serif';
    const diffText = (difference >= 0 ? '+' : '') + difference.toFixed(3);
    ctx.fillText(diffText, 530, 260);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'normal 11px system-ui, sans-serif';
    ctx.fillText(`Tổng tín chỉ: ${allTinChi}`, 530, 276);

    // 6. Đường gạch ngăn cách tiếp theo
    ctx.strokeStyle = '#2d2d30';
    ctx.beginPath();
    ctx.moveTo(70, 315);
    ctx.lineTo(730, 315);
    ctx.stroke();

    // 7. Vẽ danh sách các học phần cải thiện hoặc giả lập mới
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('DANH SÁCH MÔN HỌC THAY ĐỔI & GIẢ LẬP:', 70, 342);

    // Lọc ra các môn học được thay đổi hoặc giả lập
    const changedScores = scores.filter(s =>
        (s.scoreChChange !== null && s.scoreCh !== s.scoreChChange) ||
        (s.scoreT10Original !== undefined) ||
        (s.name.includes('Môn giả lập'))
    );

    let startY = 378;
    const maxDraw = 6;
    const itemsToDraw = changedScores.slice(0, maxDraw);

    ctx.font = '12px system-ui, sans-serif';
    
    itemsToDraw.forEach((s) => {
        const fromGrade = s.scoreChOriginal || s.scoreCh || 'F';
        const toGrade = s.scoreChChange || s.scoreCh || 'A';
        const isSimulatedOnly = s.name.includes('Môn giả lập');

        ctx.fillStyle = '#d4d4d8';
        // Rút gọn tên nếu quá dài
        const displayName = s.name.length > 40 ? s.name.substring(0, 37) + '...' : s.name;
        ctx.fillText(`• ${displayName} (${s.countTC} TC)`, 80, startY);

        ctx.fillStyle = isSimulatedOnly ? '#34d399' : '#60a5fa';
        const statusText = isSimulatedOnly ? `[Simulate Mới: ${toGrade}]` : `[Cải thiện: ${fromGrade} → ${toGrade}]`;
        
        ctx.textAlign = 'right';
        ctx.fillText(statusText, 720, startY);
        ctx.textAlign = 'left'; // Trả lại mặc định

        startY += 26;
    });

    if (changedScores.length > maxDraw) {
        ctx.fillStyle = '#71717a';
        ctx.fillText(`... và ${changedScores.length - maxDraw} học phần khác được cập nhật.`, 80, startY);
    } else if (changedScores.length === 0) {
        ctx.fillStyle = '#71717a';
        ctx.fillText('Chưa có học phần nào được thay đổi hoặc giả lập.', 80, startY);
    }

    // 8. Chữ ký thương hiệu ở cuối
    ctx.fillStyle = '#52525b';
    ctx.font = 'italic 11px system-ui, sans-serif';
    ctx.fillText('VKU GPA Calculator v3 - Phát triển bởi Antigravity AI', 70, 535);

    // 9. Xuất file PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `VKU-Score-Report-${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
}
