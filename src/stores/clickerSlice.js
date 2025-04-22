/**
 * @typedef {Object} ClickerSlice
 * @property {bigint} currency
 * @property {number} clickValue
 * @property {number} idleRate      // per second
 * @property {number} lastTick      // ms timestamp
 * @property {() => void} addClick
 * @property {(now:number) => void} tickIdle
 */

export const createClickerSlice = (set, get) => ({
    currency: 50n,
    clickValue: 5,
    idleRate: 1,
    lastTick: Date.now(),
    addClick() {
        const state = get();
        // Ensure currency is a BigInt
        const currency = typeof state.currency === 'bigint'
            ? state.currency
            : BigInt(state.currency.toString());

        set((s) => ({
            currency: currency + BigInt(s.clickValue)
        }));
    },
    tickIdle(now) {
        const state = get();
        // Ensure currency is a BigInt
        const currency = typeof state.currency === 'bigint'
            ? state.currency
            : BigInt(state.currency.toString());

        set((s) => {
            const delta = Math.floor((now - s.lastTick) / 1000);
            return delta
                ? {
                    currency: currency + BigInt(delta * s.idleRate),
                    lastTick: now,
                }
                : s;
        });
    },
}); 