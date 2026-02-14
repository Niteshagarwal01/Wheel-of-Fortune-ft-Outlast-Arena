const iterations = 10000;
const results = {
    '5% OFF': 0,
    '10% OFF': 0,
    'BETTER LUCK': 0,
    'EXTRA CHANCE': 0
};

console.log(`Running simulation for ${iterations} spins...\n`);

for (let i = 0; i < iterations; i++) {
    const rand = Math.random() * 100;
    let targetType = '';

    if (rand < 30) targetType = '5% OFF';           // 0-30 (30%)
    else if (rand < 50) targetType = '10% OFF';     // 30-50 (20%)
    else if (rand < 99) targetType = 'BETTER LUCK'; // 50-99 (49%)
    else targetType = 'EXTRA CHANCE';               // 99-100 (1%)

    results[targetType]++;
}

console.log("--- Results ---");
console.log(`5% OFF:       ${results['5% OFF']} (${(results['5% OFF'] / iterations * 100).toFixed(1)}%)`);
console.log(`10% OFF:      ${results['10% OFF']} (${(results['10% OFF'] / iterations * 100).toFixed(1)}%)`);
console.log(`BETTER LUCK:  ${results['BETTER LUCK']} (${(results['BETTER LUCK'] / iterations * 100).toFixed(1)}%)`);
console.log(`EXTRA CHANCE: ${results['EXTRA CHANCE']} (${(results['EXTRA CHANCE'] / iterations * 100).toFixed(1)}%)`);
