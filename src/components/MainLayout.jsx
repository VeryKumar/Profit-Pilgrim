import { useStore } from '../stores/store';
import { formatCurrency } from '../utils/formatters';
import { useStage } from '../contexts/StageContext';
import { useEffect, useState } from 'react';

function MainLayout() {
    const powerUpModalOpen = useStore(state => state.powerUpModalOpen);
    const togglePowerUpModal = useStore(state => state.togglePowerUpModal);
    const currency = useStore(state => state.currency);
    const businesses = useStore(state => state.businesses || {});
    const purchaseBusiness = useStore(state => state.purchaseBusiness);
    const addClick = useStore(state => state.addClick);
    const clickValue = useStore(state => state.clickValue);
    const idleRate = useStore(state => state.idleRate);
    const [remainingTime, setRemainingTime] = useState('00:00:00');
    const [clickFeedback, setClickFeedback] = useState(null);
    const [businessTimers, setBusinessTimers] = useState({});
    const [showClickPrompt, setShowClickPrompt] = useState(true);
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

                const timeSinceProduction = (now - business.lastProduction) / 1000;
                const cycleTime = business.productionTime;
                const progress = Math.min(timeSinceProduction / cycleTime, 1);
                const timeLeft = Math.max(0, cycleTime - timeSinceProduction);

                updatedTimers[business.id] = {
                    progress,
                    timeLeft: timeLeft.toFixed(1),
                    ready: progress >= 1
                };
            });

            setBusinessTimers(updatedTimers);
        }, 100);

        return () => clearInterval(interval);
    }, [businesses]);

    // Helper function to calculate business cost
    const calculateCost = (business) => {
        const baseCost = typeof business.baseCost === 'bigint'
            ? business.baseCost
            : BigInt(business.baseCost);
        return baseCost * (5n ** BigInt(business.level));
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

    // Handle clicking with visual feedback
    const handleClick = (e) => {
        addClick();

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
                <div className="menu-item">
                    <span>Managers</span>
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

                    return (
                        <div className={`business-item ${isReady ? 'business-ready' : ''}`} key={business.id}>
                            <div className="business-header">
                                <div className="business-amount">{formatCurrency(calculateProfit(business))}</div>
                                <div>{business.level > 0 ? 'profit per cycle' : 'locked'}</div>
                            </div>
                            <div className="business-content">
                                <div className={`business-icon ${isReady ? 'icon-ready' : ''}`}>{business.icon}</div>
                                <div className="business-info">
                                    <div className="business-name">{business.name}</div>
                                    <div className="business-production">Level {business.level}</div>
                                    {business.level > 0 && (
                                        <div className="progress-bar-container">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${timer.progress * 100}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="business-footer">
                                <div className="business-cost">
                                    <span>{formatCurrency(calculateCost(business))}</span>
                                </div>
                                <div className={`business-timer ${isReady ? 'timer-ready' : ''}`}>
                                    {business.level > 0
                                        ? isReady
                                            ? 'Ready!'
                                            : `${timer.timeLeft}s`
                                        : '00:00:00'}
                                </div>
                                <button
                                    className={`buy-button ${canAffordBusiness(business) ? '' : 'disabled'}`}
                                    onClick={() => purchaseBusiness(business.id)}
                                    disabled={!canAffordBusiness(business)}
                                >
                                    Buy x1
                                </button>
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
                <div className="power-up-modal" onClick={togglePowerUpModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Power Ups</h2>
                            <button className="modal-close" onClick={togglePowerUpModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Special power ups coming soon!</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainLayout; 