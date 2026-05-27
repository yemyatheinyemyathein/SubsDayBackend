"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCurrency = exports.getExchangeRates = void 0;
const BASE_URL = 'https://v6.exchangerate-api.com/v6';
let cache = null;
const CACHE_DURATION = 3600000; // 1 hour
const getExchangeRates = async (baseCurrency = 'USD') => {
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        return cache.rates;
    }
    try {
        const response = await fetch(`${BASE_URL}/${process.env.EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`);
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        cache = { rates: data.conversion_rates, timestamp: Date.now() };
        return cache.rates;
    }
    catch {
        // Fallback rates if API fails
        return {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149.5,
            CAD: 1.36,
            AUD: 1.53,
            CHF: 0.88,
            CNY: 7.24,
            INR: 83.12,
            BRL: 4.97,
        };
    }
};
exports.getExchangeRates = getExchangeRates;
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency)
        return amount;
    const rates = await (0, exports.getExchangeRates)('USD');
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    return (amount / fromRate) * toRate;
};
exports.convertCurrency = convertCurrency;
//# sourceMappingURL=currency.js.map