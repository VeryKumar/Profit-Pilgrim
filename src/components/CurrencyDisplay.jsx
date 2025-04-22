import { useStore } from '../stores/store';
import { formatCurrency } from '../utils/formatters';

function CurrencyDisplay() {
    const currency = useStore(state => state.currency);
    const clickValue = useStore(state => state.clickValue);
    const idleRate = useStore(state => state.idleRate);

    return (
        <div className="currency-display">
            <div className="currency-amount">
                <span>✦ {formatCurrency(currency)}</span>
            </div>
            <div className="currency-rates">
                <div className="click-value">
                    <span>+{clickValue} per click</span>
                </div>
                <div className="idle-rate">
                    <span>+{idleRate} per second</span>
                </div>
            </div>
        </div>
    );
}

export default CurrencyDisplay; 