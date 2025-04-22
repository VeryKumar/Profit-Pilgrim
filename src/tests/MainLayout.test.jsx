import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { renderWithProviders } from './utils';
import MainLayout from '../components/MainLayout';
import * as storeModule from '../stores/store';
import * as StageContextModule from '../contexts/StageContext';

// Mock the necessary modules
vi.mock('../stores/store', () => {
    return {
        useStore: vi.fn()
    };
});

vi.mock('../contexts/StageContext', () => ({
    StageProvider: ({ children }) => children,
    useStage: vi.fn()
}));

// Mock formatCurrency to avoid BigInt issues in tests
vi.mock('../utils/formatters', () => ({
    formatCurrency: (value) => '1,000'
}));

describe('MainLayout', () => {
    const mockPurchaseBusiness = vi.fn();
    const mockTogglePowerUpModal = vi.fn();
    const mockAddClick = vi.fn();
    const mockCheckStageProgress = vi.fn();

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        // Default mock implementation for useStore
        storeModule.useStore.mockImplementation(selector => {
            const store = {
                currency: 1000,
                clickValue: 5,
                idleRate: 2,
                powerUpModalOpen: false,
                togglePowerUpModal: mockTogglePowerUpModal,
                addClick: mockAddClick,
                businesses: {
                    farm: {
                        id: 'farm',
                        name: 'Small Farm',
                        description: 'A small but productive farm',
                        icon: '🌱',
                        baseCost: 10,
                        baseProfit: 1,
                        level: 1,
                        productionTime: 1,
                        lastProduction: Date.now(),
                    },
                    cafe: {
                        id: 'cafe',
                        name: 'Coffee Shop',
                        description: 'Brewing profits',
                        icon: '☕',
                        baseCost: 100,
                        baseProfit: 10,
                        level: 0,
                        productionTime: 3,
                        lastProduction: Date.now(),
                    }
                },
                purchaseBusiness: mockPurchaseBusiness
            };
            return selector(store);
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
        vi.restoreAllMocks();
    });

    it('renders the game layout with sidebar, header, content and footer', () => {
        render(<MainLayout />);

        // Check sidebar elements
        expect(screen.getByText('Swag & Stats')).toBeInTheDocument();
        expect(screen.getByText('Upgrades')).toBeInTheDocument();
        expect(screen.getByText('Managers')).toBeInTheDocument();

        // Check header with currency - use getAllByText for text that appears multiple times
        const currencyElements = screen.getAllByText('1,000');
        expect(currencyElements.length).toBeGreaterThan(0);
        expect(screen.getByText('+5 per click')).toBeInTheDocument();

        // Check gift box
        expect(screen.getByText('Daily Gift')).toBeInTheDocument();

        // Check footer
        expect(screen.getByText('Profit Pilgrim')).toBeInTheDocument();
        expect(screen.getByText('Launch!')).toBeInTheDocument();
    });

    it('renders business items', () => {
        render(<MainLayout />);

        // Check business elements
        expect(screen.getByText('Small Farm')).toBeInTheDocument();
        expect(screen.getByText('Coffee Shop')).toBeInTheDocument();

        // Check level display using getAllByText for text that appears multiple times
        const farmLevelElements = screen.getAllByText('Level 1');
        expect(farmLevelElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Level 0')).toBeInTheDocument();
    });

    it('calls purchaseBusiness when buy button is clicked', () => {
        render(<MainLayout />);

        // Find all buy buttons
        const buyButtons = screen.getAllByText('Buy x1');

        // Click the first one (for farm)
        fireEvent.click(buyButtons[0]);

        // Check that purchaseBusiness was called
        expect(mockPurchaseBusiness).toHaveBeenCalledWith('farm');
    });

    it('displays the power-up modal when open', () => {
        // Mock power-up modal open
        storeModule.useStore.mockImplementation(selector => {
            const store = {
                currency: 1000,
                powerUpModalOpen: true,
                togglePowerUpModal: mockTogglePowerUpModal,
                businesses: {
                    farm: {
                        id: 'farm',
                        name: 'Small Farm',
                        icon: '🌱',
                        baseCost: 10,
                        baseProfit: 1,
                        level: 1,
                        productionTime: 1,
                        lastProduction: Date.now(),
                    }
                },
                purchaseBusiness: mockPurchaseBusiness
            };
            return selector(store);
        });

        render(<MainLayout />);

        // Modal should be open
        expect(screen.getByText('Power Ups')).toBeInTheDocument();
        expect(screen.getByText('Special power ups coming soon!')).toBeInTheDocument();

        // Click close button
        fireEvent.click(screen.getByText('×'));

        // Should have called togglePowerUpModal
        expect(mockTogglePowerUpModal).toHaveBeenCalled();
    });

    it('displays timer for business operations', () => {
        render(<MainLayout />);

        // Should show production time for owned business
        expect(screen.getByText('1s')).toBeInTheDocument();
    });

    it('calls addClick when click button is pressed', () => {
        render(<MainLayout />);

        // Find and click the click button
        const clickButton = screen.getByText('Click for Profit!');
        fireEvent.click(clickButton);

        // Check that addClick was called
        expect(mockAddClick).toHaveBeenCalled();
    });

    it('applies the current theme from StageContext', () => {
        // Set a specific theme for testing
        StageContextModule.useStage.mockReturnValue({
            currentStage: 'momentum',
            stageName: 'Building Momentum',
            stageDescription: 'Your business is growing steadily',
            theme: {
                primary: '#14b8a6',
                secondary: '#0d9488',
                background: '#f8fafc',
                accent: '#f97316',
            },
            checkStageProgress: mockCheckStageProgress
        });

        render(<MainLayout />);

        // Check that the stage name is displayed
        expect(screen.getByText('Building Momentum')).toBeInTheDocument();
    });
}); 