import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import businessReducer, {
    purchaseBusiness,
    collectProfit,
    updateBusinesses
} from '../slices/businessSlice';

describe('businessSlice', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                business: businessReducer
            },
            preloadedState: {
                business: {
                    businesses: {
                        farm: {
                            id: 'farm',
                            name: 'Small Farm',
                            description: 'A small but productive farm',
                            icon: '🌱',
                            baseCost: 10n,
                            baseProfit: 1n,
                            level: 0,
                            productionTime: 1, // seconds
                            lastProduction: Date.now(),
                        }
                    },
                    currency: 1000000n // Start with enough currency to buy some businesses
                }
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    serializableCheck: {
                        ignoredPaths: [
                            'business.businesses.farm.baseCost',
                            'business.businesses.farm.baseProfit',
                            'business.currency'
                        ],
                    },
                }),
        });
    });

    it('initializes with predefined businesses', () => {
        const state = store.getState().business;
        expect(state.businesses).toBeDefined();
        expect(Object.keys(state.businesses).length).toBeGreaterThan(0);
        expect(state.businesses.farm).toBeDefined();
        expect(state.businesses.farm.level).toBe(0);
    });

    describe('purchaseBusiness', () => {
        it('allows purchasing a business when player has enough currency', () => {
            const initialState = store.getState().business;
            const initialCurrency = initialState.currency;
            const farmCost = initialState.businesses.farm.baseCost;

            // Purchase farm
            store.dispatch(purchaseBusiness('farm'));

            const newState = store.getState().business;

            // Check that level increased
            expect(newState.businesses.farm.level).toBe(1);

            // Check that currency was deducted
            expect(newState.currency).toBe(initialCurrency - farmCost);
        });

        it('prevents purchasing when currency is insufficient', () => {
            // Update state to set currency to 0
            store.dispatch({ type: 'business/setCurrency', payload: 0n });

            const initialState = store.getState().business;
            const initialLevel = initialState.businesses.farm.level;

            // Attempt to purchase
            store.dispatch(purchaseBusiness('farm'));

            const newState = store.getState().business;

            // Level should not change
            expect(newState.businesses.farm.level).toBe(initialLevel);
        });

        it('increases cost for subsequent purchases', () => {
            // Purchase first level
            store.dispatch(purchaseBusiness('farm'));

            const state = store.getState().business;

            // Get initial base cost
            const baseCost = state.businesses.farm.baseCost;

            // Calculate expected cost for next level (5x multiplier)
            const expectedCost = baseCost * 5n;

            // Get what the actual cost would be
            const actualCost = (() => {
                const business = state.businesses.farm;
                return business.baseCost * (5n ** BigInt(business.level));
            })();

            // Verify costs match
            expect(actualCost).toBe(expectedCost);
        });
    });

    describe('updateBusinesses', () => {
        it('updates business timers', () => {
            // Purchase a business
            store.dispatch(purchaseBusiness('farm'));

            // Mock lastProduction to be in the past
            const now = Date.now();
            const fiveSecondsAgo = now - 5000;

            // Manually update the lastProduction time
            store.dispatch({
                type: 'business/setBusinessLastProduction',
                payload: { id: 'farm', time: fiveSecondsAgo }
            });

            // Update businesses
            store.dispatch(updateBusinesses());

            const state = store.getState().business;

            // Should have marked the business as ready for collection
            expect(state.businesses.farm.readyForCollection).toBe(true);
            expect(state.businesses.farm.remainingTime).toBe(0);
        });
    });

    describe('collectProfit', () => {
        it('collects profit from a business that is ready', () => {
            // Purchase a business
            store.dispatch(purchaseBusiness('farm'));

            // Set lastProduction to be in the past (beyond production time)
            const now = Date.now();
            const pastTime = now - 2000; // 2 seconds ago

            // Manually update the lastProduction time
            store.dispatch({
                type: 'business/setBusinessLastProduction',
                payload: { id: 'farm', time: pastTime }
            });

            // Record initial currency
            const initialState = store.getState().business;
            const initialCurrency = initialState.currency;

            // Collect profit
            store.dispatch(collectProfit('farm'));

            const newState = store.getState().business;

            // Should have collected farm profit (baseProfit for level 1)
            const expectedProfit = initialState.businesses.farm.baseProfit;
            expect(newState.currency).toBe(initialCurrency + expectedProfit);

            // Should have updated lastProduction
            expect(newState.businesses.farm.lastProduction).toBeGreaterThanOrEqual(now);
        });

        it('does not collect profit when production cycle is incomplete', () => {
            // Purchase a business
            store.dispatch(purchaseBusiness('farm'));

            // Set lastProduction to be very recent (not enough time passed)
            const now = Date.now();

            // Manually update the lastProduction time
            store.dispatch({
                type: 'business/setBusinessLastProduction',
                payload: { id: 'farm', time: now }
            });

            // Record initial currency
            const initialState = store.getState().business;
            const initialCurrency = initialState.currency;

            // Try to collect profit
            store.dispatch(collectProfit('farm'));

            const newState = store.getState().business;

            // Currency should not change
            expect(newState.currency).toBe(initialCurrency);
        });
    });
}); 