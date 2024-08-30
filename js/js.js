const PUE = 1.125; // Gennemsnitlig PUE for Microsoft Azure-datacentre
let carbonIntensity = 403; // Definer en variabel til carbon intensitet

// Funktion til at opdatere carbon intensitet
function updateCarbonIntensity(newIntensity) {
    carbonIntensity = newIntensity; // Opdater carbon intensitet
}

function formatHoursToDays(hours) {
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;

    if (years > 0) {
        return `${years} år og ${remainingDays} dage`;
    } else {
        return `${days} dage`;
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat('da-DK').format(num); // Formatér tallet til dansk format
}

async function calculateCO2() {
    const monthlyUsage = document.getElementById('monthlyUsage').value;
    const model = document.getElementById('modelSelect').value; // Hent valgt model
    const generationType = document.getElementById('generationTypeSelect').value; // Hent valgt genereringstype
    const months = document.getElementById('monthRange').value; // Hent valgt antal måneder

    // Tjek om carbon intensity er sat
    if (carbonIntensity === 0) {
        document.getElementById('result').innerText = 'Carbon intensitet er ikke sat. Opdater venligst carbon intensitet.';
        return;
    }

    // EnergiBrug pr Prompt baseret på valgt model og genereringstype
    let kWhPerUse;
    if (generationType === 'image') {
        kWhPerUse = 2.907; // 2.907 kWh for billedgenerering
    } else {
        kWhPerUse = model === '4' ? 0.04845 : 0.0004845; // 0.04845 kWh for ChatGPT-4, 0.0004845 kWh for ChatGPT-4 Mini
    }

    const totalKWhPerMonth = monthlyUsage * kWhPerUse * PUE; // Juster total kWh pr. måned med PUE
    const totalCO2 = (totalKWhPerMonth * carbonIntensity) / 1000; // omdanne til kg CO2
    const totalCO2ForMonths = totalCO2 * months; // Beregn CO2 for det valgte antal måneder

    // Beregn mobilopladninger
    const kWhPerCharge = 0.015; // kWh pr. mobilopladning
    const chargesPerMonth = totalKWhPerMonth / kWhPerCharge; // Antal opladninger pr. måned
    const chargesForMonths = chargesPerMonth * months; // Antal opladninger for det valgte antal måneder

    // Beregn årligt vandforbrug
    const waterUsagePerPrompt = 0.5 / 25; // Vandforbrug pr. prompt (0.5 liter / 25 prompts)
    const yearlyWaterUsage = monthlyUsage * waterUsagePerPrompt * 12; // Årligt vandforbrug
    const waterUsageForMonths = (yearlyWaterUsage / 12) * months; // Vandforbrug for det valgte antal måneder

    // Beregn timer pæren kan lyse
    const wattage = 7; // Wattforbrug for pæren
    const totalKWh = totalKWhPerMonth * months; // Total kWh for AI over det valgte antal måneder
    const kWhPerHour = wattage / 1000; // Konverterer watt til kWh
    const hoursLight = totalKWh / kWhPerHour; // Timer pæren kan lyse

    // Beregn Google-søgninger
    const kWhPerSearch = 0.0003; // Energi pr. Google-søgning
    const yearlyEnergyUsage = totalKWhPerMonth * 12; // Årligt energiforbrug
    const googleSearches = (yearlyEnergyUsage / kWhPerSearch) * (months / 12); // Antal Google-søgninger for det valgte antal måneder

    // Opdater resultaterne med <span> og klasse
    document.getElementById('result').innerHTML = `Din CO2-udledning er <span class="bold">${totalCO2ForMonths.toFixed(2)} kg CO2</span> for ${months} måned${months > 1 ? 'er' : ''}.`;
    document.getElementById('yearlyResult').innerHTML = `Din CO2-udledning er <span class="bold">${(totalCO2 * 12).toFixed(2)} kg CO2</span> om året.`;
    document.getElementById('chargeResult').innerHTML = `Dette svarer til <span class="bold">${formatNumber(chargesForMonths.toFixed(0))}</span> mobilopladninger for ${months} måned${months > 1 ? 'er' : ''}.`;
    document.getElementById('waterUsageResult').innerHTML = `Vandforbrug til nedkølning af datacentre for ${months} måned${months > 1 ? 'er' : ''}: <span class="bold">${waterUsageForMonths.toFixed(2)} liter</span>.`;
    document.getElementById('lightUsageResult').innerHTML = `Pæren kan lyse i <span class="bold">${formatHoursToDays(hoursLight)}</span> baseret på dit AI-forbrug.`;
    document.getElementById('searchResult').innerHTML = `Dette svarer til <span class="bold">${formatNumber(googleSearches.toFixed(0))}</span> Google-søgninger for ${months} måned${months > 1 ? 'er' : ''} 🔍.`; // Ny beregning

    const resultBoxes = document.querySelectorAll('.result-box');
    resultBoxes.forEach(box => {
        box.style.display = 'block';
    });

    // Call the function to generate the shareable link
    generateShareableLink(monthlyUsage, model, months);
}

function generateShareableLink(monthlyUsage, model, months) {
    const shareableLink = `https://aicarboncalc.com/estimation?monthlyUsage=${encodeURIComponent(monthlyUsage)}&model=${encodeURIComponent(model)}&months=${encodeURIComponent(months)}`;
    
    // Display the link to the user or copy it to clipboard
    const shareLinkButton = document.getElementById('shareLinkButton');
    shareLinkButton.onclick = function() {
        navigator.clipboard.writeText(shareableLink).then(() => {
            alert('Link kopieret til udklipsholder!');
        });
    };
    
    // Show the share link button
    shareLinkButton.style.display = 'block'; // Show the button after calculation
}

// Hide the share link button before calculation
document.getElementById('calculateButton').addEventListener('click', function() {
    document.getElementById('shareLinkButton').style.display = 'none'; // Hide the button before calculation
});

// Lyt efter "input" begivenhed på input-feltet
document.getElementById('monthlyUsage').addEventListener('input', function() {
    const maxLength = 15; // Sæt den ønskede maksimum længde
    if (this.value.length > maxLength) {
        this.value = this.value.slice(0, maxLength); // Skær inputtet til maksimum længden
    }
    calculateCO2(); // Kald beregningsfunktionen
});

// Opdater månedsværdi, når slideren ændres
document.getElementById('monthRange').addEventListener('input', function() {
    const monthValue = document.getElementById('monthValue');
    monthValue.innerText = `${this.value} måned${this.value > 1 ? 'er' : ''}`;
    calculateCO2(); // Kald beregningsfunktionen
});

// Lyt efter ændringer i model og genereringstype
document.getElementById('modelSelect').addEventListener('change', calculateCO2);
document.getElementById('generationTypeSelect').addEventListener('change', calculateCO2);

// Eksempel på at opdatere carbon intensitet
updateCarbonIntensity(403); // Sæt carbon intensitet til 403 gCO2/kWh (opdater dette tal månedligt)
