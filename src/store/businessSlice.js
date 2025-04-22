// Modified selectors and actions to support manual clicking and upgrading
export const businessSlice = (set, get) => ({
    // ... existing code ...

    // Modified to only update business timers without auto-collecting
    updateBusinesses: () => {
        const businesses = { ...get().businesses };
        const now = Date.now();

        set(state => ({
            businesses: Object.entries(businesses).reduce((acc, [key, business]) => {
                // Only update cooldown timers, don't auto-collect
                if (business.owned > 0) {
                    const elapsedTime = now - business.lastUpdate;
                    const timeToProfit = business.productionTime * 1000;
                    const remainingTime = Math.max(0, timeToProfit - elapsedTime);
                    const readyForCollection = remainingTime === 0;

                    acc[key] = {
                        ...business,
                        remainingTime,
                        readyForCollection
                    };
                }
                return acc;
            }, { ...businesses })
        }));
    },

    // New action to collect profit when clicking on a business
    collectProfit: (businessId) => {
        const businesses = { ...get().businesses };
        const business = businesses[businessId];

        // Can only collect if business is owned and ready
        if (business && business.owned > 0 && business.readyForCollection) {
            // Calculate profit based on level and base profit
            const profit = BigInt(business.baseProfit) * BigInt(business.level);

            set(state => ({
                currency: state.currency + profit,
                businesses: {
                    ...state.businesses,
                    [businessId]: {
                        ...business,
                        lastUpdate: Date.now(),
                        remainingTime: business.productionTime * 1000,
                        readyForCollection: false
                    }
                }
            }));

            return true; // Return success for UI feedback
        }

        return false; // Return failure for UI feedback
    },

    // New action to upgrade business level instead of buying more
    upgradeBusinessLevel: (businessId) => {
        const businesses = { ...get().businesses };
        const business = businesses[businessId];
        const currency = get().currency;

        // Calculate upgrade cost based on current level
        const upgradeCost = BigInt(business.cost) * BigInt(business.level);

        if (currency >= upgradeCost) {
            set(state => ({
                currency: state.currency - upgradeCost,
                businesses: {
                    ...state.businesses,
                    [businessId]: {
                        ...business,
                        level: business.level + 1
                    }
                }
            }));

            return true; // Return success for UI feedback
        }

        return false; // Return failure for UI feedback
    },

    // ... existing code ...
}); 