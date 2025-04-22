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
                    'business.businesses.farm.baseCost',
                    'business.businesses.farm.baseProfit',
                    'business.businesses.cafe.baseCost',
                    'business.businesses.cafe.baseProfit',
                    'business.businesses.forest.baseCost',
                    'business.businesses.forest.baseProfit',
                    'business.businesses.train.baseCost',
                    'business.businesses.train.baseProfit',
                    'business.businesses.gun.baseCost',
                    'business.businesses.gun.baseProfit',
                    'business.businesses.bull.baseCost',
                    'business.businesses.bull.baseProfit',
                ],
                // Ignore these actions completely
                ignoredActions: [],
            },
        }),
});

export default store; 