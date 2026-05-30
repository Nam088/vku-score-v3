import { IScore, ScoreCh } from '@/common/interfaces/score';
import { calculateGPA } from './gpa.service';

const gpaMap: Record<ScoreCh, number> = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'F': 0.0,
};

export interface ITargetRecommendation {
    id: number;
    name: string;
    countTC: number;
    fromGrade: ScoreCh;
    toGrade: ScoreCh;
    pointsGained: number;
}

export interface ITargetGpaResult {
    isPossible: boolean;
    alreadyMet: boolean;
    recommendations: ITargetRecommendation[];
    projectedGpa: number;
    maxPossibleGpa: number;
}

export function calculateTargetGpa(
    scores: IScore[],
    targetGpa: number
): ITargetGpaResult {
    const stats = calculateGPA(scores);
    const currentGpa = stats.gpaNew;

    if (scores.length === 0) {
        return { isPossible: false, alreadyMet: false, recommendations: [], projectedGpa: 0, maxPossibleGpa: 0 };
    }

    if (currentGpa >= targetGpa) {
        return { isPossible: true, alreadyMet: true, recommendations: [], projectedGpa: currentGpa, maxPossibleGpa: 4.0 };
    }

    // Calculate maximum possible GPA (all non-null grades improved to A)
    let maxPoints = 0;
    let totalCredits = 0;
    for (const s of scores) {
        const credits = s.countTC || 0;
        const currentGrade = s.scoreChChange || s.scoreCh;
        if (currentGrade !== null) {
            maxPoints += 4.0 * credits;
            totalCredits += credits;
        }
    }
    const maxPossibleGpa = totalCredits === 0 ? 0.0 : maxPoints / totalCredits;

    if (targetGpa > maxPossibleGpa) {
        return { isPossible: false, alreadyMet: false, recommendations: [], projectedGpa: currentGpa, maxPossibleGpa };
    }

    // Identify courses that can be improved (grade < A)
    const subjects = scores
        .filter(s => {
            const currentGrade = s.scoreChChange || s.scoreCh;
            return currentGrade !== null && currentGrade !== 'A';
        })
        .map(s => {
            const currentGrade = (s.scoreChChange || s.scoreCh) as ScoreCh;
            const currentVal = gpaMap[currentGrade];
            const maxVal = 4.0;
            const credits = s.countTC || 0;
            return {
                score: s,
                currentGrade,
                currentVal,
                credits,
                maxGain: credits * (maxVal - currentVal)
            };
        });

    // Sort by maxGain descending (highest GPA impact first), then by credits descending, then by current value ascending (F before D, etc.)
    subjects.sort((a, b) => {
        if (b.maxGain !== a.maxGain) return b.maxGain - a.maxGain;
        if (b.credits !== a.credits) return b.credits - a.credits;
        return a.currentVal - b.currentVal;
    });

    const recommendations: ITargetRecommendation[] = [];
    let currentSimulatedPoints = 0;
    let totalSimulatedCredits = 0;

    for (const s of scores) {
        const credits = s.countTC || 0;
        const currentGrade = s.scoreChChange || s.scoreCh;
        if (currentGrade !== null) {
            currentSimulatedPoints += gpaMap[currentGrade as ScoreCh] * credits;
            totalSimulatedCredits += credits;
        }
    }

    let currentSimulatedGpa = currentSimulatedPoints / totalSimulatedCredits;
    let index = 0;

    while (currentSimulatedGpa < targetGpa && index < subjects.length) {
        const subj = subjects[index];
        const credits = subj.credits;
        const fromVal = subj.currentVal;

        // Upgrade to 'A' as initial greedy step
        const toGrade: ScoreCh = 'A';
        const toVal = gpaMap[toGrade];

        currentSimulatedPoints += (toVal - fromVal) * credits;
        currentSimulatedGpa = currentSimulatedPoints / totalSimulatedCredits;

        recommendations.push({
            id: subj.score.id,
            name: subj.score.name,
            countTC: credits,
            fromGrade: subj.currentGrade,
            toGrade,
            pointsGained: (toVal - fromVal) * credits
        });

        index++;
    }

    // Optimize the last upgraded subject if we overshot the target
    if (recommendations.length > 0) {
        const lastRec = recommendations[recommendations.length - 1];
        const lastSubj = subjects[index - 1];
        const credits = lastSubj.credits;
        const fromVal = lastSubj.currentVal;

        // Subtract the full A upgrade points
        currentSimulatedPoints -= (gpaMap['A'] - fromVal) * credits;

        // Test lower grades: D, C, B, A in order
        const possibleGrades: ScoreCh[] = ['D', 'C', 'B', 'A'];
        for (const grade of possibleGrades) {
            const val = gpaMap[grade];
            if (val > fromVal) { // must be an improvement
                const testPoints = currentSimulatedPoints + (val - fromVal) * credits;
                const testGpa = testPoints / totalSimulatedCredits;
                if (testGpa >= targetGpa) {
                    lastRec.toGrade = grade;
                    lastRec.pointsGained = (val - fromVal) * credits;
                    currentSimulatedPoints = testPoints;
                    currentSimulatedGpa = testGpa;
                    break;
                }
            }
        }
    }

    return {
        isPossible: true,
        alreadyMet: false,
        recommendations,
        projectedGpa: currentSimulatedGpa,
        maxPossibleGpa
    };
}
