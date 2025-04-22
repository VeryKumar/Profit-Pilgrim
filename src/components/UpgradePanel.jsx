import { useStore } from '../stores/store';
import { formatCurrency } from '../utils/formatters';

function UpgradePanel() {
    const upgrades = useStore(state => state.upgrades);
    const purchaseUpgrade = useStore(state => state.purchaseUpgrade);
    const currency = useStore(state => state.currency);

    return (
        <div className="upgrade-panel">
            <h2>Upgrades</h2>
            <div className="upgrades-list">
                {Object.values(upgrades).map(upgrade => {
                    const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
                    const canAfford = currency >= BigInt(cost);

                    return (
                        <div
                            key={upgrade.id}
                            className={`upgrade-item ${canAfford ? 'can-afford' : 'cannot-afford'}`}
                            onClick={() => canAfford && purchaseUpgrade(upgrade.id)}
                        >
                            <div className="upgrade-info">
                                <h3>{upgrade.name} (Level {upgrade.level})</h3>
                                <p>{upgrade.description}</p>
                                {upgrade.clickBonus > 0 && (
                                    <span className="bonus">+{upgrade.clickBonus} per click</span>
                                )}
                                {upgrade.idleBonus > 0 && (
                                    <span className="bonus">+{upgrade.idleBonus} per second</span>
                                )}
                            </div>
                            <div className="upgrade-cost">
                                <span>✦ {cost}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default UpgradePanel; 