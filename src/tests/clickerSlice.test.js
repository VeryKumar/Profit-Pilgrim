import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import clickerReducer, {
    setCurrency,
    setClickValue,
    setIdleRate,
    setLastTick,
    addClick,
    tickIdle
} from '../slices/clickerSlice';

describe('clickerSlice', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                clicker: clickerReducer
            },
            preloadedState: {
                clicker: {
                    currency: 0n,
                    clickValue: 1,
                    idleRate: 0,
                    lastTick: Date.now()
                }
            }
        });
    });

    it('initializes with default values', () => {
        const state = store.getState().clicker;
        expect(state.currency).toBe(0n);
        expect(state.clickValue).toBe(1);
        expect(state.idleRate).toBe(0);
        expect(state.lastTick).toBeGreaterThan(0);
    });

    it('adds currency when clicking', () => {
        // First click
        store.dispatch(addClick());
        expect(store.getState().clicker.currency).toBe(1n);

        // With increased clickValue
        store.dispatch(setClickValue(5));
        store.dispatch(addClick());
        expect(store.getState().clicker.currency).toBe(6n);
    });

    it('adds idle currency based on time passed', () => {
        // Set idle rate to 2 per second
        store.dispatch(setIdleRate(2));

        // Mock last tick to be 5 seconds ago
        const now = Date.now();
        const fiveSecondsAgo = now - 5000;
        store.dispatch(setLastTick(fiveSecondsAgo));

        // Tick with current time
        store.dispatch(tickIdle(now));

        // Should add 2 * 5 = 10 currency
        expect(store.getState().clicker.currency).toBe(10n);

        // Should update lastTick
        expect(store.getState().clicker.lastTick).toBe(now);
    });

    it('does not add currency when no time has passed', () => {
        store.dispatch(setIdleRate(10));
        const time = Date.now();
        store.dispatch(setLastTick(time));

        store.dispatch(tickIdle(time));
        expect(store.getState().clicker.currency).toBe(0n);
    });

    it('handles large currency values', () => {
        // Start with a large amount
        store.dispatch(setCurrency(10000000000000000000n));
        store.dispatch(setClickValue(1000000));

        store.dispatch(addClick());
        expect(store.getState().clicker.currency).toBe(10000000000000000000n + 1000000n);
    });
}); 