import { describe, it, expect, beforeEach } from 'vitest';
import { createMockStore } from './storeMock';

describe('clickerSlice', () => {
    let store;

    beforeEach(() => {
        store = createMockStore({
            currency: 0n,
            clickValue: 1,
            idleRate: 0,
            lastTick: Date.now()
        });
    });

    it('initializes with default values', () => {
        expect(store.currency).toBe(0n);
        expect(store.clickValue).toBe(1);
        expect(store.idleRate).toBe(0);
        expect(store.lastTick).toBeGreaterThan(0);
    });

    it('adds currency when clicking', () => {
        // First click
        store.addClick();
        expect(store.currency).toBe(1n);

        // With increased clickValue
        store.clickValue = 5;
        store.addClick();
        expect(store.currency).toBe(6n);
    });

    it('adds idle currency based on time passed', () => {
        // Set idle rate to 2 per second
        store.idleRate = 2;

        // Mock last tick to be 5 seconds ago
        const now = Date.now();
        const fiveSecondsAgo = now - 5000;
        store.lastTick = fiveSecondsAgo;

        // Tick with current time
        store.tickIdle(now);

        // Should add 2 * 5 = 10 currency
        expect(store.currency).toBe(10n);

        // Should update lastTick
        expect(store.lastTick).toBe(now);
    });

    it('does not add currency when no time has passed', () => {
        store.idleRate = 10;
        const time = Date.now();
        store.lastTick = time;

        store.tickIdle(time);
        expect(store.currency).toBe(0n);
    });

    it('handles large currency values', () => {
        // Start with a large amount
        store.currency = 10000000000000000000n;
        store.clickValue = 1000000;

        store.addClick();
        expect(store.currency).toBe(10000000000000000000n + 1000000n);
    });
}); 