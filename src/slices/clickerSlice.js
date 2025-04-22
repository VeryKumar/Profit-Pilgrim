import { createSlice } from '@reduxjs/toolkit';
import { setCurrency } from './businessSlice';

const initialState = {
    currency: 50n,
    clickValue: 5,
    idleRate: 1,
    lastTick: Date.now()
};

export const clickerSlice = createSlice({
    name: 'clicker',
    initialState,
    reducers: {
        setCurrency: (state, action) => {
            state.currency = action.payload;
        },
        setClickValue: (state, action) => {
            state.clickValue = action.payload;
        },
        setIdleRate: (state, action) => {
            state.idleRate = action.payload;
        },
        setLastTick: (state, action) => {
            state.lastTick = action.payload;
        },
        addClick: (state) => {
            state.currency = state.currency + BigInt(state.clickValue);
            // Business currency is updated in the thunk
        },
        tickIdle: (state, action) => {
            const now = action.payload;
            const delta = Math.floor((now - state.lastTick) / 1000);

            if (delta > 0) {
                state.currency = state.currency + BigInt(delta * state.idleRate);
                state.lastTick = now;
                // Business currency is updated in the thunk
            }
        }
    }
});

// Thunk to add click and update business currency
export const addClickThunk = () => (dispatch, getState) => {
    dispatch(addClick());

    const state = getState();
    const clickValue = state.clicker.clickValue;
    const currentCurrency = state.business.currency;

    // Update business currency with the click value
    dispatch(setCurrency(currentCurrency + BigInt(clickValue)));
};

// Thunk to tick idle and update business currency
export const tickIdleThunk = (now) => (dispatch, getState) => {
    dispatch(tickIdle(now));

    const state = getState();
    const idleRate = state.clicker.idleRate;
    const currentCurrency = state.business.currency;
    const lastTick = state.clicker.lastTick;

    const delta = Math.floor((now - lastTick) / 1000);

    if (delta > 0) {
        // Update business currency with the idle value
        dispatch(setCurrency(currentCurrency + BigInt(delta * idleRate)));
    }
};

export const {
    setCurrency: setClickerCurrency,
    setClickValue,
    setIdleRate,
    setLastTick,
    addClick,
    tickIdle
} = clickerSlice.actions;

export default clickerSlice.reducer; 