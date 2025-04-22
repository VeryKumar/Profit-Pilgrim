import CurrencyDisplay from './CurrencyDisplay';
import { useStage } from '../contexts/StageContext';

function Header() {
    const { stageName } = useStage();

    return (
        <header className="game-header">
            <h1>Profit Pilgrim</h1>
            <div className="stage-info">
                <span className="stage-name">{stageName}</span>
            </div>
            <CurrencyDisplay />
        </header>
    );
}

export default Header; 