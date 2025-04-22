import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currency: 50n,
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
            hasManager: false,
            managerCost: 100n,
            managerName: 'Farmer Joe',
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
            hasManager: false,
            managerCost: 1000n,
            managerName: 'Barista Betty',
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
            hasManager: false,
            managerCost: 10000n,
            managerName: 'Lumberjack Larry',
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
            hasManager: false,
            managerCost: 100000n,
            managerName: 'Conductor Carl',
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
            hasManager: false,
            managerCost: 1000000n,
            managerName: 'Gunsmith Gary',
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
            hasManager: false,
            managerCost: 10000000n,
            managerName: 'Rancher Randy',
        },
    }
};

export const businessSlice = createSlice({
    name: 'business',
    initialState,
    reducers: {
        setCurrency: (state, action) => {
            state.currency = action.payload;
        },
        setBusinessLastProduction: (state, action) => {
            const { id, time } = action.payload;
            if (state.businesses[id]) {
                state.businesses[id].lastProduction = time;
            }
        },
        purchaseBusiness: (state, action) => {
            const id = action.payload;
            const business = state.businesses[id];
            if (!business) return;

            // Calculate cost based on level
            const cost = business.baseCost * (5n ** BigInt(business.level));

            if (state.currency >= cost) {
                state.currency -= cost;
                state.businesses[id].level += 1;
                state.businesses[id].lastProduction = Date.now();
            }
        },
        collectProfit: (state, action) => {
            const id = action.payload;
            const business = state.businesses[id];
            if (!business || business.level === 0) return;

            const now = Date.now();
            const timePassed = (now - business.lastProduction) / 1000; // in seconds

            if (timePassed < business.productionTime && !business.readyForCollection) return; // Not ready yet

            // Calculate profit based on level
            const profit = business.baseProfit * (2n ** BigInt(business.level - 1));

            state.currency += profit;
            state.businesses[id].lastProduction = now;
            state.businesses[id].readyForCollection = false; // Reset ready state
        },
        updateBusinesses: (state) => {
            // This function now only triggers UI updates for timers
            // We don't automatically collect profits anymore
            const now = Date.now();

            Object.keys(state.businesses).forEach(id => {
                const business = state.businesses[id];
                if (business.level > 0) {
                    const elapsedTime = now - business.lastProduction;
                    const timeToProfit = business.productionTime * 1000;
                    const remainingTime = Math.max(0, timeToProfit - elapsedTime);

                    state.businesses[id].remainingTime = remainingTime;
                    state.businesses[id].readyForCollection = remainingTime === 0;

                    // Auto-collect if manager is hired and business is ready
                    if (business.hasManager && remainingTime === 0) {
                        const profit = business.baseProfit * (2n ** BigInt(business.level - 1));
                        state.currency += profit;
                        state.businesses[id].lastProduction = now;
                    }
                }
            });
        },
        upgradeBusinessLevel: (state, action) => {
            const id = action.payload;
            const business = state.businesses[id];
            if (!business || business.level === 0) return;

            // Calculate upgrade cost based on current level
            const upgradeCost = business.baseCost * (2n ** BigInt(business.level));

            if (state.currency >= upgradeCost) {
                state.currency -= upgradeCost;
                state.businesses[id].level += 1;
            }
        },
        hireManager: (state, action) => {
            const id = action.payload;
            const business = state.businesses[id];

            if (!business || business.level === 0 || business.hasManager) return;

            if (state.currency >= business.managerCost) {
                state.currency -= business.managerCost;
                state.businesses[id].hasManager = true;
            }
        }
    }
});

export const {
    purchaseBusiness,
    collectProfit,
    updateBusinesses,
    upgradeBusinessLevel,
    setCurrency,
    setBusinessLastProduction,
    hireManager
} = businessSlice.actions;

export default businessSlice.reducer; 