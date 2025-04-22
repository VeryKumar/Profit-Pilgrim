import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import stageReducer, {
    checkStageProgress,
    getCurrentStage,
    getStages,
    setCurrentStage
} from '../slices/stageSlice';
import clickerReducer from '../slices/clickerSlice';

describe('stageSlice', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                stage: stageReducer,
                clicker: clickerReducer
            },
            preloadedState: {
                clicker: {
                    currency: 0n
                }
            }
        });
    });

    it('initializes with default stage', () => {
        const currentStage = getCurrentStage(store.getState());
        const stages = getStages(store.getState());

        expect(currentStage).toBe('beginning');
        expect(stages.beginning).toBeDefined();
    });

    it('defines multiple stages with unlock thresholds', () => {
        const stages = getStages(store.getState());

        expect(Object.keys(stages).length).toBeGreaterThan(1);

        // Verify some stages exist
        expect(stages.beginning).toBeDefined();
        expect(stages.momentum).toBeDefined();
        expect(stages.breakout).toBeDefined();

        // Verify unlock thresholds are in ascending order
        expect(stages.beginning.unlockAt).toBe(0n);
        expect(stages.momentum.unlockAt).toBeGreaterThan(0n);
        expect(stages.breakout.unlockAt).toBeGreaterThan(stages.momentum.unlockAt);
    });

    describe('checkStageProgress', () => {
        it('should not change stage when currency is below threshold', () => {
            const stages = getStages(store.getState());

            // Set currency below the momentum stage threshold
            store.dispatch({
                type: 'clicker/setCurrency',
                payload: stages.momentum.unlockAt - 1n
            });

            // Check stage progress
            store.dispatch(checkStageProgress());

            // Stage should still be beginning
            expect(getCurrentStage(store.getState())).toBe('beginning');
        });

        it('should advance to momentum stage when threshold is reached', () => {
            const stages = getStages(store.getState());

            // Set currency equal to the momentum stage threshold
            store.dispatch({
                type: 'clicker/setCurrency',
                payload: stages.momentum.unlockAt
            });

            // Directly set the stage for testing
            store.dispatch(setCurrentStage('beginning'));

            // Check stage progress
            store.dispatch(checkStageProgress());

            // Stage should advance to momentum
            expect(getCurrentStage(store.getState())).toBe('momentum');
        });

        it('should advance to breakout stage when threshold is reached', () => {
            const stages = getStages(store.getState());

            // Set currency above the breakout stage threshold
            store.dispatch({
                type: 'clicker/setCurrency',
                payload: stages.breakout.unlockAt + 10n
            });

            // Directly set the stage for testing
            store.dispatch(setCurrentStage('beginning'));

            // Check stage progress
            store.dispatch(checkStageProgress());

            // Stage should advance to breakout
            expect(getCurrentStage(store.getState())).toBe('breakout');
        });

        it('should advance directly to highest eligible stage', () => {
            const stages = getStages(store.getState());

            // Set currency above the empire stage threshold
            store.dispatch({
                type: 'clicker/setCurrency',
                payload: stages.empire.unlockAt + 100n
            });

            // Directly set the stage for testing
            store.dispatch(setCurrentStage('beginning'));

            // Check stage progress
            store.dispatch(checkStageProgress());

            // Stage should advance all the way to empire
            expect(getCurrentStage(store.getState())).toBe('empire');
        });

        it('should not downgrade stages if currency decreases', () => {
            // First advance to empire stage
            store.dispatch(setCurrentStage('empire'));

            const stages = getStages(store.getState());

            // Then decrease currency below empire threshold
            store.dispatch({
                type: 'clicker/setCurrency',
                payload: stages.breakout.unlockAt
            });

            // Get original stage
            const originalStage = getCurrentStage(store.getState());

            // Call checkStageProgress
            store.dispatch(checkStageProgress());

            // Since progression only goes up, stage should still be empire
            expect(getCurrentStage(store.getState())).toBe(originalStage);
        });
    });

    it('each stage has a valid theme', () => {
        const stages = getStages(store.getState());

        Object.values(stages).forEach(stage => {
            expect(stage.theme).toBeDefined();
            expect(stage.theme.primary).toBeDefined();
            expect(stage.theme.secondary).toBeDefined();
            expect(stage.theme.background).toBeDefined();
            expect(stage.theme.accent).toBeDefined();
        });
    });
}); 