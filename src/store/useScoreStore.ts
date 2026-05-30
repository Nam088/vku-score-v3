import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IScore, ScoreCh } from '@/common/interfaces/score';

interface ScoreState {
    scores: IScore[];
    dialogs: {
        addScore: boolean;
        tutorial: boolean;
        recommend: boolean;
    };
    toggleUploadFile: boolean;
    addScore: (score: IScore) => void;
    updateScore: (id: number, updatedScore: IScore) => void;
    deleteScore: (id: number) => void;
    changeScoreCh: (row: IScore, newValue: ScoreCh | null) => void;
    changeScoreT10: (row: IScore, newValue: number) => void;
    setScores: (scores: IScore[]) => void;
    resetScores: () => void;
    toggleDialog: (type: keyof ScoreState['dialogs']) => void;
    setToggleUploadFile: (value: boolean) => void;
}

export const useScoreStore = create<ScoreState>()(
    persist(
        (set) => ({
            scores: [],
            dialogs: {
                addScore: false,
                tutorial: false,
                recommend: false,
            },
            toggleUploadFile: true,
            addScore: (score) => set((state) => {
                if (state.scores.some((s) => s.name === score.name)) return state;
                const ids = state.scores.map((s) => s.id);
                const maxId = ids.length > 0 ? Math.max(...ids) : 0;
                const newScore = { ...score, id: maxId + 1 };
                return { scores: [...state.scores, newScore] };
            }),
            updateScore: (id, updatedScore) => set((state) => ({
                scores: state.scores.map((s) => (s.id === id ? updatedScore : s)),
            })),
            deleteScore: (id) => set((state) => ({
                scores: state.scores.filter((s) => s.id !== id),
            })),
            changeScoreCh: (row, newValue) => set((state) => ({
                scores: state.scores.map((s) =>
                    s.id === row.id
                        ? { ...s, scoreChChange: newValue === s.scoreCh ? null : newValue }
                        : s
                ),
            })),
            changeScoreT10: (row, newValue) => set((state) => ({
                scores: state.scores.map((s) =>
                    s.id === row.id ? { ...s, scoreT10: newValue } : s
                ),
            })),
            setScores: (scores) => set(() => ({
                scores,
                toggleUploadFile: scores.length === 0,
            })),
            resetScores: () => set(() => ({
                scores: [],
                toggleUploadFile: true,
            })),
            toggleDialog: (type) => set((state) => ({
                dialogs: { ...state.dialogs, [type]: !state.dialogs[type] },
            })),
            setToggleUploadFile: (value) => set(() => ({
                toggleUploadFile: value,
            })),
        }),
        {
            name: 'scoreState-zustand',
            partialize: (state) => ({
                scores: state.scores,
                toggleUploadFile: state.toggleUploadFile,
            }),
        }
    )
);
