import { describe, it, expect, vi } from 'vitest';
import { formatCurrency } from '../utils/formatters';

describe('formatCurrency', () => {
    // Mock console.warn to prevent test output pollution
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    it('handles small BigInt values (less than 1000)', () => {
        expect(formatCurrency(0n)).toBe('0');
        expect(formatCurrency(1n)).toBe('1');
        expect(formatCurrency(999n)).toBe('999');
    });

    it('formats thousand values with K suffix', () => {
        expect(formatCurrency(1000n)).toBe('1.0K');
        expect(formatCurrency(1500n)).toBe('1.5K');
        expect(formatCurrency(9999n)).toBe('10.0K');
    });

    it('formats million values with M suffix', () => {
        expect(formatCurrency(1_000_000n)).toBe('1.0M');
        expect(formatCurrency(1_500_000n)).toBe('1.5M');
    });

    it('formats billion values with B suffix', () => {
        expect(formatCurrency(1_000_000_000n)).toBe('1.0B');
    });

    it('formats trillion values with T suffix', () => {
        expect(formatCurrency(1_000_000_000_000n)).toBe('1.0T');
    });

    it('handles string inputs', () => {
        expect(formatCurrency('1000')).toBe('1.0K');
        expect(formatCurrency('1000000')).toBe('1.0M');
    });

    it('handles very large numbers', () => {
        const largeNumber = 10n ** 30n; // 1 nonillion
        expect(formatCurrency(largeNumber)).toContain('1.0');
    });

    it('returns 0 for invalid inputs', () => {
        // These should not throw errors
        expect(formatCurrency(null)).toBe('0');
        expect(formatCurrency(undefined)).toBe('0');

        // This would normally throw an error but our function should handle it
        expect(formatCurrency('invalid')).toBe('0');

        // Verify console.warn was called for error case
        expect(console.warn).toHaveBeenCalled();
    });
}); 