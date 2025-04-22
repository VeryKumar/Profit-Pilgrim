import { formatCurrency } from '../utils/formatters';
import { useStage } from '../contexts/StageContext';
import { useSelector, useDispatch } from 'react-redux';
import { hireManager } from '../slices/businessSlice';

function ManagersModal({ onClose }) {
    const dispatch = useDispatch();
    const businesses = useSelector(state => state.business.businesses);
    const currency = useSelector(state => state.business.currency);
    const { theme } = useStage();

    const canAffordManager = (business) => {
        if (!business || business.level === 0 || business.hasManager) return false;
        return currency >= business.managerCost;
    };

    const handleHireManager = (businessId) => {
        dispatch(hireManager(businessId));
    };

    return (
        <div className="modal-content managers-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h2>Managers</h2>
                <button className="modal-close" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
                <p className="manager-intro">Hire managers to automatically collect profits for your businesses!</p>
                <div className="managers-list">
                    {Object.values(businesses).map(business => (
                        <div key={business.id} className={`manager-item ${business.level === 0 ? 'locked' : ''}`}>
                            <div className="manager-icon">{business.icon}</div>
                            <div className="manager-info">
                                <div className="manager-name">{business.managerName}</div>
                                <div className="manager-business">{business.name}</div>
                                <div className="manager-description">
                                    {business.hasManager
                                        ? "Already hired! Automatically collecting profits."
                                        : business.level === 0
                                            ? "Unlock this business first"
                                            : `Auto-collects ${business.name} profits`}
                                </div>
                            </div>
                            <div className="manager-action">
                                {business.hasManager ? (
                                    <div className="manager-hired">Hired!</div>
                                ) : business.level === 0 ? (
                                    <div className="manager-locked">Locked</div>
                                ) : (
                                    <>
                                        <div className="manager-cost">{formatCurrency(business.managerCost)}</div>
                                        <button
                                            className={`hire-button ${canAffordManager(business) ? '' : 'disabled'}`}
                                            onClick={() => handleHireManager(business.id)}
                                            disabled={!canAffordManager(business)}
                                        >
                                            Hire
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ManagersModal; 