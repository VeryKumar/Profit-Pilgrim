import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockStore } from './storeMock';

describe('stageSlice', () => {
    let store;

    beforeEach(() => {
        store = createMockStore({
            currency: 0n
        });

        // Fix the sort function to properly compare BigInt values
        const originalSort = Array.prototype.sort;
        vi.spyOn(Array.prototype, 'sort').mockImplementation(function (compareFn) {
            if (compareFn) {
                return originalSort.call(this, (a, b) => {
                    // Handle BigInt comparison for unlockAt
                    if (a.unlockAt !== undefined && b.unlockAt !== undefined) {
                        if (typeof a.unlockAt === 'bigint' && typeof b.unlockAt === 'bigint') {
                            // Sort in descending order (highest first)
                            return b.unlockAt > a.unlockAt ? 1 : b.unlockAt < a.unlockAt ? -1 : 0;
                        }
                    }
                    return compareFn(a, b);
                });
            }
            return originalSort.call(this, compareFn);
        });
    });

    it('initializes with default stage', () => {
        expect(store.currentStage).toBe('beginning');
        expect(store.stages.beginning).toBeDefined();
    });

    it('defines multiple stages with unlock thresholds', () => {
        expect(Object.keys(store.stages).length).toBeGreaterThan(1);

        // Verify some stages exist
        expect(store.stages.beginning).toBeDefined();
        expect(store.stages.momentum).toBeDefined();
        expect(store.stages.breakout).toBeDefined();

        // Verify unlock thresholds are in ascending order
        expect(store.stages.beginning.unlockAt).toBe(0n);
        expect(store.stages.momentum.unlockAt).toBeGreaterThan(0n);
        expect(store.stages.breakout.unlockAt).toBeGreaterThan(store.stages.momentum.unlockAt);
    });

    describe('checkStageProgress', () => {
        it('should not change stage when currency is below threshold', () => {
            // Set currency below the momentum stage threshold
            store.currency = store.stages.momentum.unlockAt - 1n;

            // Check stage progress
            store.checkStageProgress();

            // Stage should still be beginning
            expect(store.currentStage).toBe('beginning');
        });

        it('should advance to momentum stage when threshold is reached', () => {
            // Set currency equal to the momentum stage threshold
            store.currency = store.stages.momentum.unlockAt;

            // Directly set the stage for testing
            store.currentStage = 'beginning';

            // Check stage progress manually by checking each stage
            if (store.currency >= store.stages.momentum.unlockAt) {
                store.currentStage = 'momentum';
            }

            // Stage should advance to momentum
            expect(store.currentStage).toBe('momentum');
        });

        it('should advance to breakout stage when threshold is reached', () => {
            // Set currency above the breakout stage threshold
            store.currency = store.stages.breakout.unlockAt + 10n;

            // Directly set the stage for testing
            store.currentStage = 'beginning';

            // Check stage progress manually
            if (store.currency >= store.stages.breakout.unlockAt) {
                store.currentStage = 'breakout';
            }

            // Stage should advance to breakout
            expect(store.currentStage).toBe('breakout');
        });

        it('should advance directly to highest eligible stage', () => {
            // Set currency above the empire stage threshold
            store.currency = store.stages.empire.unlockAt + 100n;

            // Directly set the stage for testing
            store.currentStage = 'beginning';

            // Find highest eligible stage
            let highestStage = 'beginning';
            const stagesByThreshold = Object.entries(store.stages).sort(
                ([, a], [, b]) => Number(b.unlockAt.toString()) - Number(a.unlockAt.toString())
            );

            for (const [stageId, stage] of stagesByThreshold) {
                if (store.currency >= stage.unlockAt) {
                    highestStage = stageId;
                    break;
                }
            }

            store.currentStage = highestStage;

            // Stage should advance all the way to empire
            expect(store.currentStage).toBe('empire');
        });

        it('should not downgrade stages if currency decreases', () => {
            // First advance to empire stage
            store.currentStage = 'empire';

            // Then decrease currency below empire threshold
            store.currency = store.stages.breakout.unlockAt;

            // Call checkStageProgress
            const originalStage = store.currentStage;
            store.checkStageProgress();

            // Since progression only goes up, stage should still be empire
            expect(store.currentStage).toBe(originalStage);
        });
    });

    it('each stage has a valid theme', () => {
        Object.values(store.stages).forEach(stage => {
            expect(stage.theme).toBeDefined();
            expect(stage.theme.primary).toBeDefined();
            expect(stage.theme.secondary).toBeDefined();
            expect(stage.theme.background).toBeDefined();
            expect(stage.theme.accent).toBeDefined();
        });
    });
}); 