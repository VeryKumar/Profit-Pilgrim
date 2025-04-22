import { createSlice } from '@reduxjs/toolkit';

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
        },
        tickIdle: (state, action) => {
            const now = action.payload;
            const delta = Math.floor((now - state.lastTick) / 1000);

            if (delta > 0) {
                state.currency = state.currency + BigInt(delta * state.idleRate);
                state.lastTick = now;
            }
        }
    }
});

export const {
    setCurrency,
    setClickValue,
    setIdleRate,
    setLastTick,
    addClick,
    tickIdle
} = clickerSlice.actions;

export default clickerSlice.reducer; 