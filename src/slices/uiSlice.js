import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    powerUpModalOpen: false,
    managersModalOpen: false
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        togglePowerUpModal: (state) => {
            state.powerUpModalOpen = !state.powerUpModalOpen;
            // Close other modals when opening this one
            if (state.powerUpModalOpen) {
                state.managersModalOpen = false;
            }
        },
        setPowerUpModalOpen: (state, action) => {
            state.powerUpModalOpen = action.payload;
            // Close other modals when opening this one
            if (state.powerUpModalOpen) {
                state.managersModalOpen = false;
            }
        },
        toggleManagersModal: (state) => {
            state.managersModalOpen = !state.managersModalOpen;
            // Close other modals when opening this one
            if (state.managersModalOpen) {
                state.powerUpModalOpen = false;
            }
        },
        setManagersModalOpen: (state, action) => {
            state.managersModalOpen = action.payload;
            // Close other modals when opening this one
            if (state.managersModalOpen) {
                state.powerUpModalOpen = false;
            }
        }
    }
});

export const {
    togglePowerUpModal,
    setPowerUpModalOpen,
    toggleManagersModal,
    setManagersModalOpen
} = uiSlice.actions;

export default uiSlice.reducer; 