import { formatCurrency } from '../utils/formatters';
import { useStage } from '../contexts/StageContext';
import { useEffect, useState } from 'react';
import ManagersModal from './ManagersModal';
import { useSelector, useDispatch } from 'react-redux';
import {
    toggleManagersModal,
    togglePowerUpModal
} from '../slices/uiSlice';
import {
    addClickThunk
} from '../slices/clickerSlice';
import {
    purchaseBusiness,
    upgradeBusinessLevel,
    collectProfit
} from '../slices/businessSlice';

function MainLayout() {
    const dispatch = useDispatch();

    // UI State
    const powerUpModalOpen = useSelector(state => state.ui.powerUpModalOpen);
    const managersModalOpen = useSelector(state => state.ui.managersModalOpen);

    // Clicker State
    const clickValue = useSelector(state => state.clicker.clickValue);
    const idleRate = useSelector(state => state.clicker.idleRate);

    // Business State
    const businesses = useSelector(state => state.business.businesses || {});
    const currency = useSelector(state => state.business.currency);

    const [remainingTime, setRemainingTime] = useState('00:00:00');
    const [clickFeedback, setClickFeedback] = useState(null);
    const [businessTimers, setBusinessTimers] = useState({});
    const [showClickPrompt, setShowClickPrompt] = useState(true);
    const [businessFeedback, setBusinessFeedback] = useState(null);
    const { theme } = useStage();

    // Hide the click prompt after first interaction or after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowClickPrompt(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // Update the timer every second
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const hours = String(23 - now.getHours()).padStart(2, '0');
            const minutes = String(59 - now.getMinutes()).padStart(2, '0');
            const seconds = String(59 - now.getSeconds()).padStart(2, '0');
            setRemainingTime(`${hours}:${minutes}:${seconds}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Update business timers
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const updatedTimers = {};

            Object.values(businesses).forEach(business => {
                if (business.level === 0) {
                    updatedTimers[business.id] = {
                        progress: 0,
                        timeLeft: 0,
                        ready: false
                    };
                    return;
                }

                const timeSinceProduction = now - business.lastProduction;
                const cycleDuration = business.productionTime * 1000; // Convert to ms

                // Calculate progress as a percentage from 0 to 1
                // Progress increases from 0 (just clicked) to 1 (ready to collect)
                // If ready for collection, keep progress at 1 (100%)
                const progress = business.readyForCollection ? 1 : Math.min(timeSinceProduction / cycleDuration, 1);
                const timeLeft = business.readyForCollection ? 0 : Math.max(0, cycleDuration - timeSinceProduction) / 1000;

                updatedTimers[business.id] = {
                    progress,
                    timeLeft: timeLeft.toFixed(1),
                    ready: progress >= 1 || business.readyForCollection
                };
            });

            setBusinessTimers(updatedTimers);
        }, 50); // More frequent updates for smoother animation

        return () => clearInterval(interval);
    }, [businesses]);

    // Helper function to calculate business cost
    const calculateCost = (business) => {
        const baseCost = typeof business.baseCost === 'bigint'
            ? business.baseCost
            : BigInt(business.baseCost);
        return baseCost * (5n ** BigInt(business.level));
    };

    // Helper function to calculate upgrade cost
    const calculateUpgradeCost = (business) => {
        if (business.level === 0) return 0n;
        const baseCost = typeof business.baseCost === 'bigint'
            ? business.baseCost
            : BigInt(business.baseCost);
        return baseCost * (10n ** BigInt(business.level));
    };

    // Helper function to calculate business profit
    const calculateProfit = (business) => {
        if (business.level === 0) return 0n;
        const baseProfit = typeof business.baseProfit === 'bigint'
            ? business.baseProfit
            : BigInt(business.baseProfit);
        return baseProfit * (2n ** BigInt(business.level - 1));
    };

    const canAffordBusiness = (business) => {
        const cost = calculateCost(business);
        return typeof currency === 'bigint'
            ? currency >= cost
            : BigInt(currency.toString()) >= cost;
    };

    const canAffordUpgrade = (business) => {
        if (business.level === 0) return false;
        const cost = calculateUpgradeCost(business);
        return typeof currency === 'bigint'
            ? currency >= cost
            : BigInt(currency.toString()) >= cost;
    };

    // Handle clicking with visual feedback
    const handleClick = (e) => {
        dispatch(addClickThunk());

        // Hide the click prompt once the user clicks
        setShowClickPrompt(false);

        // Create visual feedback
        const clickPos = { x: e.clientX, y: e.clientY };
        const id = Date.now();

        setClickFeedback({
            id,
            pos: clickPos,
            value: `+${clickValue}`
        });

        // Remove feedback after animation
        setTimeout(() => {
            setClickFeedback(null);
        }, 1000);
    };

    // Handle business clicks
    const handleBusinessClick = (e, business) => {
        e.stopPropagation(); // Prevent the click area from also triggering

        if (business.level === 0) return; // Cannot click on locked businesses

        const timer = businessTimers[business.id];
        const isReady = timer && timer.ready;

        if (isReady) {
            // Call collectProfit action and check if it was successful
            dispatch(collectProfit(business.id));

            // Create visual feedback for profit collection
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };

            const profit = calculateProfit(business);

            setBusinessFeedback({
                id: Date.now(),
                pos: clickPos,
                businessId: business.id,
                value: `+${formatCurrency(profit)}`
            });

            // Remove feedback after animation
            setTimeout(() => {
                setBusinessFeedback(feedbackState =>
                    feedbackState && feedbackState.businessId === business.id ? null : feedbackState
                );
            }, 1000);
        }
    };

    const handleToggleManagersModal = () => {
        dispatch(toggleManagersModal());
    };

    const handleTogglePowerUpModal = () => {
        dispatch(togglePowerUpModal());
    };

    return (
        <div className="game-container">
            {/* Sidebar */}
            <div className="game-sidebar">
                <div className="player-info">
                    <div className="player-avatar">
                        <img src="/avatar-placeholder.svg" alt="Player Avatar" />
                    </div>
                    <div className="player-stats">
                        <div>Player</div>
                        <div>Level 1</div>
                    </div>
                </div>

                <div className="menu-item menu-item-active">
                    <span>Swag & Stats</span>
                </div>
                <div className="menu-item">
                    <span>Unlocks</span>
                </div>
                <div className="menu-item">
                    <span>Upgrades</span>
                </div>
                <div className="menu-item" onClick={handleToggleManagersModal}>
                    <span>Managers</span>
                    {Object.values(businesses).some(b => b.level > 0 && !b.hasManager) && (
                        <div className="menu-item-badge">!</div>
                    )}
                </div>
                <div className="menu-item">
                    <span>Investors</span>
                </div>
                <div className="menu-item">
                    <span>Packs & More!</span>
                    <div className="menu-item-badge">!</div>
                </div>
                <div className="menu-item">
                    <span>Shop</span>
                    <div className="menu-item-badge">Sale!</div>
                </div>
            </div>

            {/* Header */}
            <div className="game-header">
                <div className="currency-display">
                    <div className="currency-item">
                        <span className="currency-icon">💰</span>
                        <span>{formatCurrency(currency)}</span>
                    </div>
                    <div className="currency-item">
                        <span className="currency-icon">👆</span>
                        <span>+{clickValue} per click</span>
                    </div>
                    <div className="currency-item">
                        <span className="currency-icon">⏱️</span>
                        <span>+{idleRate} per second</span>
                    </div>
                </div>

                <div className="player-actions">
                    <button className="click-button" onClick={handleClick}>Click for Profit!</button>
                </div>
            </div>

            {/* Click area for earning currency */}
            <div className="click-area" onClick={handleClick}>
                {showClickPrompt && (
                    <div className="click-prompt">
                        <div className="click-icon">👆</div>
                        <div className="click-text">Click anywhere to earn money!</div>
                    </div>
                )}

                {clickFeedback && (
                    <div
                        className="click-feedback"
                        style={{
                            position: 'absolute',
                            left: `${clickFeedback.pos.x}px`,
                            top: `${clickFeedback.pos.y}px`,
                            color: theme.accent
                        }}
                    >
                        {clickFeedback.value}
                    </div>
                )}

                {businessFeedback && (
                    <div
                        className="click-feedback business-feedback"
                        style={{
                            position: 'absolute',
                            left: `${businessFeedback.pos.x}px`,
                            top: `${businessFeedback.pos.y}px`,
                            color: theme.accent
                        }}
                    >
                        {businessFeedback.value}
                    </div>
                )}
            </div>

            {/* Gift notification */}
            <div className="gift-box">
                <div className="gift-icon">🎁</div>
                <div className="gift-info">
                    <div className="gift-label">Daily Gift</div>
                    <div className="gift-timer">{remainingTime}</div>
                </div>
                <button className="gift-button">Open!</button>
                <button className="gift-button">?</button>
            </div>

            {/* Game content */}
            <div className="game-content">
                {Object.values(businesses).map(business => {
                    const timer = businessTimers[business.id] || { progress: 0, timeLeft: business.productionTime, ready: false };
                    const isReady = timer.ready && business.level > 0;
                    const hasManager = business.hasManager;

                    return (
                        <div className={`business-item ${isReady ? 'business-ready' : ''}`} key={business.id}>
                            <div className="business-header">
                                <div className="business-amount">{formatCurrency(calculateProfit(business))}</div>
                                <div>{business.level > 0 ? 'profit per click' : 'locked'}</div>
                                {hasManager && <div className="manager-indicator">👨‍💼 Auto</div>}
                            </div>
                            <div className="business-content">
                                <div
                                    className={`business-icon ${isReady ? 'icon-ready' : ''} ${business.level > 0 ? 'clickable' : ''}`}
                                    onClick={(e) => handleBusinessClick(e, business)}
                                >
                                    {business.icon}
                                </div>
                                <div className="business-info">
                                    <div className="business-name">{business.name}</div>
                                    <div className="business-production">Level {business.level}</div>
                                    {business.level > 0 && (
                                        <div className="progress-bar-container">
                                            <div
                                                className={`progress-bar-fill ${isReady ? 'ready' : ''}`}
                                                style={{ width: `${timer.progress * 100}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="business-footer">
                                {business.level === 0 ? (
                                    <>
                                        <div className="business-cost">
                                            <span>{formatCurrency(calculateCost(business))}</span>
                                        </div>
                                        <div className="business-timer">00:00:00</div>
                                        <button
                                            className={`buy-button ${canAffordBusiness(business) ? '' : 'disabled'}`}
                                            onClick={() => dispatch(purchaseBusiness(business.id))}
                                            disabled={!canAffordBusiness(business)}
                                        >
                                            Buy x1
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="business-cost">
                                            <span>{formatCurrency(calculateUpgradeCost(business))}</span>
                                        </div>
                                        <div className={`business-timer ${isReady ? 'timer-ready' : ''}`}>
                                            {isReady ? 'Ready!' : `${timer.timeLeft}s`}
                                        </div>
                                        <button
                                            className={`upgrade-button ${canAffordUpgrade(business) ? '' : 'disabled'}`}
                                            onClick={() => dispatch(upgradeBusinessLevel(business.id))}
                                            disabled={!canAffordUpgrade(business)}
                                        >
                                            Upgrade
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="game-footer">
                <div className="footer-actions">
                    <button className="adventures-button">Profit Pilgrim</button>
                    <button className="launch-button">Launch!</button>
                </div>
            </div>

            {/* Global timer */}
            <div className="global-timer">{remainingTime}</div>

            {/* Power Up Modal if open */}
            {powerUpModalOpen && (
                <div className="power-up-modal" onClick={handleTogglePowerUpModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Power Ups</h2>
                            <button className="modal-close" onClick={handleTogglePowerUpModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Special power ups coming soon!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Managers Modal if open */}
            {managersModalOpen && (
                <div className="power-up-modal" onClick={handleToggleManagersModal}>
                    <ManagersModal onClose={handleToggleManagersModal} />
                </div>
            )}
        </div>
    );
}

export default MainLayout; 