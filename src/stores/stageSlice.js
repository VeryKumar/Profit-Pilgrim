/**
 * @typedef {Object} Stage
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Object} theme
 * @property {bigint} unlockAt
 */

/**
 * @typedef {Object} StageSlice
 * @property {string} currentStage
 * @property {Object.<string, Stage>} stages
 * @property {() => void} checkStageProgress
 */

export const createStageSlice = (set, get) => ({
    currentStage: 'beginning',
    stages: {
        beginning: {
            id: 'beginning',
            name: 'The Journey Begins',
            description: 'Your first steps on the path to profit',
            theme: {
                primary: '#6366f1',
                secondary: '#4f46e5',
                background: '#f8fafc',
                accent: '#ec4899',
            },
            unlockAt: 0n,
        },
        momentum: {
            id: 'momentum',
            name: 'Gaining Momentum',
            description: 'Your profits start to accelerate',
            theme: {
                primary: '#10b981',
                secondary: '#059669',
                background: '#ecfdf5',
                accent: '#f59e0b',
            },
            unlockAt: 100n,
        },
        breakout: {
            id: 'breakout',
            name: 'Profit Breakout',
            description: 'Your business reaches new heights',
            theme: {
                primary: '#f59e0b',
                secondary: '#d97706',
                background: '#fffbeb',
                accent: '#6366f1',
            },
            unlockAt: 1000n,
        },
        empire: {
            id: 'empire',
            name: 'Profit Empire',
            description: 'Your business empire expands',
            theme: {
                primary: '#ef4444',
                secondary: '#dc2626',
                background: '#fef2f2',
                accent: '#10b981',
            },
            unlockAt: 10000n,
        },
    },

    checkStageProgress: () => {
        const { currency, stages, currentStage } = get();

        // Track the highest eligible stage
        let highestEligibleStage = currentStage;
        let highestEligibleThreshold = stages[currentStage].unlockAt;

        // Find the highest stage the player qualifies for
        Object.values(stages).forEach(stage => {
            if (currency >= stage.unlockAt && stage.unlockAt >= highestEligibleThreshold) {
                highestEligibleStage = stage.id;
                highestEligibleThreshold = stage.unlockAt;
            }
        });

        // Only update if we're moving to a higher stage
        if (highestEligibleStage !== currentStage) {
            set({ currentStage: highestEligibleStage });
        }
    }
}); 