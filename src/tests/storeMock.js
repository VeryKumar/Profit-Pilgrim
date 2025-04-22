import { createClickerSlice } from '../stores/clickerSlice';
import { createUpgradeSlice } from '../stores/upgradeSlice';
import { createStageSlice } from '../stores/stageSlice';
import { createUISlice } from '../stores/uiSlice';
import { createBusinessSlice } from '../stores/businessSlice';

/**
 * Create a mock store with initial state
 * @param {Object} initialState - Optional initial state to override defaults
 * @returns {Object} Mock store state and actions
 */
export function createMockStore(initialState = {}) {
    // Mock set and get functions
    const state = {};
    const set = fn => {
        const newState = typeof fn === 'function' ? fn(state) : fn;
        Object.assign(state, newState);
    };
    const get = () => state;

    // Create store slices
    const clickerSlice = createClickerSlice(set, get);
    const upgradeSlice = createUpgradeSlice(set, get);
    const stageSlice = createStageSlice(set, get);
    const uiSlice = createUISlice(set, get);
    const businessSlice = createBusinessSlice(set, get);

    // Combine slices
    Object.assign(
        state,
        clickerSlice,
        upgradeSlice,
        stageSlice,
        uiSlice,
        businessSlice,
        initialState
    );

    return state;
} 