import { render } from '@testing-library/react';
import { StageProvider } from '../contexts/StageContext';
import * as storeModule from '../stores/store';
import { vi } from 'vitest';

// Mock StageProvider for tests
const MockStageProvider = ({ children }) => {
    return <div data-testid="mock-stage-provider">{children}</div>;
};

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
    // Mock StageProvider to avoid dependency on the actual store
    vi.mock('../contexts/StageContext', () => ({
        StageProvider: ({ children }) => <MockStageProvider>{children}</MockStageProvider>,
        useStage: () => ({
            currentStage: 'beginning',
            stageName: 'The Journey Begins',
            stageDescription: 'Your first steps on the path to profit',
            theme: {
                primary: '#6366f1',
                secondary: '#4f46e5',
                background: '#f8fafc',
                accent: '#ec4899',
            }
        })
    }));

    return render(ui, options);
}

// Mock implementation of localStorage for tests
export class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }
}

// Helper to create a mock BigInt for tests
export function mockBigInt(value) {
    return BigInt(value);
} 