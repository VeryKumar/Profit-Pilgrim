/**
 * @typedef {Object} UISlice
 * @property {boolean} powerUpModalOpen
 * @property {() => void} togglePowerUpModal
 */

export const createUISlice = (set) => ({
    powerUpModalOpen: false,
    togglePowerUpModal: () => set((state) => ({ powerUpModalOpen: !state.powerUpModalOpen })),
}); 