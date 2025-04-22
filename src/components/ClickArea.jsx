import { useStore } from '../stores/store';
import { useStage } from '../contexts/StageContext';

function ClickArea() {
    const addClick = useStore(state => state.addClick);
    const { stageName } = useStage();

    return (
        <div
            className="click-area"
            onClick={addClick}
        >
            <div className="click-visual">
                <span className="stage-icon">🛤️</span>
                <span className="stage-text">{stageName}</span>
            </div>
            <div className="click-prompt">
                <span>Tap / Click to earn Profit</span>
            </div>
        </div>
    );
}

export default ClickArea; 