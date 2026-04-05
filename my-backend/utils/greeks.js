const greeks = require('greeks');

exports.calculateOptionGreeks = (spot, strike, expiryDays, iv, rate = 0.07, type) => {
    try {
        const t = (expiryDays > 0 ? expiryDays : 0.5) / 365;
        const sigma = (iv > 0 ? iv : 15) / 100;

        const delta = greeks.getDelta(spot, strike, t, sigma, rate, type) || 0;
        const theta = greeks.getTheta(spot, strike, t, sigma, rate, type) || 0;
        const gamma = greeks.getGamma(spot, strike, t, sigma, rate) || 0;
        const vega = greeks.getVega(spot, strike, t, sigma, rate) || 0;

        return {
            delta: delta.toFixed(2),
            theta: (theta / 365).toFixed(2),
            gamma: gamma.toFixed(4),
            vega: vega.toFixed(2)
        };
    } catch (err) {
        return { delta: "0", theta: "0", gamma: "0", vega: "0" };
    }
};

