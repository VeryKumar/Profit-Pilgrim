import { configureStore } from '@reduxjs/toolkit';
import clickerReducer from './clickerSlice';
import stageReducer from './stageSlice';
import businessReducer from './businessSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
    reducer: {
        clicker: clickerReducer,
        stage: stageReducer,
        business: businessReducer,
        ui: uiReducer
    },
    // Enable serializable check to handle BigInt
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these field paths in the state
                ignoredPaths: [
                    'clicker.currency',
                    'business.currency',
                    'stage.stages.beginning.unlockAt',
                    'stage.stages.momentum.unlockAt',
                    'stage.stages.breakout.unlockAt',
                    'stage.stages.empire.unlockAt',
                    'stage.stages.tycoon.unlockAt',
                    'business.businesses.farm.baseCost',
                    'business.businesses.farm.baseProfit',
                    'business.businesses.farm.managerCost',
                    'business.businesses.cafe.baseCost',
                    'business.businesses.cafe.baseProfit',
                    'business.businesses.cafe.managerCost',
                    'business.businesses.forest.baseCost',
                    'business.businesses.forest.baseProfit',
                    'business.businesses.forest.managerCost',
                    'business.businesses.train.baseCost',
                    'business.businesses.train.baseProfit',
                    'business.businesses.train.managerCost',
                    'business.businesses.gun.baseCost',
                    'business.businesses.gun.baseProfit',
                    'business.businesses.gun.managerCost',
                    'business.businesses.bull.baseCost',
                    'business.businesses.bull.baseProfit',
                    'business.businesses.bull.managerCost',
                ],
                // Ignore these actions completely
                ignoredActions: [],
            },
        }),
});

export default store; 