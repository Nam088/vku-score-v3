import { IScore, ScoreCh } from '@/common/interfaces/score';
import { linearData } from '@/lib/linear-data';

const gpaMap: Record<ScoreCh, number> = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'F': 0.0,
};

interface ResultItem {
    id: number;
    name: string;
    scorePredict: number;
    scoreT10: number;
    difference: number;
    scoreCh: string;
    countTC: string;
}

export function getRecommendationsLocal(scores: IScore[]): (IScore & { difference: number; scorePredict: number })[] {
    const result: Record<string, ResultItem> = {};
    const recommendHocPhan: (IScore & { difference: number; scorePredict: number })[] = [];

    for (let i = 0; i < scores.length; i++) {
        if (scores[i].scoreT10 == null) continue;
        let count = 0;
        let sum = 0;
        const nameSubjectY = scores[i].name;

        for (let j = 0; j < scores.length; j++) {
            if (scores[j].scoreT10 == null) continue;
            const nameSubjectX = scores[j].name;
            
            if (linearData[nameSubjectY] !== undefined) {
                if (linearData[nameSubjectY][nameSubjectX] !== undefined) {
                    if (linearData[nameSubjectY][nameSubjectX].static === 'True') {
                        const slope = linearData[nameSubjectY][nameSubjectX].slope;
                        const intercept = linearData[nameSubjectY][nameSubjectX].intercept;
                        const scoreX = parseFloat((scores[j].scoreT10 || '0') as string);
                        const scoreY = parseFloat(slope) * scoreX + parseFloat(intercept);
                        count++;
                        sum = sum + scoreY;
                    }
                }
            }
        }
        
        const meanScoreY = count === 0 ? 0 : sum / count;
        result[nameSubjectY] = {
            id: scores[i].id,
            name: scores[i].name,
            scorePredict: meanScoreY,
            scoreT10: scores[i].scoreT10 || 0,
            difference: meanScoreY - (scores[i].scoreT10 || 0),
            scoreCh: scores[i].scoreCh || '',
            countTC: (scores[i].countTC || '') as string,
        };
    }

    for (const subject in result) {
        const scoreItem = scores.find((s) => s.name === subject);
        if (scoreItem) {
            recommendHocPhan.push({
                ...scoreItem,
                difference: result[subject].difference,
                scorePredict: result[subject].scorePredict,
            });
        }
    }

    recommendHocPhan.sort((a, b) => b.difference - a.difference);
    
    // Chỉ trả về các học phần có tiềm năng tăng điểm (> 0)
    return recommendHocPhan.filter((score) => score.difference > 0);
}
