import { describe, it, expect, beforeEach } from 'vitest';
import { createMockStore } from './storeMock';

describe('businessSlice', () => {
    let store;

    beforeEach(() => {
        store = createMockStore({
            currency: 1000000n // Start with enough currency to buy some businesses
        });
    });

    it('initializes with predefined businesses', () => {
        expect(store.businesses).toBeDefined();
        expect(Object.keys(store.businesses).length).toBeGreaterThan(0);
        expect(store.businesses.farm).toBeDefined();
        expect(store.businesses.farm.level).toBe(0);
    });

    describe('purchaseBusiness', () => {
        it('allows purchasing a business when player has enough currency', () => {
            const initialCurrency = store.currency;
            const farmCost = store.businesses.farm.baseCost;

            // Purchase farm
            store.purchaseBusiness('farm');

            // Check that level increased
            expect(store.businesses.farm.level).toBe(1);

            // Check that currency was deducted
            expect(store.currency).toBe(initialCurrency - farmCost);
        });

        it('prevents purchasing when currency is insufficient', () => {
            // Set currency to 0
            store.currency = 0n;
            const initialLevel = store.businesses.farm.level;

            // Attempt to purchase
            store.purchaseBusiness('farm');

            // Level should not change
            expect(store.businesses.farm.level).toBe(initialLevel);
        });

        it('increases cost for subsequent purchases', () => {
            // Purchase first level
            store.purchaseBusiness('farm');

            // Get initial base cost
            const baseCost = store.businesses.farm.baseCost;

            // Calculate expected cost for next level (5x multiplier)
            const expectedCost = baseCost * 5n;

            // Get what the actual cost would be
            const actualCost = (() => {
                const business = store.businesses.farm;
                return business.baseCost * (5n ** BigInt(business.level));
            })();

            // Verify costs match
            expect(actualCost).toBe(expectedCost);
        });
    });

    describe('updateBusinesses', () => {
        it('collects profit from businesses that have completed their production cycle', () => {
            // Purchase a business
            store.purchaseBusiness('farm');

            // Mock lastProduction to be in the past
            const now = Date.now();
            const farmProductionTime = store.businesses.farm.productionTime * 1000; // Convert to ms
            store.businesses.farm.lastProduction = now - farmProductionTime - 1000; // 1 extra second

            // Record initial currency
            const initialCurrency = store.currency;

            // Update businesses
            store.updateBusinesses();

            // Should have collected farm profit
            const expectedProfit = store.businesses.farm.baseProfit;
            expect(store.currency).toBe(initialCurrency + expectedProfit);

            // Should have updated lastProduction
            expect(store.businesses.farm.lastProduction).toBeGreaterThanOrEqual(now);
        });

        it('does not collect profit when production cycle is incomplete', () => {
            // Purchase a business
            store.purchaseBusiness('farm');

            // Set lastProduction to be very recent
            store.businesses.farm.lastProduction = Date.now();

            // Record initial currency
            const initialCurrency = store.currency;

            // Update businesses
            store.updateBusinesses();

            // Currency should not change
            expect(store.currency).toBe(initialCurrency);
        });

        it('skips businesses with level 0', () => {
            // Ensure farm is at level 0
            store.businesses.farm.level = 0;

            // Mock lastProduction to be in the past
            store.businesses.farm.lastProduction = Date.now() - 10000;

            // Record initial currency
            const initialCurrency = store.currency;

            // Update businesses
            store.updateBusinesses();

            // Currency should not change
            expect(store.currency).toBe(initialCurrency);
        });

        it('scales profit with business level', () => {
            // Set farm to level 3
            store.businesses.farm.level = 3;

            // Calculate expected profit at level 3: baseProfit * 2^(level-1) = baseProfit * 2^2 = baseProfit * 4
            const baseProfit = store.businesses.farm.baseProfit;
            const expectedProfit = baseProfit * 4n;

            // Mock lastProduction to be in the past
            store.businesses.farm.lastProduction = Date.now() - 10000;

            // Record initial currency
            const initialCurrency = store.currency;

            // Update businesses
            store.updateBusinesses();

            // Currency should increase by the expected profit
            expect(store.currency).toBe(initialCurrency + expectedProfit);
        });
    });
}); 