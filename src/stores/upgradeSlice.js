/**
 * @typedef {Object} Upgrade
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} baseCost
 * @property {number} level
 * @property {number} clickBonus
 * @property {number} idleBonus
 */

/**
 * @typedef {Object} UpgradeSlice
 * @property {Object.<string, Upgrade>} upgrades
 * @property {(id: string) => void} purchaseUpgrade
 */

export const createUpgradeSlice = (set, get) => ({
    upgrades: {
        basicClick: {
            id: 'basicClick',
            name: 'Better Clicking',
            description: 'Increase profit per click',
            baseCost: 10,
            level: 0,
            clickBonus: 1,
            idleBonus: 0,
        },
        idleIncome: {
            id: 'idleIncome',
            name: 'Passive Income',
            description: 'Generate profit while idle',
            baseCost: 25,
            level: 0,
            clickBonus: 0,
            idleBonus: 1,
        }
    },

    purchaseUpgrade: (id) => {
        const upgrade = get().upgrades[id];
        const cost = upgrade.baseCost * Math.pow(1.5, upgrade.level);

        if (get().currency >= BigInt(Math.floor(cost))) {
            set((state) => ({
                currency: state.currency - BigInt(Math.floor(cost)),
                clickValue: state.clickValue + upgrade.clickBonus,
                idleRate: state.idleRate + upgrade.idleBonus,
                upgrades: {
                    ...state.upgrades,
                    [id]: {
                        ...state.upgrades[id],
                        level: state.upgrades[id].level + 1,
                    }
                }
            }));
        }
    }
}); 