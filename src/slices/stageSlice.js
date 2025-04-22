import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentStage: 'beginning',
    stages: {
        beginning: {
            id: 'beginning',
            name: 'The Journey Begins',
            description: 'Your first steps on the path to profit',
            unlockAt: 0n,
            theme: {
                primary: '#6366f1',
                secondary: '#4f46e5',
                background: '#f8fafc',
                accent: '#ec4899',
            }
        },
        momentum: {
            id: 'momentum',
            name: 'Gaining Momentum',
            description: 'Your business is growing steadily',
            unlockAt: 100n,
            theme: {
                primary: '#10b981',
                secondary: '#059669',
                background: '#f8fafc',
                accent: '#f59e0b',
            }
        },
        breakout: {
            id: 'breakout',
            name: 'Breakout Success',
            description: 'Your business is now thriving!',
            unlockAt: 1000n,
            theme: {
                primary: '#8b5cf6',
                secondary: '#7c3aed',
                background: '#f8fafc',
                accent: '#f43f5e',
            }
        },
        empire: {
            id: 'empire',
            name: 'Business Empire',
            description: 'You have created an empire!',
            unlockAt: 10000n,
            theme: {
                primary: '#f59e0b',
                secondary: '#d97706',
                background: '#f8fafc',
                accent: '#3b82f6',
            }
        },
        tycoon: {
            id: 'tycoon',
            name: 'Profit Tycoon',
            description: 'Your name is legendary in business circles',
            unlockAt: 100000n,
            theme: {
                primary: '#ef4444',
                secondary: '#dc2626',
                background: '#f8fafc',
                accent: '#8b5cf6',
            }
        }
    }
};

export const stageSlice = createSlice({
    name: 'stage',
    initialState,
    reducers: {
        setCurrentStage: (state, action) => {
            state.currentStage = action.payload;
        },
        checkStageProgress: (state, action) => {
            const { stages, currentStage } = state;
            const currency = action.payload;

            // Sort stages by unlock threshold in descending order
            const sortedStages = Object.values(stages)
                .sort((a, b) => {
                    if (b.unlockAt > a.unlockAt) return 1;
                    if (b.unlockAt < a.unlockAt) return -1;
                    return 0;
                });

            // Find the highest stage the player can access
            for (const stage of sortedStages) {
                // We don't want to downgrade stages if currency decreases
                if (currency >= stage.unlockAt && stage.id !== currentStage) {
                    state.currentStage = stage.id;
                    break;
                }
            }
        }
    },
});

export const { setCurrentStage, checkStageProgress } = stageSlice.actions;

// Create a thunk to get currency from state and check progress
export const checkStageProgressThunk = () => (dispatch, getState) => {
    const state = getState();
    const currency = state.business.currency;

    dispatch(checkStageProgress(currency));
};

// Selectors
export const getCurrentStage = (state) => state.stage.currentStage;
export const getStages = (state) => state.stage.stages;

export default stageSlice.reducer; 