import { describe, it, expect, beforeEach } from 'vitest';
import { createUpgradeSlice } from '../stores/upgradeSlice';

describe('upgradeSlice', () => {
    let upgradeSlice;
    let get;
    let set;
    let state;

    beforeEach(() => {
        state = {
            currency: 100n,
            clickValue: 1,
            idleRate: 0,
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
            }
        };

        // Mock get and set functions
        get = () => state;
        set = (fn) => {
            state = { ...state, ...fn(state) };
        };

        upgradeSlice = createUpgradeSlice(set, get);
    });

    it('should initialize with default upgrades', () => {
        expect(upgradeSlice.upgrades.basicClick).toBeDefined();
        expect(upgradeSlice.upgrades.idleIncome).toBeDefined();
        expect(upgradeSlice.upgrades.basicClick.level).toBe(0);
        expect(upgradeSlice.upgrades.idleIncome.level).toBe(0);
    });

    it('should purchase a click upgrade', () => {
        upgradeSlice.purchaseUpgrade('basicClick');

        // Check that currency was deducted
        expect(state.currency).toBe(90n); // 100 - 10 (base cost)

        // Check that upgrade level increased
        expect(state.upgrades.basicClick.level).toBe(1);

        // Check that click value increased
        expect(state.clickValue).toBe(2); // 1 + 1 (bonus)
    });

    it('should purchase an idle upgrade', () => {
        upgradeSlice.purchaseUpgrade('idleIncome');

        // Check that currency was deducted
        expect(state.currency).toBe(75n); // 100 - 25 (base cost)

        // Check that upgrade level increased
        expect(state.upgrades.idleIncome.level).toBe(1);

        // Check that idle rate increased
        expect(state.idleRate).toBe(1); // 0 + 1 (bonus)
    });

    it('should not purchase if not enough currency', () => {
        state.currency = 5n; // Not enough for any upgrade

        upgradeSlice.purchaseUpgrade('basicClick');

        // Check that nothing changed
        expect(state.currency).toBe(5n);
        expect(state.upgrades.basicClick.level).toBe(0);
        expect(state.clickValue).toBe(1);
    });

    it('should increase cost with each level', () => {
        // First purchase (cost: 10)
        upgradeSlice.purchaseUpgrade('basicClick');
        expect(state.currency).toBe(90n); // 100 - 10
        expect(state.upgrades.basicClick.level).toBe(1);

        // Second purchase (cost: 10 * 1.5 = 15)
        upgradeSlice.purchaseUpgrade('basicClick');
        expect(state.currency).toBe(75n); // 90 - 15
        expect(state.upgrades.basicClick.level).toBe(2);

        // Third purchase (cost: 10 * 1.5^2 = 22.5, floors to 22)
        upgradeSlice.purchaseUpgrade('basicClick');
        expect(state.currency).toBe(53n); // 75 - 22
        expect(state.upgrades.basicClick.level).toBe(3);
    });

    it('should accumulate bonuses correctly', () => {
        // Purchase click upgrade twice
        upgradeSlice.purchaseUpgrade('basicClick');
        upgradeSlice.purchaseUpgrade('basicClick');

        // Purchase idle upgrade once
        upgradeSlice.purchaseUpgrade('idleIncome');

        // Check final state
        expect(state.clickValue).toBe(3); // 1 + 1 + 1
        expect(state.idleRate).toBe(1); // 0 + 1
        expect(state.upgrades.basicClick.level).toBe(2);
        expect(state.upgrades.idleIncome.level).toBe(1);
    });
}); 