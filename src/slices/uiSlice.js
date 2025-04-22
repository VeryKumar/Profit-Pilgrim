import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    powerUpModalOpen: false
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        togglePowerUpModal: (state) => {
            state.powerUpModalOpen = !state.powerUpModalOpen;
        },
        setPowerUpModalOpen: (state, action) => {
            state.powerUpModalOpen = action.payload;
        }
    }
});

export const { togglePowerUpModal, setPowerUpModalOpen } = uiSlice.actions;

export default uiSlice.reducer; 