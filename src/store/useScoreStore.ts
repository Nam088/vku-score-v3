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
        targetGpa: boolean;
        addSemester: boolean;
    };
    toggleUploadFile: boolean;
    addScore: (score: IScore) => void;
    updateScore: (id: number, updatedScore: IScore) => void;
    deleteScore: (id: number) => void;
    changeScoreCh: (row: IScore, newValue: ScoreCh | null) => void;
    changeScoreT10: (row: IScore, newValue: number) => void;
    setScores: (scores: IScore[]) => void;
    resetScores: () => void;
    resetAllChanges: () => void;
    toggleDialog: (type: keyof ScoreState['dialogs']) => void;
    setToggleUploadFile: (value: boolean) => void;
    addVirtualSemester: (semesterName: string, numCourses: number) => void;
}

export const useScoreStore = create<ScoreState>()(
    persist(
        (set) => ({
            scores: [],
            dialogs: {
                addScore: false,
                tutorial: false,
                recommend: false,
                targetGpa: false,
                addSemester: false,
            },
            toggleUploadFile: true,
            addVirtualSemester: (semesterName, numCourses) => set((state) => {
                const ids = state.scores.map((s) => s.id);
                let maxId = ids.length > 0 ? Math.max(...ids) : 0;
                const newScores: IScore[] = [];

                for (let i = 1; i <= numCourses; i++) {
                    maxId++;
                    const name = `Môn giả lập ${i} (${semesterName})`;
                    // Tránh trùng tên
                    if (state.scores.some((s) => s.name === name)) continue;

                    newScores.push({
                        id: maxId,
                        value: name,
                        name,
                        countTC: 3,
                        countLH: 1,
                        scoreCC: 10,
                        scoreBT: 10,
                        scoreGK: 10,
                        scoreCK: 10,
                        scoreT10: 10,
                        scoreCh: 'A',
                        scoreChChange: null,
                        semester: semesterName,
                    });
                }

                if (newScores.length === 0) return {};
                return {
                    scores: [...state.scores, ...newScores],
                    toggleUploadFile: false,
                };
            }),
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
                            const restoredT10 = s.scoreT10Original != null ? s.scoreT10Original : s.scoreT10;
                            const restoredCh = s.scoreChOriginal != null ? s.scoreChOriginal : s.scoreCh;
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

                return {
                    scores: state.scores.map((s) => {
                        if (s.id === row.id) {
                            const originalT10 = s.scoreT10Original != null ? s.scoreT10Original : s.scoreT10;
                            const originalCh = s.scoreChOriginal != null ? s.scoreChOriginal : s.scoreCh;

                            if (newValue === originalT10) {
                                const updated = {
                                    ...s,
                                    scoreT10: originalT10,
                                    scoreCh: originalCh,
                                    scoreChChange: null,
                                };
                                delete updated.scoreT10Original;
                                delete updated.scoreChOriginal;
                                return updated;
                            }

                            const backupT10 = s.scoreT10Original != null ? s.scoreT10Original : s.scoreT10;
                            const backupCh = s.scoreChOriginal != null ? s.scoreChOriginal : s.scoreCh;
                            const newScoreCh = convertT10ToCh(newValue);

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
                // sanitize khi load file JSON — đảm bảo không có field thừa từ export cũ
                scores: scores.map(sanitizeScore),
                toggleUploadFile: scores.length === 0,
            })),
            resetScores: () => set(() => ({
                scores: [],
                toggleUploadFile: true,
            })),
            resetAllChanges: () => set((state) => ({
                scores: state.scores.map((s) => {
                    if (s.scoreChChange == null && s.scoreT10Original == null) return s;
                    const restoredT10 = s.scoreT10Original != null ? s.scoreT10Original : s.scoreT10;
                    const restoredCh = s.scoreChOriginal != null ? s.scoreChOriginal : s.scoreCh;
                    const updated = { ...s, scoreT10: restoredT10, scoreCh: restoredCh, scoreChChange: null };
                    delete updated.scoreT10Original;
                    delete updated.scoreChOriginal;
                    return updated;
                }),
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
            version: 2,
            migrate: (persisted: any) => {
                // migrate() as fallback for older stored versions
                if (persisted && Array.isArray(persisted.scores)) {
                    persisted.scores = persisted.scores.map(sanitizeScore);
                }
                return persisted as ScoreState;
            },
            // onRehydrateStorage runs AFTER hydration — most reliable cleanup hook
            onRehydrateStorage: () => (state) => {
                if (state?.scores) {
                    const cleaned = state.scores.map(sanitizeScore);
                    // only update if something actually changed
                    const needsClean = state.scores.some(
                        (s: any) => s.scoreT10Original !== undefined || s.scoreChOriginal !== undefined
                    );
                    if (needsClean) {
                        useScoreStore.setState({ scores: cleaned });
                    }
                }
            },
            partialize: (state) => ({
                // strip ephemeral change-tracking fields before saving
                scores: state.scores.map(sanitizeScore),
                toggleUploadFile: state.toggleUploadFile,
            }),
        }
    )
);
