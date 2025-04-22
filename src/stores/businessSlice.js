/**
 * @typedef {Object} Business
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {bigint} baseCost
 * @property {bigint} baseProfit
 * @property {number} level
 * @property {number} productionTime
 * @property {number} lastProduction
 */

/**
 * @typedef {Object} BusinessSlice
 * @property {Object.<string, Business>} businesses
 * @property {(id: string) => void} purchaseBusiness
 * @property {(id: string) => void} collectProfit
 * @property {() => void} updateBusinesses
 */

export const createBusinessSlice = (set, get) => ({
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
        },
        cafe: {
            id: 'cafe',
            name: 'Coffee Shop',
            description: 'Brewing profits',
            icon: '☕',
            baseCost: 100n,
            baseProfit: 10n,
            level: 0,
            productionTime: 3, // seconds
            lastProduction: Date.now(),
        },
        forest: {
            id: 'forest',
            name: 'Forest',
            description: 'Sustainable timber',
            icon: '🌳',
            baseCost: 1000n,
            baseProfit: 100n,
            level: 0,
            productionTime: 6, // seconds
            lastProduction: Date.now(),
        },
        train: {
            id: 'train',
            name: 'Train',
            description: 'Moving goods across the map',
            icon: '🚂',
            baseCost: 10000n,
            baseProfit: 1000n,
            level: 0,
            productionTime: 12, // seconds
            lastProduction: Date.now(),
        },
        gun: {
            id: 'gun',
            name: 'Gun Factory',
            description: 'Protection for the frontier',
            icon: '🔫',
            baseCost: 100000n,
            baseProfit: 10000n,
            level: 0,
            productionTime: 24, // seconds
            lastProduction: Date.now(),
        },
        bull: {
            id: 'bull',
            name: 'Bull Ranch',
            description: 'Premium livestock',
            icon: '🐂',
            baseCost: 1000000n,
            baseProfit: 100000n,
            level: 0,
            productionTime: 48, // seconds
            lastProduction: Date.now(),
        },
    },

    purchaseBusiness: (id) => {
        const business = get().businesses[id];
        if (!business) return;

        // Make sure business.baseCost is a BigInt
        const baseCost = typeof business.baseCost === 'bigint'
            ? business.baseCost
            : BigInt(business.baseCost);

        const cost = baseCost * (5n ** BigInt(business.level));
        const currency = get().currency;

        // Ensure currency is a BigInt
        const currencyBigInt = typeof currency === 'bigint'
            ? currency
            : BigInt(currency.toString());

        if (currencyBigInt >= cost) {
            set((state) => ({
                currency: currencyBigInt - cost,
                businesses: {
                    ...state.businesses,
                    [id]: {
                        ...state.businesses[id],
                        level: state.businesses[id].level + 1,
                        lastProduction: Date.now(),
                    }
                }
            }));
        }
    },

    collectProfit: (id) => {
        const business = get().businesses[id];
        if (!business || business.level === 0) return;

        const now = Date.now();
        const timePassed = (now - business.lastProduction) / 1000; // in seconds

        if (timePassed < business.productionTime) return; // Not ready yet

        // Calculate profit based on level
        // Ensure baseProfit is a BigInt
        const baseProfit = typeof business.baseProfit === 'bigint'
            ? business.baseProfit
            : BigInt(business.baseProfit);

        const profit = baseProfit * (2n ** BigInt(business.level - 1));

        // Ensure currency is a BigInt
        const currency = get().currency;
        const currencyBigInt = typeof currency === 'bigint'
            ? currency
            : BigInt(currency.toString());

        set((state) => ({
            currency: currencyBigInt + profit,
            businesses: {
                ...state.businesses,
                [id]: {
                    ...state.businesses[id],
                    lastProduction: now,
                }
            }
        }));
    },

    updateBusinesses: () => {
        const now = Date.now();
        const { businesses } = get();

        Object.keys(businesses).forEach(id => {
            const business = businesses[id];
            if (business.level === 0) return; // Skip unowned businesses

            const timePassed = (now - business.lastProduction) / 1000; // in seconds

            if (timePassed >= business.productionTime) {
                // Auto-collect if time has passed
                // Ensure baseProfit is a BigInt
                const baseProfit = typeof business.baseProfit === 'bigint'
                    ? business.baseProfit
                    : BigInt(business.baseProfit);

                const profit = baseProfit * (2n ** BigInt(business.level - 1));

                // Ensure currency is a BigInt
                const currency = get().currency;
                const currencyBigInt = typeof currency === 'bigint'
                    ? currency
                    : BigInt(currency.toString());

                set((state) => ({
                    currency: currencyBigInt + profit,
                    businesses: {
                        ...state.businesses,
                        [id]: {
                            ...state.businesses[id],
                            lastProduction: now,
                        }
                    }
                }));
            }
        });
    }
}); 