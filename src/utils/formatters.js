/**
 * Format a BigInt currency value to a readable string
 * @param {BigInt|string} value 
 * @returns {string}
 */
export function formatCurrency(value) {
    // Make sure we're working with a BigInt
    let bigIntValue;
    try {
        if (typeof value === 'string') {
            bigIntValue = BigInt(value);
        } else if (typeof value === 'bigint') {
            bigIntValue = value;
        } else if (value && typeof value.toString === 'function') {
            bigIntValue = BigInt(value.toString());
        } else {
            return '0';
        }
    } catch (e) {
        console.warn('Error converting value to BigInt:', e);
        return '0';
    }

    const stringValue = bigIntValue.toString();

    if (bigIntValue < 1000n) {
        return stringValue;
    }

    const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
    const unitSize = 3;

    const exponent = Math.min(Math.floor(stringValue.length / unitSize), units.length - 1);
    const divisor = Math.pow(10, exponent * unitSize);

    // Use string manipulation for very large values that would lose precision
    if (stringValue.length > 15) {
        const wholePartLength = stringValue.length - (exponent * unitSize);
        const wholePart = stringValue.substring(0, wholePartLength);
        const decimalPart = stringValue.substring(wholePartLength, wholePartLength + 1);
        return `${wholePart}.${decimalPart}${units[exponent]}`;
    }

    // For smaller values, we can safely convert to Number
    const shortenedValue = Number(bigIntValue) / divisor;
    return shortenedValue.toFixed(1) + units[exponent];
} 