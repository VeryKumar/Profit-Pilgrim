import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, cleanup, render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import clickerReducer from '../slices/clickerSlice';
import businessReducer from '../slices/businessSlice';
import App from '../App';
import * as StageContextModule from '../contexts/StageContext';

// Mock the StageContext
vi.mock('../contexts/StageContext', () => ({
    StageProvider: ({ children }) => children,
    useStage: vi.fn()
}));

// Mock timers for testing
vi.useFakeTimers();

describe('Gameplay Integration Tests', () => {
    let store;
    const mockCheckStageProgress = vi.fn();

    beforeEach(() => {
        // Create a clean store before each test
        store = configureStore({
            reducer: {
                clicker: clickerReducer,
                business: businessReducer
            },
            preloadedState: {
                clicker: {
                    currency: 10n,
                    clickValue: 1n,
                    idleRate: 0n
                },
                business: {
                    businesses: {
                        farm: {
                            id: 'farm',
                            name: 'Small Farm',
                            description: 'A small but productive farm',
                            icon: '🌱',
                            baseCost: 10n,
                            baseProfit: 1n,
                            level: 0,
                            productionTime: 1,
                            lastProduction: Date.now()
                        }
                    }
                }
            }
        });

        // Mock the StageContext
        StageContextModule.useStage.mockReturnValue({
            currentStage: 'beginning',
            stageName: 'The Journey Begins',
            stageDescription: 'Your first steps on the path to profit',
            theme: {
                primary: '#6366f1',
                secondary: '#4f46e5',
                background: '#f8fafc',
                accent: '#ec4899',
            },
            checkStageProgress: mockCheckStageProgress
        });
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('simulates a basic game session', () => {
        // Render the app with the test store
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        // Initial state: 10 currency
        expect(store.getState().clicker.currency).toBe(10n);
        expect(store.getState().business.businesses.farm.level).toBe(0);

        // Click the button to earn currency
        const clickButton = screen.getByText('Click for Profit!');
        fireEvent.click(clickButton);

        // Should have 11 currency after clicking
        expect(store.getState().clicker.currency).toBe(11n);

        // Purchase the farm
        const buyButton = screen.getByText('Buy x1');
        fireEvent.click(buyButton);

        // Should have spent 10 currency, and have 1 remaining
        expect(store.getState().clicker.currency).toBe(1n);
        expect(store.getState().business.businesses.farm.level).toBe(1);

        // Advance time to trigger business production
        vi.advanceTimersByTime(1000);

        // Should have earned 1 currency from the business
        expect(store.getState().clicker.currency).toBe(2n);

        // Click a few more times
        fireEvent.click(clickButton);
        fireEvent.click(clickButton);

        // Should now have 4 currency (2 + 2 clicks)
        expect(store.getState().clicker.currency).toBe(4n);

        // Advance time again for more business production
        vi.advanceTimersByTime(3000);

        // Should have earned 3 more currency from business (1 per second)
        expect(store.getState().clicker.currency).toBe(7n);

        // Verify stage progress was checked
        expect(mockCheckStageProgress).toHaveBeenCalled();

        // Test a longer production cycle
        const startCurrency = store.getState().clicker.currency;
        vi.advanceTimersByTime(10000);
        const endCurrency = store.getState().clicker.currency;

        // Currency should increase after production cycles
        expect(endCurrency).toBeGreaterThan(startCurrency);
    });
}); 