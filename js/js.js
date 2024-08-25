const API_KEY = 'LVFpDNvtbT0r7'; // Erstat med din API-nøgle

async function getCarbonIntensity(state) {
    try {
        const response = await fetch(`https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${state}`, {
            headers: {
                'auth-token': API_KEY // Brug API_KEY her
            }
        });
        if (!response.ok) {
            throw new Error(`Netværksrespons var ikke ok: ${response.statusText}`);
        }
        const data = await response.json();
        return data.carbonIntensity; // Returner carbon intensity
    } catch (error) {
        console.error('Der var et problem med fetch operationen:', error);
        return null;
    }
}

function formatHoursToDays(hours) {
    if (hours >= 1000) {
        const days = hours / 24;
        return `${days.toFixed(2)} dage`;
    }
    return `${hours.toFixed(2)} timer`;
}

function formatNumber(num) {
    return new Intl.NumberFormat('da-DK').format(num); // Formatér tallet til dansk format
}

async function calculateCO2() {
    const monthlyUsage = document.getElementById('monthlyUsage').value;
    const model = document.getElementById('modelSelect').value; // Hent valgt model
    const states = ['US-CAL-CISO-fjern', 'US-MIDA-PJM-fjern', 'US-TEX-ERCO', 'US-NW-TPWR-fjern'];
    const carbonIntensities = await Promise.all(states.map(getCarbonIntensity));

    const validIntensities = carbonIntensities.filter(intensity => intensity !== null);
    const averageCarbonIntensity = validIntensities.reduce((sum, intensity) => sum + intensity, 0) / validIntensities.length;

    if (isNaN(averageCarbonIntensity)) {
        document.getElementById('result').innerText = 'Kunne ikke hente carbon intensitet. Tjek venligst din API-nøgle og prøv igen.';
        return;
    }

    // EnergiBrug pr Prompt baseret på valgt model
    const kWhPerUse = model === '4' ? 0.19 : 0.019; // 0.19 kWh for ChatGPT-4, 0.019 kWh for ChatGPT-4 Mini
    const totalKWhPerMonth = monthlyUsage * kWhPerUse; // Total kWh pr. måned
    const totalCO2 = (totalKWhPerMonth * averageCarbonIntensity) / 1000; // omdanne til kg CO2
    const yearlyCO2 = totalCO2 * 12; // Beregn CO2 for et år

    // Beregn mobilopladninger
    const kWhPerCharge = 0.015; // kWh pr. mobilopladning
    const chargesPerMonth = totalKWhPerMonth / kWhPerCharge; // Antal opladninger pr. måned
    const chargesPerYear = chargesPerMonth * 12; // Antal opladninger pr. år

    // Beregn årligt vandforbrug
    const waterUsagePerPrompt = 0.5 / 25; // Vandforbrug pr. prompt (0.5 liter / 25 prompts)
    const yearlyWaterUsage = monthlyUsage * waterUsagePerPrompt * 12; // Årligt vandforbrug

    // Beregn timer pæren kan lyse
    const wattage = 7; // Wattforbrug for pæren
    const totalKWh = totalKWhPerMonth; // Total kWh for AI
    const kWhPerHour = wattage / 1000; // Konverterer watt til kWh
    const hoursLight = totalKWh / kWhPerHour; // Timer pæren kan lyse

    // Beregn Google-søgninger
    const kWhPerSearch = 0.0003; // Energi pr. Google-søgning
    const yearlyEnergyUsage = totalKWhPerMonth * 12; // Årligt energiforbrug
    const googleSearches = yearlyEnergyUsage / kWhPerSearch; // Antal Google-søgninger

    // Opdater resultaterne med <span> og klasse
    document.getElementById('result').innerHTML = `Din CO2-udledning er <span class="bold">${totalCO2.toFixed(2)} kg CO2</span> om måneden.`;
    document.getElementById('yearlyResult').innerHTML = `Din CO2-udledning er <span class="bold">${yearlyCO2.toFixed(2)} kg CO2</span> om året.`;
    document.getElementById('chargeResult').innerHTML = `Dette svarer til <span class="bold">${formatNumber(chargesPerYear.toFixed(0))}</span> mobilopladninger om året.`;
    document.getElementById('waterUsageResult').innerHTML = `Årligt vandforbrug til nedkølning af datacentre: <span class="bold">${yearlyWaterUsage.toFixed(2)} liter</span>.`;
    document.getElementById('lightUsageResult').innerHTML = `Pæren kan lyse i <span class="bold">${formatHoursToDays(hoursLight)}</span> baseret på dit AI-forbrug.`;
    document.getElementById('searchResult').innerHTML = `Dette svarer til <span class="bold">${formatNumber(googleSearches.toFixed(0))}</span> Google-søgninger om året 🔍.`; // Ny beregning

    const resultBoxes = document.querySelectorAll('.result-box');
    resultBoxes.forEach(box => {
        box.style.display = 'block';
    });
}

// Lyt efter "input" begivenhed på input-feltet
document.getElementById('monthlyUsage').addEventListener('input', function() {
    calculateCO2(); // Kald beregningsfunktionen
});