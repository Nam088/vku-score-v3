import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IScore, ScoreCh } from '@/common/interfaces/score';

/** Strip internal change-tracking fields that should never be persisted */
const sanitizeScore = ({ scoreT10Original, scoreChOriginal, ...s }: IScore): IScore => s;

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
                scores: state.scores.map((s) => {
                    if (s.id === row.id) {
                        if (newValue === null) {
                            const restoredT10 = s.scoreT10Original !== undefined ? s.scoreT10Original : s.scoreT10;
                            const restoredCh = s.scoreChOriginal !== undefined ? s.scoreChOriginal : s.scoreCh;
                            const updated = {
                                ...s,
                                scoreT10: restoredT10,
                                scoreCh: restoredCh,
                                scoreChChange: null,
                            };
                            delete updated.scoreT10Original;
                            delete updated.scoreChOriginal;
                            return updated;
                        } else {
                            return {
                                ...s,
                                scoreChChange: newValue === s.scoreCh ? null : newValue,
                            };
                        }
                    }
                    return s;
                }),
            })),
            changeScoreT10: (row, newValue) => set((state) => {
                if (isNaN(newValue)) return {};

                const convertT10ToCh = (t10: number): ScoreCh => {
                    if (t10 >= 8.5) return 'A';
                    if (t10 >= 7.0) return 'B';
                    if (t10 >= 5.5) return 'C';
                    if (t10 >= 4.0) return 'D';
                    return 'F';
                };
                const newScoreCh = convertT10ToCh(newValue);

                return {
                    scores: state.scores.map((s) => {
                        if (s.id === row.id) {
                            const backupT10 = s.scoreT10Original !== undefined ? s.scoreT10Original : s.scoreT10;
                            const backupCh = s.scoreChOriginal !== undefined ? s.scoreChOriginal : s.scoreCh;
                            return {
                                ...s,
                                scoreT10Original: backupT10,
                                scoreChOriginal: backupCh,
                                scoreT10: newValue,
                                scoreCh: newScoreCh,
                                scoreChChange: null,
                            };
                        }
                        return s;
                    }),
                };
            }),
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
            // Bump version to trigger migration → cleans stale scoreT10Original/scoreChOriginal from existing localStorage
            version: 2,
            migrate: (persisted: any, version) => {
                // Migrate from any old version: strip ephemeral fields from all saved scores
                if (persisted && Array.isArray(persisted.scores)) {
                    persisted.scores = persisted.scores.map(sanitizeScore);
                }
                return persisted as ScoreState;
            },
            partialize: (state) => ({
                // Always strip ephemeral change-tracking fields before saving
                scores: state.scores.map(sanitizeScore),
                toggleUploadFile: state.toggleUploadFile,
            }),
        }
    )
);
