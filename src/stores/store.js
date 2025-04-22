import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClickerSlice } from './clickerSlice'
import { createUpgradeSlice } from './upgradeSlice'
import { createStageSlice } from './stageSlice'
import { createUISlice } from './uiSlice'
import { createBusinessSlice } from './businessSlice'

// Helper to convert BigInt values to strings for serialization
const replaceBigInt = (key, value) => {
    // Check if the value is a BigInt and convert to string
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
};

// Helper to convert business objects for storage
const serializeBusinesses = (businesses) => {
    const result = {};

    Object.keys(businesses).forEach(id => {
        const business = businesses[id];
        result[id] = {
            ...business,
            baseCost: business.baseCost.toString(),
            baseProfit: business.baseProfit.toString()
        };
    });

    return result;
};

export const useStore = create(
    persist(
        (set, get) => ({
            ...createClickerSlice(set, get),
            ...createUpgradeSlice(set, get),
            ...createStageSlice(set, get),
            ...createUISlice(set, get),
            ...createBusinessSlice(set, get),
        }),
        {
            name: 'profit-pilgrim-storage',
            partialize: (state) => ({
                currency: state.currency.toString(), // Convert BigInt to string for storage
                clickValue: state.clickValue,
                idleRate: state.idleRate,
                lastTick: state.lastTick,
                upgrades: state.upgrades,
                currentStage: state.currentStage,
                businesses: serializeBusinesses(state.businesses),
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;

                // Convert string back to BigInt on load
                if (typeof state.currency === 'string') {
                    state.currency = BigInt(state.currency);
                }

                // Convert businesses baseCost and baseProfit back to BigInt
                if (state.businesses) {
                    Object.keys(state.businesses).forEach(id => {
                        const business = state.businesses[id];
                        if (business && typeof business.baseCost === 'string') {
                            business.baseCost = BigInt(business.baseCost);
                        }
                        if (business && typeof business.baseProfit === 'string') {
                            business.baseProfit = BigInt(business.baseProfit);
                        }
                    });
                }
            },
            // Use custom serializer that handles BigInt
            serialize: (state) => JSON.stringify(state, replaceBigInt),
        }
    )
) 